import Joi from "joi";

export class JoiMiddlewareService {
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
    datosAValidar: { [key: string]: any },
    url: string = null as any,
    origin: string = null as any
  ): Joi.ValidationError | undefined {
    console.log(
      "🚀 ~ file: joiMiddleware-service.ts ~ JoiMiddlewareService ~ validarDatos: Inicia"
    );

    if (!url?.includes("comunicar-bot-cliente") || origin !== "register") {
      camposAValidar.auth = Joi.string().required();
      camposAValidar.userId = Joi.string().required();
      camposAValidar.date = Joi.string().required();
    }

    // Define el esquema de validación con Joi
    const schema = Joi.object(camposAValidar);

    // Validar los datos con el esquema Joi
    const resultadoValidacion = schema.validate(datosAValidar);

    // Si hay errores de validación, enviar una respuesta de error
    return resultadoValidacion.error;
  }
}
