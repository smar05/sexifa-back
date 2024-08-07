import Joi from "joi";
import { Helpers } from "../helpers/helpers";
import { EnumConsoleLogColors } from "../enums/enum-console-log-colors";

export class JoiMiddlewareService {
  /**
   * Validacion de los datos obligatorios
   *
   * @static
   * @param {{
   *     [key: string]: any;
   *   }} datosAValidar
   * @return {*}  {(Joi.ValidationError | undefined)}
   * @memberof JoiMiddlewareService
   */
  static validarDatosObligatorios(datosAValidar: {
    [key: string]: any;
  }): Joi.ValidationError | undefined {
    Helpers.consoleLog(
      "~ file: joiMiddleware-service.ts ~ JoiMiddlewareService ~ validarDatosObligatorios: Inicia",
      EnumConsoleLogColors.INFO
    );

    let camposAValidar: any = {};

    camposAValidar.auth = Joi.string().required();
    camposAValidar.date = Joi.string().required();

    // Define el esquema de validación con Joi
    const schema: Joi.ObjectSchema<any> = Joi.object(camposAValidar);

    // Validar los datos con el esquema Joi
    const resultadoValidacion = schema.validate(datosAValidar);

    // Si hay errores de validación, enviar una respuesta de error
    return resultadoValidacion.error;
  }

  /**
   * Middleware de validación con Joi
   *
   * @static
   * @param {(object | any)} camposAValidar
   * @param {{ [key: string]: any }} datosAValidar
   * @param {string} [url=null as any]
   * @param {string} [origin=null as any]
   * @return {*}  {(Joi.ValidationError | undefined)}
   * @memberof JoiMiddlewareService
   */
  static validarDatos(
    camposAValidar: object | any,
    datosAValidar: { [key: string]: any }
  ): Joi.ValidationError | undefined {
    Helpers.consoleLog(
      "~ file: joiMiddleware-service.ts ~ JoiMiddlewareService ~ validarDatos: Inicia",
      EnumConsoleLogColors.INFO
    );

    // Define el esquema de validación con Joi
    const schema = Joi.object(camposAValidar);

    // Validar los datos con el esquema Joi
    const resultadoValidacion = schema.validate(datosAValidar);

    // Si hay errores de validación, enviar una respuesta de error
    return resultadoValidacion.error;
  }
}
