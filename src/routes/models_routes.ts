import { Router } from "express";
import { environment } from "../environment";
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
    const modelsApi: string = environment.urlModelsApi;

    // GET
    this.router.get(
      `/${modelsApi}/obtener-precios`,
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
