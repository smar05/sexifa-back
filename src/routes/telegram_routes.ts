import { Router } from "express";
import telegramController from "../controllers/telegram_controller";
import { environment } from "../../environment";

class TelegramRoutes {
  private router: Router = Router();

  constructor() {
    this.config();
  }

  /**
   * Configuracion de las rutas
   *
   * @memberof TelegramRoutes
   */
  public config(): void {
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

    //POST
    this.router.post(
      `/${telegramApi}/quitar-acceso`,
      telegramController.quitarAcceso
    );
  }

  // Getters y Setters
  public getRouter(): Router {
    return this.router;
  }
}

const telegramRoutes = new TelegramRoutes();

export default telegramRoutes.getRouter();
