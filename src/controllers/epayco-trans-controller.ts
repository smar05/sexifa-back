import { EnumEpaycoResponse } from "../enums/enum-epayco-response";
import {
  IEpaycoTransRes,
  IEpaycoTransSend,
} from "../interfaces/i-epayco-trans";
import { Request, Response } from "express";
import epaycoTransService from "../services/epayco-trans.service";
import { IBackLogs } from "../interfaces/i-back-logs";
import { variablesGlobales } from "../variables-globales";
import backLogsServices from "../services/back-logs-service";
import { environment } from "../environment";
import { ICart } from "../interfaces/i-cart";
import { Functions } from "../helpers/helpers";
import { Isubscriptions } from "../interfaces/i-subscriptions";
import { StatusSubscriptionsEnum } from "../enums/status-subscriptions-enum";
import { EnumPayMethods } from "../enums/enum-pay-methods";
import subscripcionsServices from "../services/subscriptions-service";
import modelsServices from "../services/models-service";
import { Imodels } from "../interfaces/i-models";
import { DocumentSnapshot } from "firebase-admin/firestore";
import { Iorders } from "../interfaces/i-orders";
import { StatusOrdersEnum } from "../enums/status-orders-enum";
import ordersServices from "../services/orders-service";

export class EpaycoTransController {
  constructor() {
    console.log("🚀 ~ EpaycoTransController ~ constructor: Inicia");
  }

  /**
   * Confirmacion de la transaccion realizada por epayco
   *
   * @param {Request} req
   * @param {Response} res
   * @param {*} next
   * @return {*}  {Promise<void>}
   * @memberof EpaycoTransController
   */
  public async confirmTransaccion(
    req: Request,
    res: Response,
    next: any
  ): Promise<void> {
    console.log("🚀 ~ EpaycoTransController ~ confirmTransaccion: Inicia");

    if (!req.query) {
      return res.status(400).json({ error: "No hay datos en el query" }) as any;
    }

    let data: IEpaycoTransRes = (req as any).query;

    // Validar datos
    const regex: RegExp = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/; // Expresion regular de formato de la fecha
    let valido: boolean =
      data.x_response?.length > 0 &&
      data.x_cod_response?.length > 0 &&
      data.x_transaction_state?.length > 0 &&
      data.x_amount?.length > 0 &&
      data.x_extra1?.length > 0 &&
      data.x_extra2?.length > 0 &&
      data.x_extra3?.length > 0 &&
      JSON.parse(data.x_extra3) &&
      Number(data.x_amount) > 0 &&
      regex.test(data.x_transaction_date) &&
      data.x_cust_id_cliente === environment.epayco.idBusinnes;

    if (!valido) {
      return res
        .status(400)
        .json({ error: "Error en los datos de la transaccion" }) as any;
    }

    if (
      data.x_response.toLowerCase() !== EnumEpaycoResponse.ACEPTADA ||
      data.x_cod_response !== "1"
    ) {
      return res
        .status(400)
        .json({ error: "Transaccion no aceptada o pendiente" }) as any;
    }

    let dataSave: IEpaycoTransSend = await epaycoTransService.saveEpaycoTrans(
      data
    );

    if (!dataSave) {
      return res.status(500).json({
        error: `Error interno del servidor al guardar los datos de la transaccion de epayco x_ref_payco: ${data.x_ref_payco}`,
      }) as any;
    }

    // Proceso de crear la orden y subscripciones
    const cart: ICart[] = JSON.parse(dataSave.cart);
    const timeNow: Date = new Date(dataSave.fecha);
    const userId: string = variablesGlobales.userId;

    // Se organiza la informacion de las subscripciones compradas
    // Se guarda la informacion de las subscripciones compradas
    let idsSubscriptions: string[] = [];

    for (const subCart of cart) {
      let endTime: Date = Functions.incrementarMeses(
        timeNow,
        subCart.infoModelSubscription.timeSubscription
      );
      let data: Isubscriptions = {
        modelId: subCart.infoModelSubscription.idModel,
        userId,
        status: StatusSubscriptionsEnum.PAGADO,
        price: subCart.price,
        time: subCart.infoModelSubscription.timeSubscription,
        beginTime: timeNow.toISOString().split("T")[0],
        endTime: endTime.toISOString().split("T")[0],
        date_created: dataSave.fecha,
        payMethod: EnumPayMethods.EPAYCO,
      };

      let res: any = null;
      let resModel: DocumentSnapshot | any = null;

      try {
        res = await subscripcionsServices.postDataFS(data);
        resModel = await modelsServices.getItemFS(data.modelId).get();
      } catch (error) {
        console.error("Error: ", error);
        res.status(500).json({
          error: `Ha ocurrido un error guardando la subscripcion`,
        });

        let data: IBackLogs = {
          date: new Date(),
          userId: variablesGlobales.userId,
          log: `EpaycoTransController ~ confirmTransaccion: ${JSON.stringify(
            error
          )}`,
        };

        backLogsServices
          .postDataFS(data)
          .then((res) => {})
          .catch((err) => {
            console.error(err);
          });
        throw error;
      }

      let model: Imodels = { id: resModel.id, ...resModel.data() };

      idsSubscriptions.push(res.id);

      // Reducir la compra si esta en promocion
      await modelsServices.reducirComprasPromocion(data, model);
    }

    // Se crea la orden
    let dataOrder: Iorders = {
      date_created: dataSave.fecha,
      ids_subscriptions: idsSubscriptions,
      userId,
      status: StatusOrdersEnum.PAGADO,
      payMethod: EnumPayMethods.EPAYCO,
      price: Number(data.x_amount),
      idPay: data.x_ref_payco,
      currency: data.x_currency_code,
    };

    let orderId: string = null as any;

    try {
      orderId = (await ordersServices.postDataFS(dataOrder)).id;
    } catch (error) {
      console.error("Error: ", error);

      let data: IBackLogs = {
        date: new Date(),
        userId: variablesGlobales.userId,
        log: `EpaycoTransController ~ confirmTransaccion ~ JSON.stringify(error): ${JSON.stringify(
          error
        )}`,
      };

      backLogsServices
        .postDataFS(data)
        .then((res) => {})
        .catch((err) => {
          console.error(err);
        });
      throw error;
    }

    if (!orderId) {
      return res.status(500).json({
        error: `Error interno del servidor al guardar los datos de la orden`,
      }) as any;
    }

    // Se envian los links de telegram en el siguiente middleware
    req.query = {}; // Limpiar el query para el siguiente endpoint
    req.query.orderId = orderId;
    req.query.auth = dataSave.token;
    req.query.date = dataSave.fecha;

    next();
  }
}

const epaycoTransController = new EpaycoTransController();

export default epaycoTransController;
