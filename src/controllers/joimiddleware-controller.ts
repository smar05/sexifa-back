import { NextFunction, Response, Request } from "express";
import { JoiMiddlewareService } from "../services/joiMiddleware-service";
import Joi from "joi";
import { Helpers } from "../helpers/helpers";
import { EnumConsoleLogColors } from "../enums/enum-console-log-colors";

class JoiMiddlewareController {
  constructor() {
    Helpers.consoleLog(
      "~ file: joimiddleware-controller.ts ~ JoiMiddlewareController ~ constructor: Inicia",
      EnumConsoleLogColors.INFO
    );
  }

  /**
   * Validacion de parametros obligatorios
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @return {*}  {void}
   * @memberof JoiMiddlewareController
   */
  public validacionDatosObligatorios(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    let url: string = req.url;
    let origin: string = (req.query.url as string) || (null as any);

    if (
      url?.includes("comunicar-bot-cliente") &&
      origin != "undefined" &&
      origin != "null"
    ) {
      next();
      return;
    }

    let { auth, date } = req.query;

    let resultadoValidacionError: Joi.ValidationError | undefined =
      JoiMiddlewareService.validarDatosObligatorios({ auth, date });

    if (resultadoValidacionError) {
      Helpers.consoleLog(
        "~ JoiMiddlewareController ~ validacionDatosObligatorios ~ resultadoValidacionError: Error en la validacion con Joi: ",
        EnumConsoleLogColors.ERROR,
        [resultadoValidacionError]
      );
      // Si hay errores de validación, enviar una respuesta de error
      return res.status(400).json({
        error: resultadoValidacionError.details[0].message,
      }) as any;
    }

    next();
  }
}

const joiMiddlewareController = new JoiMiddlewareController();

export default joiMiddlewareController;
