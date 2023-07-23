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

class TelegramController {
  constructor() {}

  /**
   * Enviar link de acceso
   *
   * @param {Request} req
   * @param {Response} res
   * @return {*}  {Promise<void>}
   * @memberof TelegramController
   */
  public async enviarLink(req: Request, res: Response): Promise<void> {
    const orderId: any = req.query.orderId;

    // Obtenemos los datos de la orden
    let res1: DocumentSnapshot | any = await ordersServices
      .getItemFS(orderId)
      .get();

    let order: Iorders = res1.data();
    order.id = res1.id;

    // Si no esta en estado pagada
    if (order.status != StatusOrdersEnum.PAGADO) {
      res.status(500).json({
        mensaje: "La orden no ha sido pagada",
      });

      return;
    }

    let res4: any = (
      await userServices.getDataFS().where("id", "==", order.userId).get()
    ).docs[0];

    let user: Iuser = res4.data();
    user.id = res4.id;

    if (!(user && user.chatId)) return;

    // Obtenemos la informacion de las subscripciones de la orden
    let subscriptionsOrder: Isubscriptions[] = [];

    for (const idSubscription of order.ids_subscriptions) {
      let res2: DocumentSnapshot | any = await subscripcionsServices
        .getItemFS(idSubscription)
        .get();

      let subscription: Isubscriptions = res2.data();
      subscription.id = res2.id;

      subscriptionsOrder.push(subscription);
    }

    // Obtenemos los modelos de cada grupo de las subscripciones de la orden
    let models: Imodels[] = [];

    for (const subscription of subscriptionsOrder) {
      if (subscription.status == StatusSubscriptionsEnum.PAGADO) {
        let res3: DocumentSnapshot | any = await modelsServices
          .getItemFS(subscription.modelId)
          .get();
        let model: Imodels = res3.data();
        model.id = res3.id;

        models.push(model);
      } else {
        continue;
      }
    }

    // Generamos los links de acceso a los grupos
    let links: Map<string, string> = new Map(); // Modelo nombre - link

    // Calcular el tiempo de expiración en una hora del link
    const expireDate = Math.floor(Date.now() / 1000) + 60; //3600;

    for (const model of models) {
      // Habilitar al usuario al chat
      telegramServices.unbanChatMember(model.groupId, user.chatId);

      // Crear el link
      let inviteLink: string = await telegramServices.createChatInviteLink(
        model.groupId,
        expireDate,
        1
      );

      links.set(model.name, inviteLink);
    }

    // Se arma el mensaje del bot con los links de acceso
    let mensajeBot: string =
      "Se han generado los siguientes links de acceso. \n \n";
    for (const key of links.keys()) {
      mensajeBot += `Grupo: ${key}\nLink de Acceso: ${links.get(key)}\n\n`;
    }

    // El bot envia el link al usuario
    telegramServices.enviarMensajeBotAUsuario(user.chatId, mensajeBot);

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
  public quitarAcceso(req: Request, res: Response): void {
    const chatId = req.body.chatId;
    const userId = req.body.fromId;

    telegramServices.banChatMember(chatId, userId, 366);

    res.json({
      mensaje: "Usuario eliminado",
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
    const userId: any = req.query.fromId;

    let res2: any = await telegramServices.enviarMensajeBotAUsuario(
      userId,
      "¡Hola! Soy el bot de OnlyGram"
    );

    if (res2.response && !res2.response.ok) {
      res
        .json({
          mensaje: "Conexion erronea",
          code: 400,
        })
        .status(res2.response.error_code);

      return;
    }

    res.json({
      mensaje: "Conexion exitosa",
      code: 200,
    });

    return;
  }
}

const telegramController = new TelegramController();

export default telegramController;
