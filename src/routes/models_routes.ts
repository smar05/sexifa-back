import { Router } from "express";
import modelsController from "../controllers/models_controller";

class ModelsRoutes {
  private router: Router = Router();

  constructor() {
    console.log(
      "🚀 ~ file: models_routes.ts ~ ModelsRoutes ~ constructor: Inicia"
    );
    this.config();
  }

  public config(): void {
    console.log("🚀 ~ file: models_routes.ts ~ ModelsRoutes ~ config: Inicia");

    // GET
    this.router.get(
      `/obtener-precios`,
      modelsController.calcularPrecioSubscripcion
    );
  }

  // Getters y Setters
  public getRouter(): Router {
    console.log(
      "🚀 ~ file: models_routes.ts ~ ModelsRoutes ~ getRouter: Inicia"
    );
    return this.router;
  }
}

const modelsRoutes = new ModelsRoutes();

export default modelsRoutes.getRouter();
