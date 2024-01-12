import { Router } from "express";
import telegramController from "../controllers/telegram_controller";
import { environment } from "../environment";

class TelegramRoutes {
  private router: Router = Router();

  constructor() {
    console.log(
      "🚀 ~ file: telegram_routes.ts0 ~ TelegramRoutes ~ constructor: Inicia"
    );
    this.config();
  }

  /**
   * Configuracion de las rutas
   *
   * @memberof TelegramRoutes
   */
  public config(): void {
    console.log(
      "🚀 ~ file: telegram_routes.ts ~ TelegramRoutes ~ config: Inicia"
    );
    const telegramApi: string = environment.urlTelegramApi;

    // GET
    this.router.get(
      `/${telegramApi}/enviar-link`,
      telegramController.enviarLink
    );
    this.router.get(
      `/${telegramApi}/comunicar-bot-cliente`,
      telegramController.comunicarBotCliente
    );
    this.router.get(
      `/${telegramApi}/es-miembro-del-grupo`,
      telegramController.esMiembroDelGrupo
    );

    //POST
    this.router.post(
      `/${telegramApi}/quitar-acceso`,
      telegramController.quitarAcceso
    );
  }

  // Getters y Setters
  public getRouter(): Router {
    console.log(
      "🚀 ~ file: telegram_routes.ts ~ TelegramRoutes ~ getRouter: Inicia"
    );
    return this.router;
  }
}

const telegramRoutes = new TelegramRoutes();

export default telegramRoutes.getRouter();
