import { Router } from "express";
import modelsController from "../controllers/models_controller";
import { Helpers } from "../helpers/helpers";
import { EnumConsoleLogColors } from "../enums/enum-console-log-colors";

class ModelsRoutes {
  private router: Router = Router();

  constructor() {
    Helpers.consoleLog(
      "~ file: models_routes.ts ~ ModelsRoutes ~ constructor: Inicia",
      EnumConsoleLogColors.INFO
    );
    this.config();
  }

  public config(): void {
    Helpers.consoleLog(
      "~ file: models_routes.ts ~ ModelsRoutes ~ config: Inicia",
      EnumConsoleLogColors.INFO
    );

    // GET
    this.router.get(
      `/obtener-precios`,
      modelsController.calcularPrecioSubscripcion
    );
  }

  // Getters y Setters
  public getRouter(): Router {
    Helpers.consoleLog(
      "~ file: models_routes.ts ~ ModelsRoutes ~ getRouter: Inicia",
      EnumConsoleLogColors.INFO
    );
    return this.router;
  }
}

const modelsRoutes = new ModelsRoutes();

export default modelsRoutes.getRouter();
