import { Request, Response } from "express";
import telegramServices from "../services/telegram_services";
import ordersServices from "../services/orders-service";
import { Iorders } from "../interfaces/i-orders";
import { StatusOrdersEnum } from "../enums/status-orders-enum";
import { Isubscriptions } from "../interfaces/i-subscriptions";
import subscripcionsServices from "../services/subscriptions-service";
import { StatusSubscriptionsEnum } from "../enums/status-subscriptions-enum";
import modelsServices from "../services/models-service";
import { Imodels } from "../interfaces/i-models";
import userServices from "../services/user-service";
import { Iuser } from "../interfaces/i-user";
import { DocumentSnapshot } from "firebase-admin/firestore";
import { JoiMiddlewareService } from "../services/joiMiddleware-service";
import Joi from "joi";
import backLogsServices from "../services/back-logs-service";
import { variablesGlobales } from "../variables-globales";
import businessParamsService, {
  EnumBusinessParamsKeys,
} from "../services/business-params.service";
import { Helpers } from "../helpers/helpers";
import { EnumConsoleLogColors } from "../enums/enum-console-log-colors";

class TelegramController {
  constructor() {
    Helpers.consoleLog(
      "~ file: telegram_controller.ts ~ TelegramController ~ constructor: Inicia",
      EnumConsoleLogColors.INFO
    );
  }

  /**
   * Enviar link de acceso
   *
   * @param {Request} req
   * @param {Response} res
   * @return {*}  {Promise<void>}
   * @memberof TelegramController
   */
  public async enviarLink(req: Request, res: Response): Promise<void> {
    Helpers.consoleLog(
      "~ file: telegram_controller.ts ~ TelegramController ~ enviarLink: Inicia",
      EnumConsoleLogColors.INFO
    );

    // Validacion de datos
    let resultadoValidacionError: any = JoiMiddlewareService.validarDatos(
      {
        orderId: Joi.string().required(),
      },
      { orderId: req.query.orderId }
    );

    if (resultadoValidacionError) {
      Helpers.consoleLog(
        "~ file: telegram_controller.ts ~ TelegramController ~ enviarLink: Error en la validacion con Joi: ",
        EnumConsoleLogColors.ERROR,
        [resultadoValidacionError]
      );
      // Si hay errores de validación, enviar una respuesta de error
      return res
        .status(400)
        .json({ error: resultadoValidacionError.details[0].message }) as any;
    }

    const orderId: any = req.query.orderId;

    // Obtenemos los datos de la orden
    let res1: DocumentSnapshot | any = null;

    try {
      res1 = await ordersServices.getItemFS(orderId).get();
    } catch (error) {
      backLogsServices.catchProcessError(
        `Error: ${error}`,
        `TelegramController ~ enviarLinkr ~ JSON.stringify(error): ${JSON.stringify(
          error
        )}`
      );

      res.status(500).json({
        error: `Error interno del servidor al consultar la base de datos para la orden ${orderId}`,
      });
    }

    let order: Iorders = res1.data();
    order.id = res1.id;

    // Si no esta en estado pagada
    if (order.status != StatusOrdersEnum.PAGADO) {
      Helpers.consoleLog(
        `~ file: telegram_controller.ts ~ TelegramController ~ enviarLink: La orden ${order.id} no ha sido pagada`,
        EnumConsoleLogColors.ERROR
      );
      res.status(500).json({
        mensaje: "La orden no ha sido pagada",
      });

      return;
    }

    let res4: any = null;

    try {
      res4 = (
        await userServices.getDataFS().where("id", "==", order.userId).get()
      ).docs[0];
    } catch (error) {
      backLogsServices.catchProcessError(
        `Error: ${error}`,
        `TelegramController ~ enviarLink ~ JSON.stringify(error): ${JSON.stringify(
          error
        )}`
      );

      res.status(500).json({
        error: `Error interno del servidor al consultar la base de datos para el usuario ${order.userId}`,
      });
    }

    let user: Iuser = res4.data();
    user.id = res4.id;

    if (!(user && user.chatId)) return;

    // Obtenemos la informacion de las subscripciones de la orden
    let subscriptionsOrder: Isubscriptions[] = [];

    for (const idSubscription of order.ids_subscriptions) {
      let res2: DocumentSnapshot | any = null;

      try {
        res2 = await subscripcionsServices.getItemFS(idSubscription).get();
      } catch (error) {
        backLogsServices.catchProcessError(
          `Error: ${error}`,
          `TelegramController ~ enviarLink ~ JSON.stringify(error): ${JSON.stringify(
            error
          )}`
        );

        res.status(500).json({
          error: `Error interno del servidor al consultar la base de datos para la subscripcion ${idSubscription}`,
        });
      }

      let subscription: Isubscriptions = res2.data();
      subscription.id = res2.id;

      subscriptionsOrder.push(subscription);
    }

    // Obtenemos los modelos de cada grupo de las subscripciones de la orden
    let models: Imodels[] = [];

    for (const subscription of subscriptionsOrder) {
      if (subscription.status == StatusSubscriptionsEnum.PAGADO) {
        let res3: DocumentSnapshot | any = null;

        try {
          res3 = await modelsServices.getItemFS(subscription.modelId).get();
        } catch (error) {
          backLogsServices.catchProcessError(
            `Error: ${error}`,
            `TelegramController ~ enviarLink ~ JSON.stringify(error): ${JSON.stringify(
              error
            )}`
          );

          res.status(500).json({
            error: `Error interno del servidor al consultar la base de datos para la modelo ${subscription.modelId}`,
          });
        }

        let model: Imodels = res3.data();
        model.id = res3.id;

        models.push(model);
      } else {
        continue;
      }
    }

    // Generamos los links de acceso a los grupos
    let links: Map<string, string> = new Map(); // Modelo nombre - link

    // Calcular el tiempo de expiración en un dia del link
    let fechaCompra: Date = new Date(order.date_created);
    fechaCompra.setDate(fechaCompra.getDate() + 1); // Un dia
    const expireDate: number = fechaCompra.getTime();

    for (const model of models) {
      // Habilitar al usuario al chat
      await telegramServices.unbanChatMember(model.groupId, user.chatId);

      // Crear el link
      let inviteLink: string = "";

      try {
        inviteLink = await telegramServices.createChatInviteLink(
          model.groupId,
          0, //expireDate,
          1
        );
      } catch (error) {
        backLogsServices.catchProcessError(
          `Error: ${error}`,
          `TelegramController ~ enviarLink ~ JSON.stringify(error): ${JSON.stringify(
            error
          )}`
        );

        res.status(500).json({
          error: `Error interno del servidor al crear el link de invitacion para el grupo ${model.groupId}`,
        });

        inviteLink = null as any;
      }

      links.set(model.name, inviteLink);
    }

    // Se arma el mensaje del bot con los links de acceso
    let mensajeBot: string =
      "Se han generado los siguientes links de acceso. \n \n";
    for (const key of links.keys()) {
      if (links.get(key)) {
        mensajeBot += `Grupo: ${key}\nLink de Acceso: ${links.get(key)}\n\n`;
      } else {
        mensajeBot += `Ha ocurrido un error generando el link de acceso del Grupo: ${key}. Por favor contacte a un asesor.\n\n`;
      }
    }

    mensajeBot += `Los links vencen a las: ${new Date(
      expireDate
    ).toString()}\n\n`;

    // El bot envia el link al usuario
    telegramServices.enviarMensajeBotAUsuario(user.chatId, mensajeBot);

    // Se cambia el estado de las subscripcines
    for (let subscription of subscriptionsOrder) {
      subscription.status = StatusSubscriptionsEnum.ACTIVO;
      if (subscription.id) {
        let id: string = subscription.id;
        delete subscription.id;
        try {
          await subscripcionsServices.patchDataFS(id, subscription);
        } catch (error) {
          backLogsServices.catchProcessError(
            `Error: ${error}`,
            `TelegramController ~ enviarLink ~ JSON.stringify(error): ${JSON.stringify(
              error
            )}`
          );

          res.status(500).json({
            error: `Error interno del servidor al actualizar la subscripcion ${subscription.id}`,
          });
        }
      }
    }

    // Se cambia el estado de la orden
    order.status = StatusOrdersEnum.CERRADO;
    if (order.id) {
      let id: string = order.id;
      delete order.id;

      try {
        await ordersServices.patchDataFS(id, order);
      } catch (error) {
        backLogsServices.catchProcessError(
          `Error: ${error}`,
          `TelegramController ~ enviarLink ~ JSON.stringify(error): ${JSON.stringify(
            error
          )}`
        );

        res.status(500).json({
          error: `Error interno del servidor al actualizar la orden ${id}`,
        });
      }
    }

    res.json({
      mensaje: "Link generado",
      expireDate,
    });
  }

  /**
   * Quitar acceso de un usuario a un grupo
   *
   * @param {Request} req
   * @param {Response} res
   * @memberof TelegramController
   */
  public async quitarAcceso(req: Request, res: Response): Promise<void> {
    Helpers.consoleLog(
      "~ file: telegram_controller.ts ~ TelegramController ~ quitarAcceso: Inicia",
      EnumConsoleLogColors.INFO
    );
    // Validar correo admin
    let resp: DocumentSnapshot = null as any;

    try {
      resp = await businessParamsService
        .getItemFS(EnumBusinessParamsKeys.ADMIN)
        .get();
    } catch (error) {
      backLogsServices.catchProcessError(
        `Error: ${error}`,
        `TelegramController ~ quitarAcceso ~ JSON.stringify(error): ${JSON.stringify(
          error
        )}`
      );

      res.status(500).json({
        error: `Error interno del servidor al consultar el correo admin`,
      });

      return;
    }

    let email: string = resp.data()?.email || null;

    if (!email || email != variablesGlobales.email) {
      res.status(400).json({
        error: `El correo no tiene permisos de adminsitrador`,
      });

      return;
    }

    // Validacion de datos
    let resultadoValidacionError: any = JoiMiddlewareService.validarDatos(
      {
        fecha: Joi.string().required(),
      },
      { fecha: req.query.fecha }
    );

    if (resultadoValidacionError) {
      Helpers.consoleLog(
        "~ file: telegram_controller.ts ~ TelegramController ~ quitarAcceso: Error en la validacion con Joi: ",
        EnumConsoleLogColors.ERROR,
        [resultadoValidacionError]
      );
      // Si hay errores de validación, enviar una respuesta de error
      return res
        .status(400)
        .json({ error: resultadoValidacionError.details[0].message }) as any;
    }

    // Fecha actual
    const fecha: string | any = req.query.fecha;

    // Subscripciones ya para finalziar
    let subscripciones: Isubscriptions[] = [];

    try {
      subscripciones = (
        await subscripcionsServices
          .getDataFS()
          .where("endTime", "<=", fecha)
          .where("status", "==", StatusSubscriptionsEnum.ACTIVO)
          .get()
      ).docs.map((r) => {
        let s: Isubscriptions | any = r.data();
        s.id = r.id;
        return s;
      });
    } catch (error) {
      backLogsServices.catchProcessError(
        `Error: ${error}`,
        `TelegramController ~ quitarAcceso ~ JSON.stringify(error): ${JSON.stringify(
          error
        )}`
      );

      res.status(500).json({
        error: `Error interno del servidor al consultar la base de datos para las subscripciones`,
      });
    }

    let subscripcionesCanceladas: string[] = [];

    for (let subscription of subscripciones) {
      let resUser: any = null;

      try {
        resUser = (
          await userServices
            .getDataFS()
            .where("id", "==", subscription.userId)
            .get()
        ).docs[0];
      } catch (error) {
        backLogsServices.catchProcessError(
          `Error: ${error}`,
          `TelegramController ~ quitarAcceso ~ JSON.stringify(error): ${JSON.stringify(
            error
          )}`
        );

        res.status(500).json({
          error: `Error interno del servidor al consultar la base de datos para el usuario ${subscription.userId}`,
        });
      }

      let user: Iuser = resUser.data();
      let resModel: any = null;

      try {
        resModel = await modelsServices.getItemFS(subscription.modelId).get();
      } catch (error) {
        backLogsServices.catchProcessError(
          `Error: ${error}`,
          `TelegramController ~ quitarAcceso ~ JSON.stringify(error): ${JSON.stringify(
            error
          )}`
        );

        res.status(500).json({
          error: `Error interno del servidor al consultar la base de datos para la modelo ${subscription.modelId}`,
        });
      }

      let model: Imodels = resModel.data();
      model.id = resModel.id;

      if (user.chatId && model.groupId) {
        // Se remueve el acceso del usuario al grupo
        telegramServices.banChatMember(model.groupId, user.chatId, 366);
      } else {
        continue;
      }

      // Se cambia el estado de la subscripcion
      subscription.status = StatusSubscriptionsEnum.FINALIZADO;

      let idSubscription: string | any = subscription.id;
      let dataSubscription: Isubscriptions = subscription;
      delete dataSubscription.id;

      telegramServices.enviarMensajeBotAUsuario(
        user.chatId,
        `Ha finalizado su subscripción al grupo: '${model.name}'`
      );

      subscripcionesCanceladas.push(idSubscription);

      try {
        await subscripcionsServices.patchDataFS(
          idSubscription || "",
          dataSubscription
        );
      } catch (error) {
        backLogsServices.catchProcessError(
          `Error: ${error}`,
          `TelegramController ~ quitarAcceso ~ JSON.stringify(error): ${JSON.stringify(
            error
          )}`
        );

        res.status(500).json({
          error: `Error interno del servidor al actualizar la base de datos para la subscripcion ${idSubscription}`,
        });
      }
    }

    res.json({
      mensaje: "Usuarios eliminados",
      subscripcionesCanceladas,
    });
  }

  /**
   * Mensaje de prueba entre el cliente y el bot
   *
   * @param {Request} req
   * @param {Response} res
   * @memberof TelegramController
   */
  public async comunicarBotCliente(req: Request, res: Response): Promise<void> {
    Helpers.consoleLog(
      "~ file: telegram_controller.ts ~ TelegramController ~ comunicarBotCliente: Inicia",
      EnumConsoleLogColors.INFO
    );
    // Validacion de datos
    let { fromId, url } = req.query;
    let resultadoValidacionError: any = JoiMiddlewareService.validarDatos(
      {
        fromId: Joi.string().required(),
        url: Joi.string(),
      },
      { fromId, url }
    );

    if (resultadoValidacionError) {
      Helpers.consoleLog(
        "~ file: telegram_controller.ts ~ TelegramController ~ comunicarBotCliente: Error en la validacion con Joi: ",
        EnumConsoleLogColors.ERROR,
        [resultadoValidacionError]
      );
      // Si hay errores de validación, enviar una respuesta de error
      return res
        .status(400)
        .json({ error: resultadoValidacionError.details[0].message }) as any;
    }

    const userId: any = req.query.fromId;

    let res2: any = null;

    try {
      res2 = await telegramServices.enviarMensajeBotAUsuario(
        userId,
        "¡Hola! Soy el bot de OnlyGram"
      );
    } catch (error) {
      backLogsServices.catchProcessError(
        `Error: ${error}`,
        `TelegramController ~ comunicarBotCliente ~ JSON.stringify(error): ${JSON.stringify(
          error
        )}`
      );

      res.status(500).json({
        error: `Error interno del servidor al comunicar el bot con el usuario ${userId}`,
      });
    }

    if (!res2 || (res2.response && !res2.response.ok)) {
      res
        .json({
          mensaje: "Conexion erronea",
          code: 400,
        })
        .status(res2?.response.error_code || 400);

      return;
    }

    res.json({
      mensaje: "Conexion exitosa",
      code: 200,
    });

    return;
  }

  /**
   * Consulta si un usuario pertenece a un grupo
   *
   * @param {Request} req
   * @param {Response} res
   * @return {*}  {Promise<void>}
   * @memberof TelegramController
   */
  public async esMiembroDelGrupo(req: Request, res: Response): Promise<void> {
    Helpers.consoleLog(
      "~ file: telegram_controller.ts ~ TelegramController ~ esMiembroDelGrupo: Inicia",
      EnumConsoleLogColors.INFO
    );
    // Validacion de datos
    let resultadoValidacionError: any = JoiMiddlewareService.validarDatos(
      {
        chatId: Joi.string().required(),
        fromId: Joi.string().required(),
      },
      { chatId: req.query.chatId, fromId: req.query.fromId }
    );

    if (resultadoValidacionError) {
      Helpers.consoleLog(
        "~ file: telegram_controller.ts ~ TelegramController ~ esMiembroDelGrupo: Error en la validacion con Joi: ",
        EnumConsoleLogColors.ERROR,
        [resultadoValidacionError]
      );
      // Si hay errores de validación, enviar una respuesta de error
      return res
        .status(400)
        .json({ error: resultadoValidacionError.details[0].message }) as any;
    }

    const chatId: string = req.query.chatId as string;
    const fromId: any = req.query.fromId;

    let res2: boolean = false;

    try {
      res2 = await telegramServices.esMiembroDelGrupo(chatId, fromId);
    } catch (error) {
      backLogsServices.catchProcessError(
        `Error: ${error}`,
        `TelegramController ~ esMiembroDelGrupo ~ JSON.stringify(error): ${JSON.stringify(
          error
        )}`
      );

      res.status(500).json({
        error: `Error interno del servidor al comunicar el bot con el usuario ${variablesGlobales.userId}`,
      });
    }

    if (!res2) {
      res
        .json({
          mensaje: "El usuario no pertenece al grupo",
          perteneceAlGrupo: false,
          code: 400,
        })
        .status(400);

      return;
    }

    res.json({
      mensaje: "El usuario pertenece al grupo",
      perteneceAlGrupo: true,
      code: 200,
    });

    return;
  }

  /**
   * Consulta si el bot pertenece a un grupo y es admin
   *
   * @param {Request} req
   * @param {Response} res
   * @return {*}  {Promise<void>}
   * @memberof TelegramController
   */
  public async botEsAdminDelGrupo(req: Request, res: Response): Promise<void> {
    Helpers.consoleLog(
      "~ file: telegram_controller.ts ~ TelegramController ~ esMiembroDelGrupo: Inicia",
      EnumConsoleLogColors.INFO
    );

    // Validacion de datos
    let resultadoValidacionError: any = JoiMiddlewareService.validarDatos(
      {
        chatId: Joi.string().required(),
      },
      { chatId: req.query.chatId }
    );

    if (resultadoValidacionError) {
      Helpers.consoleLog(
        "~ file: telegram_controller.ts ~ TelegramController ~ botEsAdminDelGrupo: Error en la validacion con Joi: ",
        EnumConsoleLogColors.ERROR,
        [resultadoValidacionError]
      );
      // Si hay errores de validación, enviar una respuesta de error
      return res
        .status(400)
        .json({ error: resultadoValidacionError.details[0].message }) as any;
    }

    const chatId: string = req.query.chatId as string;

    let res2: boolean = false;

    try {
      res2 = await telegramServices.botEsAdminDelGrupo(chatId);
    } catch (error) {
      backLogsServices.catchProcessError(
        `Error: ${error}`,
        `TelegramController ~ botEsAdminDelGrupo ~ JSON.stringify(error): ${JSON.stringify(
          error
        )}`
      );

      res.status(500).json({
        error: `Error interno del servidor al comunicar el bot con el usuario ${variablesGlobales.userId}`,
      });
    }

    if (!res2) {
      res
        .json({
          mensaje: "El Bot no pertenece al grupo",
          perteneceAlGrupo: false,
          code: 400,
        })
        .status(400);

      return;
    }

    res.json({
      mensaje: "El bot pertenece al grupo",
      perteneceAlGrupo: true,
      code: 200,
    });

    return;
  }
}

const telegramController = new TelegramController();

export default telegramController;
