import { NextFunction, Request, Response } from "express";
import encryptionService from "../services/encryption.service";

class EncryptionController {
  constructor() {
    console.log(
      "🚀 ~ file: encryption-controller.ts ~ EncryptionController ~ constructor: Inicia"
    );
  }

  public desencriptarDatos(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    if (
      req.url.includes("/api/epayco-trans/confirmacion") &&
      req.method === "POST"
    )
      return next();

    const auth: string = req.query.auth as any;
    let datosADesencryptar: { [key: string]: string } = null as any;
    let respuesta: { [key: string]: string } = {};

    datosADesencryptar = req.query as any;
    delete datosADesencryptar.auth;

    respuesta = encryptionService.decryptDataJson(datosADesencryptar);

    req.query = { auth, ...respuesta };

    next();
  }
}

const encryptionController = new EncryptionController();

export default encryptionController;
