import { Router } from "express";
import telegramController from "../controllers/telegram_controller";

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

    // GET
    this.router.get(`/enviar-link`, telegramController.enviarLink);
    this.router.get(
      `/comunicar-bot-cliente`,
      telegramController.comunicarBotCliente
    );
    this.router.get(
      `/es-miembro-del-grupo`,
      telegramController.esMiembroDelGrupo
    );
    this.router.get(
      `/bot-es-admin-del-grupo`,
      telegramController.botEsAdminDelGrupo
    );

    //POST
    this.router.post(`/quitar-acceso`, telegramController.quitarAcceso);
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
