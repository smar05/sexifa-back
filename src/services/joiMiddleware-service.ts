import Joi from "joi";

export class JoiMiddlewareService {
  /**
   * Middleware de validación con Joi
   *
   * @param {object | any} camposAValidar
   * @param {{ [key: string]: any }} datosAValidar
   * @return {*}  {(Joi.ValidationError | undefined)}
   * @memberof JoiMiddlewareService
   */
  static validarDatos(
    camposAValidar: object | any,
    datosAValidar: { [key: string]: any }
  ): Joi.ValidationError | undefined {
    console.log(
      "🚀 ~ file: joiMiddleware-service.ts ~ JoiMiddlewareService ~ validarDatos: Inicia"
    );

    camposAValidar.auth = Joi.string().required();

    // Define el esquema de validación con Joi
    const schema = Joi.object(camposAValidar);

    // Validar los datos con el esquema Joi
    const resultadoValidacion = schema.validate(datosAValidar);

    // Si hay errores de validación, enviar una respuesta de error
    return resultadoValidacion.error;
  }
}
