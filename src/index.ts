import express, { Application, NextFunction, Request, Response } from "express";
import morgan from "morgan";
import cors from "cors";
import telegramRoutes from "./routes/telegram_routes";
import { environment } from "./environment";
import admin from "firebase-admin";
import userServices from "./services/user-service";
import { Iuser } from "./interfaces/i-user";
import { UserStatusEnum } from "./enums/user-status-enum";
import backLogsServices from "./services/back-logs-service";
import { VariablesGlobales, setVariablesGlobales } from "./variables-globales";
import models_routes from "./routes/models_routes";
import { EnumUrlEnpoints } from "./enums/enum-url-enpoints";
import epaycoTransRoutes from "./routes/epayco-trans-routes";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { IEpaycoTransRes } from "./interfaces/i-epayco-trans";
import { setupCommands } from "./services/telegram-bot-command.service";
import { Telegraf } from "telegraf";
import joiMiddlewareController from "./controllers/joimiddleware-controller";
import encryptionController from "./controllers/encryption-controller";

class Server {
  private app: Application;
  private API: string = "/api";
  private bodyParser = require("body-parser");
  private corsOptions: { [key: string]: any } = {
    origin: [environment.frontUrl, ...environment.cors], // o '*' para permitir cualquier origen
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: false, // habilitar el intercambio de cookies entre el cliente y el servidor
  };
  private bot: Telegraf = new Telegraf(environment.tokenTelegraf); // Inicializa Telegraf

  constructor() {
    console.log("🚀 ~ file: index.ts ~ Server ~ constructor: Inicia");
    this.app = express();
    this.app.use(this.bodyParser.json());

    // Se inicializa la configuracion y las rutas
    this.config();
    this.routes();
  }

  /**
   * Configuracion del backend
   *
   * @memberof Server
   */
  public config(): void {
    console.log("🚀 ~ file: index.ts ~ Server ~ config: Inicia");
    this.app.set("port", environment.port || 8080); // Se establece el puerto para el back
    this.app.use(morgan("dev")); // Para mostrar por consola las peticiones http
    this.app.use(express.json()); // Aceptar formato JSON
    this.app.use(express.urlencoded({ extended: false }));

    this.app.use((req: Request, res: Response, next: NextFunction) => {
      console.log("🚀 ~ Server ~ this.app.use ~ req.host:", req.get("host"));

      let endpointComandos: string = `${this.API}/${EnumUrlEnpoints.urlComandosTelegram}`;

      // Comandos desde telegram - no se usan cors
      if (req.url.startsWith(endpointComandos)) {
        console.log("🚀 ~ Server ~ this.app.use ~ req: Endpoint de comandos");
        // No aplicar CORS para el webhook de Telegram
        // Comandos configurados del bot
        setupCommands(this.bot);

        // Configura la ruta para el webhook
        this.app.use(this.bot.webhookCallback(endpointComandos));

        next();
      } else {
        console.log("🚀 ~ Server ~ Endpoint con cors");

        // Configura CORS
        cors(this.corsOptions)(req, res, (err: any) => {
          if (err) {
            return next(err);
          }

          if (
            req.url.includes("/api/epayco-trans/confirmacion") &&
            req.method === "POST"
          ) {
            req.query.auth = (req.query as any).x_extra1;
            req.query.date = (req.query as any).x_extra2;
          }

          joiMiddlewareController.validacionDatosObligatorios(
            req,
            res,
            (err: any) => {
              encryptionController.desencriptarDatos(req, res, (err: any) => {
                // Ejecutar los middlewares de verificación secuencialmente
                this.verifyToken(req, res, (err: any) => {
                  if (err) return next(err);

                  this.verifyUser(req, res, (err: any) => {
                    if (err) return next(err);

                    this.asignarVariablesGlobales(req, res, next);
                  });
                });
              });
            }
          );
        });
      }
    });
  }

  /**
   * Middleware para verificar el token en cada solicitud
   *
   * @private
   * @param {Request} req
   * @param {Response} res
   * @param {*} next
   * @memberof Server
   */
  private verifyToken(req: Request | any, res: Response, next: any): void {
    console.log("🚀 ~ file: index.ts ~ Server ~ verifyToken: Inicia");

    if (
      req.url.includes("comunicar-bot-cliente") &&
      req.method === "GET" &&
      req.query.url === "register"
    ) {
      next();
      return;
    }

    let token: string = null as any;

    if (
      req.url.includes("/api/epayco-trans/confirmacion") &&
      req.method === "POST"
    ) {
      token = (req.query as IEpaycoTransRes).x_extra1;
    } else {
      token = req.query.auth;
    }

    admin
      .auth()
      .verifyIdToken(token)
      .then((decodedToken: DecodedIdToken) => {
        console.log(
          "🚀 ~ file: index.ts ~ Server ~ verifyToken: Token verificado"
        );

        if (!decodedToken.email_verified)
          res.status(401).json({ error: "Token inválido" });

        req.user = decodedToken;
        next();
      })
      .catch((error) => {
        backLogsServices.catchProcessError(
          "🚀 ~ file: index.ts ~ Server ~ verifyToken: Token invalido",
          `index.ts ~ Server ~ verifyToken ~ JSON.stringify(error): ${JSON.stringify(
            error
          )}`
        );

        res.status(401).json({ error: "Token inválido" });
        return;
      });
  }

  /**
   * Verificacion del usuario
   *
   * @private
   * @param {(Request | any)} req
   * @param {Response} res
   * @param {*} next
   * @return {*}  {Promise<void>}
   * @memberof Server
   */
  private async verifyUser(
    req: Request | any,
    res: Response,
    next: any
  ): Promise<void> {
    console.log("🚀 ~ file: index.ts: ~ Server ~ verifyUser: Inicia");

    if (
      req.url.includes("comunicar-bot-cliente") &&
      req.method === "GET" &&
      req.query.url === "register"
    ) {
      next();
      return;
    }

    const userId: string = (req.user as DecodedIdToken).uid as string;

    let resUser: any = {};
    try {
      console.error(
        "🚀 ~ file: index.ts: ~ Server ~ verifyUser: Consulta del usuario " +
          userId
      );
      resUser = (await userServices.getDataFS().where("id", "==", userId).get())
        .docs[0];
    } catch (error) {
      backLogsServices.catchProcessError(
        "🚀 ~ file: index.ts: ~ Server ~ verifyUser: Usuario no encontrado",
        `file: index.ts: ~ Server ~ verifyUser ~ JSON.stringify(error): ${JSON.stringify(
          error
        )}`
      );

      res.status(401).json({ error: "Usuario no encontrado" });

      return;
    }

    if (!resUser) {
      console.error(
        "🚀 ~ file: index.ts: ~ Server ~ verifyUser: Usuario no encontrado"
      );
      res.status(401).json({ error: "Usuario no encontrado" });

      return;
    }

    let user: Iuser = resUser.data();
    user.id = user.id;

    if (!user || !user.id || Object.keys(user).length === 0) {
      console.error(
        "🚀 ~ file: index.ts: ~ Server ~ verifyUser: Usuario invalido"
      );
      res.status(401).json({ error: "Usuario invalido" });
      return;
    }

    // Usuario no activo
    if (user.status !== UserStatusEnum.ACTIVO) {
      console.error(
        "🚀 ~ file: index.ts: ~ Server ~ verifyUser: Usuario no activo"
      );
      res.status(401).json({ error: "Usuario no activo" });
      return;
    }

    next();
  }

  /**
   * Variables para usar globalmente
   *
   * @private
   * @param {(Request | any)} req
   * @param {Response} res
   * @param {*} next
   * @return {*}  {Promise<void>}
   * @memberof Server
   */
  private async asignarVariablesGlobales(
    req: Request | any,
    res: Response,
    next: any
  ): Promise<void> {
    console.log(
      "🚀 ~ file: index.ts: ~ Server ~ asignarVariablesGlobales: Inicia"
    );

    let { date }: { date: string } = req.query;
    let userId: string = (req.user as DecodedIdToken)?.uid || "";
    let email: string = (req.user as DecodedIdToken)?.email || "";
    let vg: VariablesGlobales = {
      date: date ? new Date(date) : (null as any),
      userId: userId,
      email,
    };

    setVariablesGlobales(vg);

    next();
  }

  /**
   * Configuacion de las rutas del backend
   *
   * @memberof Server
   */
  public routes(): void {
    console.log("🚀 ~ file: index.ts ~ Server ~ routes: Inicia");
    this.app.use(
      `${this.API}/${EnumUrlEnpoints.urlTelegramApi}`,
      telegramRoutes
    );
    this.app.use(`${this.API}/${EnumUrlEnpoints.urlModelsApi}`, models_routes);
    this.app.use(
      `${this.API}/${EnumUrlEnpoints.urlEpaycoTrans}`,
      epaycoTransRoutes
    );
  }

  /**
   * Iniciar el backend
   *
   * @memberof Server
   */
  public start(): void {
    console.log("🚀 ~ file: index.ts ~ Server ~ start: Inicia");
    this.app.listen(this.app.get("port"), () => {
      console.log("Server on port: " + this.app.get("port"));
    });
  }
}

const server = new Server();
server.start();
