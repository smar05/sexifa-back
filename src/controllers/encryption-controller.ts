import { NextFunction, Request, Response } from "express";
import encryptionService from "../services/encryption.service";
import { Helpers } from "../helpers/helpers";
import { EnumConsoleLogColors } from "../enums/enum-console-log-colors";
import { environment } from "../environment";

class EncryptionController {
  constructor() {
    Helpers.consoleLog(
      "~ file: encryption-controller.ts ~ EncryptionController ~ constructor: Inicia",
      EnumConsoleLogColors.INFO
    );
  }

  public desencriptarDatos(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    if (
      req.url.includes(
        `/v${environment.version}/api/epayco-trans/confirmacion`
      ) &&
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
