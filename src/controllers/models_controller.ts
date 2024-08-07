import Joi from "joi";
import { JoiMiddlewareService } from "../services/joiMiddleware-service";
import { Request, Response } from "express";
import modelsServices from "../services/models-service";
import { IpriceModel } from "../interfaces/i-price-model";
import { Helpers } from "../helpers/helpers";
import { EnumConsoleLogColors } from "../enums/enum-console-log-colors";

class ModelsController {
  constructor() {
    Helpers.consoleLog(
      "~ file: models_controller.ts ~ ModelsController ~ constructor: Inicia",
      EnumConsoleLogColors.INFO
    );
  }

  /**
   *
   *
   * @param {Request} req
   * @param {Response} res
   * @return {*}  {Promise<void>}
   * @memberof ModelsController
   */
  public async calcularPrecioSubscripcion(
    req: Request,
    res: Response
  ): Promise<void> {
    Helpers.consoleLog(
      "~ file: models_controller.ts ~ ModelsController ~ calcularPrecioSubscripcion: Inicia",
      EnumConsoleLogColors.INFO
    );

    // Validacion de datos
    let resultadoValidacionError: any = JoiMiddlewareService.validarDatos(
      { prices: Joi.string().required(), fechaActual: Joi.string().required() },
      { prices: req.query.prices, fechaActual: req.query.fechaActual }
    );

    if (resultadoValidacionError) {
      Helpers.consoleLog(
        "file: models_controller.ts ~ ModelsController ~ calcularPrecioSubscripcion: Error en la validacion con Joi: ",
        EnumConsoleLogColors.ERROR,
        [resultadoValidacionError]
      );
      // Si hay errores de validación, enviar una respuesta de error
      return res
        .status(400)
        .json({ error: resultadoValidacionError.details[0].message }) as any;
    }

    let prices: IpriceModel[] = (
      JSON.parse(req.query.prices as string) as string[]
    ).map((d: string) => {
      let res = null;

      try {
        res = JSON.parse(d);
      } catch (error) {
        res = d;
      }

      return res;
    });
    let fechaActual: Date = new Date(req.query.fechaActual as string);
    let preciosCalculados: (number | undefined)[] = [];

    for (const price of prices) {
      let precio: number | undefined = modelsServices.calculoPrecioSubscripcion(
        price,
        fechaActual
      );

      preciosCalculados.push(precio);
    }

    res.json({
      mensaje: "Precios calculados",
      preciosCalculados,
    });
  }
}

const modelsController = new ModelsController();

export default modelsController;
