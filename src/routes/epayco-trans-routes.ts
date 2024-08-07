import { Router } from "express";
import epaycoTransController from "../controllers/epayco-trans-controller";
import telegramController from "../controllers/telegram_controller";
import { Helpers } from "../helpers/helpers";
import { EnumConsoleLogColors } from "../enums/enum-console-log-colors";

class EpaycoTransRoutes {
  private router: Router = Router();

  constructor() {
    Helpers.consoleLog(
      "~ EpaycoTransRoutes ~ constructor: Inicia",
      EnumConsoleLogColors.INFO
    );
    this.config();
  }

  public config(): void {
    Helpers.consoleLog(
      "~ EpaycoTransRoutes ~ config: Inicia",
      EnumConsoleLogColors.INFO
    );

    // POST
    this.router.post(
      `/confirmacion`,
      epaycoTransController.confirmTransaccion, // Confirmacion de la respuesta recibida por epayco
      telegramController.enviarLink // Generacion de los links de acceso si se confirma epayco
    );
  }

  // Getters y Setters
  public getRouter(): Router {
    Helpers.consoleLog(
      "~ EpaycoTransRoutes ~ getRouter: Inicia",
      EnumConsoleLogColors.INFO
    );
    return this.router;
  }
}

const epaycoTransRoutes = new EpaycoTransRoutes();

export default epaycoTransRoutes.getRouter();
