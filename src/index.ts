import express, { Application, Request, Response } from "express";
import morgan from "morgan";
import cors from "cors";
import telegramRoutes from "./routes/telegram_routes";
import { environment } from "./environment";
import admin from "firebase-admin";
import userServices from "./services/user-service";
import { Iuser } from "./interfaces/i-user";
import { UserStatusEnum } from "./enums/user-status-enum";
import { IBackLogs } from "./interfaces/i-back-logs";
import backLogsServices from "./services/back-logs-service";
import { VariablesGlobales, setVariablesGlobales } from "./variables-globales";
import models_routes from "./routes/models_routes";

class Server {
  private app: Application;
  private API: string = "/api";
  private bodyParser = require("body-parser");
  private corsOptions: { [key: string]: any } = {
    origin: [environment.frontUrl, ...environment.cors], // o '*' para permitir cualquier origen
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: false, // habilitar el intercambio de cookies entre el cliente y el servidor
  };

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
    this.app.use(cors(this.corsOptions)); // Para que el front pueda pedir los datos al back
    this.app.use(express.json()); // Aceptar formato JSON
    this.app.use(express.urlencoded({ extended: false }));

    this.app.use(this.verifyToken);
    this.app.use(this.verifyUser);
    this.app.use(this.asignarVariablesGlobales);
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

    const token: string = req.query.auth as string;

    admin
      .auth()
      .verifyIdToken(token)
      .then((decodedToken) => {
        console.log(
          "🚀 ~ file: index.ts ~ Server ~ verifyToken: Token verificado"
        );
        req.user = decodedToken;
        next();
      })
      .catch((error) => {
        console.error(
          "🚀 ~ file: index.ts ~ Server ~ verifyToken: Token invalido"
        );

        let { date, userId }: { date: string; userId: string } = req.query;
        let data: IBackLogs = {
          userId,
          date: new Date(date),
          log: `index.ts ~ Server ~ verifyToken ~ JSON.stringify(error): ${JSON.stringify(
            error
          )}`,
        };

        backLogsServices
          .postDataFS(data)
          .then((res) => {})
          .catch((err) => {
            console.log("🚀 ~ Server ~ err:", err);
          });

        console.error(error);

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
    const userId: string = req.query.userId as string;

    let resUser: any = {};
    try {
      console.error(
        "🚀 ~ file: index.ts: ~ Server ~ verifyUser: Consulta del usuario " +
          userId
      );
      resUser = (await userServices.getDataFS().where("id", "==", userId).get())
        .docs[0];
    } catch (error) {
      console.error(
        "🚀 ~ file: index.ts: ~ Server ~ verifyUser: Usuario no encontrado"
      );

      let { date, userId }: { date: string; userId: string } = req.query;
      let data: IBackLogs = {
        date: new Date(date),
        userId,
        log: `file: index.ts: ~ Server ~ verifyUser ~ JSON.stringify(error): ${JSON.stringify(
          error
        )}`,
      };

      backLogsServices
        .postDataFS(data)
        .then((res) => {})
        .catch((err) => {
          console.log("🚀 ~ Server ~ err:", err);
        });

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

    let { date, userId }: { date: string; userId: string } = req.query;
    let vg: VariablesGlobales = {
      date: new Date(date),
      userId: userId,
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
    this.app.use(`${this.API}`, telegramRoutes);
    this.app.use(`${this.API}`, models_routes);
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
