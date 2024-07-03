import { Router } from "express";
import epaycoTransController from "../controllers/epayco-trans-controller";

class EpaycoTransRoutes {
  private router: Router = Router();

  constructor() {
    console.log("🚀 ~ EpaycoTransRoutes ~ constructor: Inicia");
    this.config();
  }

  public config(): void {
    console.log("🚀 ~ EpaycoTransRoutes ~ config: Inicia");

    // POST
    this.router.post(`/confirmacion`, epaycoTransController.confirmTransaccion);
  }

  // Getters y Setters
  public getRouter(): Router {
    console.log("🚀 ~ EpaycoTransRoutes ~ getRouter: Inicia");
    return this.router;
  }
}

const epaycoTransRoutes = new EpaycoTransRoutes();

export default epaycoTransRoutes.getRouter();
