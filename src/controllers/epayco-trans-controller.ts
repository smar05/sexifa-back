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
import { Helpers } from "../helpers/helpers";
import { Isubscriptions } from "../interfaces/i-subscriptions";
import { StatusSubscriptionsEnum } from "../enums/status-subscriptions-enum";
import { EnumPayMethods } from "../enums/enum-pay-methods";
import subscripcionsServices from "../services/subscriptions-service";
import modelsServices from "../services/models-service";
import { Imodels } from "../interfaces/i-models";
import {
  DocumentData,
  DocumentSnapshot,
  QueryDocumentSnapshot,
  QuerySnapshot,
} from "firebase-admin/firestore";
import { Iorders } from "../interfaces/i-orders";
import { StatusOrdersEnum } from "../enums/status-orders-enum";
import ordersServices from "../services/orders-service";
import epaycoSdkService from "../services/epayco-sdk.service";

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
      data.x_ref_payco?.length > 0 &&
      JSON.parse(data.x_extra3) &&
      Number(data.x_amount) > 0 &&
      regex.test(data.x_transaction_date) &&
      data.x_cust_id_cliente === environment.epayco.idBusinnes;

    let validarTransaccion: boolean = await epaycoSdkService.validarTransaccion(
      data.x_ref_payco,
      data
    );

    if (!valido || !validarTransaccion) {
      return res
        .status(400)
        .json({ error: "Error en los datos de la transaccion" }) as any;
    }

    // Consultar si la transaccion ya fue procesada antes
    let resDb: QueryDocumentSnapshot<DocumentData> = null as any;

    try {
      resDb = (
        await epaycoTransService
          .getDataFS()
          .where("x_ref_payco", "==", data.x_ref_payco)
          .limit(1)
          .get()
      ).docs[0];
    } catch (error) {
      backLogsServices.catchProcessError(
        `Error: ${error}`,
        `EpaycoTransController ~ confirmTransaccion: ${JSON.stringify(error)}`
      );

      res.status(500).json({
        error: `Ha ocurrido un error consultando epayco-trans`,
      });
    }
    let epaycoBD: IEpaycoTransSend = resDb?.data() as any;

    // Transacciones validas a procesar
    let validoAceptado: boolean =
      data.x_response.toLowerCase() == EnumEpaycoResponse.ACEPTADA &&
      data.x_cod_response == "1";
    let validoRechazado: boolean =
      data.x_response.toLowerCase() == EnumEpaycoResponse.RECHAZADA &&
      data.x_cod_response == "2";
    let validoPendiente: boolean =
      data.x_response.toLowerCase() == EnumEpaycoResponse.PENDIENTE &&
      data.x_cod_response == "3";
    let validoFallida: boolean =
      data.x_response.toLowerCase() == EnumEpaycoResponse.FALLIDA &&
      data.x_cod_response == "4";

    if (
      !(validoAceptado || validoRechazado || validoPendiente || validoFallida)
    ) {
      console.error("Transaccion invalida");
      return res.status(400).json({ error: "Transaccion invalida" }) as any;
    }

    // La transaccion guardada en DB debe venir como PENDIENTE para ser procesada
    if (
      epaycoBD &&
      !(
        epaycoBD?.x_response?.toLowerCase() === EnumEpaycoResponse.PENDIENTE &&
        validoAceptado
      )
    ) {
      return res.status(400).json({
        error: `Error, la transaccion ${data.x_ref_payco} ya fue procesada`,
      }) as any;
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

    // Se procesan las subscripciones solo si la transaccion es valida
    if (validoAceptado) {
      for (const subCart of cart) {
        let resModel: DocumentSnapshot | any = null;

        try {
          resModel = await modelsServices
            .getItemFS(subCart.infoModelSubscription.idModel)
            .get();
        } catch (error) {
          backLogsServices.catchProcessError(
            `Error: ${error}`,
            `EpaycoTransController ~ confirmTransaccion: ${JSON.stringify(
              error
            )}`
          );

          res.status(500).json({
            error: `Ha ocurrido un error obteniendo el modelo`,
          });

          return;
        }

        if (!(resModel && resModel.id)) {
          res.status(500).json({
            error: `Ha ocurrido un error obteniendo el modelo`,
          });

          return;
        }

        let model: Imodels = { id: resModel.id, ...resModel.data() };

        let endTime: Date = Helpers.incrementarMeses(
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
          commission: model.commission || 0.1,
        };

        let resp: any = null;

        try {
          resp = await subscripcionsServices.postDataFS(data);
        } catch (error) {
          backLogsServices.catchProcessError(
            `Error: ${error}`,
            `EpaycoTransController ~ confirmTransaccion: ${JSON.stringify(
              error
            )}`
          );

          res.status(500).json({
            error: `Ha ocurrido un error guardando la subscripcion`,
          });

          return;
        }

        idsSubscriptions.push(resp.id);

        // Reducir la compra si esta en promocion
        await modelsServices.reducirComprasPromocion(data, model);
      }
    }

    // Se crea la orden
    let dataOrder: Iorders = null as any;
    let resOrderPendienteToAceptado: Iorders = null as any;
    let resPendienteToAceptado: QuerySnapshot<DocumentData> = null as any;

    // Consultar si ya existe alguna orden
    try {
      resPendienteToAceptado = await ordersServices
        .getDataFS()
        .where("idPay", "==", data.x_ref_payco)
        .limit(1)
        .get();
    } catch (error) {
      backLogsServices.catchProcessError(
        `Error: ${error}`,
        `EpaycoTransController ~ confirmTransaccion ~ JSON.stringify(error): ${JSON.stringify(
          error
        )}`
      );

      res.status(500).json({
        error: `Ha ocurrido un error consultando la orden`,
      });
    }

    if (resPendienteToAceptado?.docs?.length == 1) {
      resOrderPendienteToAceptado = {
        id: resPendienteToAceptado.docs[0].id,
        ...(resPendienteToAceptado.docs[0].data() as any),
      };
    }

    // Si la transaccion ya existe, no se vuelve a hacer
    if (
      resOrderPendienteToAceptado &&
      (resOrderPendienteToAceptado?.status === StatusOrdersEnum.PAGADO ||
        resOrderPendienteToAceptado?.status === StatusOrdersEnum.RECHAZADO)
    ) {
      return res.status(400).json({
        error: `La transaccion ya fue procesada`,
      }) as any;
    }

    if (validoAceptado) {
      // Orden que viene pendiente y pasara a pagada
      if (
        resOrderPendienteToAceptado &&
        resOrderPendienteToAceptado.status === StatusOrdersEnum.PENDIENTE
      ) {
        resOrderPendienteToAceptado.status = StatusOrdersEnum.PAGADO;
        resOrderPendienteToAceptado.user_view = false;
        resOrderPendienteToAceptado.ids_subscriptions = idsSubscriptions;
        resOrderPendienteToAceptado.date_updated = dataSave.fecha;
      } else {
        resOrderPendienteToAceptado = null as any;
      }

      dataOrder = resOrderPendienteToAceptado ?? {
        date_created: dataSave.fecha,
        date_updated: null,
        ids_subscriptions: idsSubscriptions,
        userId,
        status: StatusOrdersEnum.PAGADO,
        payMethod: EnumPayMethods.EPAYCO,
        price: Number(data.x_amount),
        idPay: data.x_ref_payco,
        currency: data.x_currency_code,
        user_view: false,
      };
    } else if (validoRechazado) {
      dataOrder = {
        date_created: dataSave.fecha,
        date_updated: null as any,
        ids_subscriptions: null as any,
        userId,
        status: StatusOrdersEnum.RECHAZADO,
        payMethod: EnumPayMethods.EPAYCO,
        price: Number(data.x_amount),
        idPay: data.x_ref_payco,
        currency: data.x_currency_code,
        user_view: false,
      };
    } else if (validoPendiente) {
      dataOrder = {
        date_created: dataSave.fecha,
        date_updated: null as any,
        ids_subscriptions: null as any,
        userId,
        status: StatusOrdersEnum.PENDIENTE,
        payMethod: EnumPayMethods.EPAYCO,
        price: Number(data.x_amount),
        idPay: data.x_ref_payco,
        currency: data.x_currency_code,
        user_view: false,
      };
    } else if (validoFallida) {
      dataOrder = {
        date_created: dataSave.fecha,
        date_updated: null as any,
        ids_subscriptions: null as any,
        userId,
        status: StatusOrdersEnum.FALLIDA,
        payMethod: EnumPayMethods.EPAYCO,
        price: Number(data.x_amount),
        idPay: data.x_ref_payco,
        currency: data.x_currency_code,
        user_view: false,
      };
    } else {
      console.error("Transaccion invalida");
      return res.status(400).json({ error: "Transaccion invalida" }) as any;
    }

    let orderId: string = null as any;
    let idOrderPendienteToAceptado: string = null as any;

    try {
      if (resOrderPendienteToAceptado) {
        idOrderPendienteToAceptado =
          resOrderPendienteToAceptado.id || (undefined as any);
        delete resOrderPendienteToAceptado.id;
      }

      orderId = resOrderPendienteToAceptado
        ? (
            await ordersServices.patchDataFS(
              idOrderPendienteToAceptado,
              dataOrder
            )
          ).id
        : (await ordersServices.postDataFS(dataOrder)).id;
    } catch (error) {
      backLogsServices.catchProcessError(
        `Error: ${error}`,
        `EpaycoTransController ~ confirmTransaccion ~ JSON.stringify(error): ${JSON.stringify(
          error
        )}`
      );

      res.status(500).json({
        error: `Ha ocurrido un error guardando la orden`,
      });
    }

    if (!(orderId || idOrderPendienteToAceptado)) {
      return res.status(500).json({
        error: `Error interno del servidor al guardar los datos de la orden`,
      }) as any;
    }

    if (validoPendiente || validoRechazado || validoFallida) {
      return res.status(200).json({ message: "Transaccion finalizada" }) as any;
    }

    // Se envian los links de telegram en el siguiente middleware
    req.query = {}; // Limpiar el query para el siguiente endpoint
    req.query.orderId = orderId || idOrderPendienteToAceptado;
    req.query.auth = dataSave.token;
    req.query.date = dataSave.fecha;

    next();
  }
}

const epaycoTransController = new EpaycoTransController();

export default epaycoTransController;
