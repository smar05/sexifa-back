import { Router } from "express";
import telegramController from "../controllers/telegram_controller";
import { Helpers } from "../helpers/helpers";
import { EnumConsoleLogColors } from "../enums/enum-console-log-colors";

class TelegramRoutes {
  private router: Router = Router();

  constructor() {
    Helpers.consoleLog(
      "~ file: telegram_routes.ts0 ~ TelegramRoutes ~ constructor: Inicia",
      EnumConsoleLogColors.INFO
    );
    this.config();
  }

  /**
   * Configuracion de las rutas
   *
   * @memberof TelegramRoutes
   */
  public config(): void {
    Helpers.consoleLog(
      "~ file: telegram_routes.ts ~ TelegramRoutes ~ config: Inicia",
      EnumConsoleLogColors.INFO
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
    Helpers.consoleLog(
      "~ file: telegram_routes.ts ~ TelegramRoutes ~ getRouter: Inicia",
      EnumConsoleLogColors.INFO
    );
    return this.router;
  }
}

const telegramRoutes = new TelegramRoutes();

export default telegramRoutes.getRouter();
