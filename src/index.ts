import express, { Application, Request, Response } from "express";
import morgan from "morgan";
import cors from "cors";
import telegramRoutes from "./routes/telegram_routes";
import { environment } from "./environment";
import admin from "firebase-admin";

class Server {
  private app: Application;
  private API: string = "/api";
  private bodyParser = require("body-parser");

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
    this.app.use(cors()); // Para que el front pueda pedir los datos al back
    this.app.use(express.json()); // Aceptar formato JSON
    this.app.use(express.urlencoded({ extended: false }));

    this.app.use(this.verifyToken);
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
        res.status(401).json({ error: "Token inválido" });
      });
  }

  /**
   * Configuacion de las rutas del backend
   *
   * @memberof Server
   */
  public routes(): void {
    console.log("🚀 ~ file: index.ts ~ Server ~ routes: Inicia");
    this.app.use(`${this.API}`, telegramRoutes);
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
