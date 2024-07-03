import { EnumEpaycoResponse } from "../enums/enum-epayco-response";
import {
  EnumIEpaycoTransStatus,
  IEpaycoTransRes,
  IEpaycoTransSend,
} from "../interfaces/i-epayco-trans";
import { Request, Response } from "express";
import epaycoTransService from "../services/epayco-trans.service";
import { IBackLogs } from "../interfaces/i-back-logs";
import { variablesGlobales } from "../variables-globales";
import backLogsServices from "../services/back-logs-service";
import { environment } from "../environment";

class EpaycoTransController {
  constructor() {
    console.log("🚀 ~ EpaycoTransController ~ constructor: Inicia");
  }

  public async confirmTransaccion(req: Request, res: Response): Promise<void> {
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
      Number(data.x_amount) > 0 &&
      regex.test(data.x_transaction_date) &&
      data.x_cust_id_cliente === environment.epayco.idBusinnes;

    if (!valido) {
      return res
        .status(400)
        .json({ error: "Error en los datos de la transaccion" }) as any;
    }

    if (data.x_response.toLowerCase() !== EnumEpaycoResponse.ACEPTADA) {
      return res.status(400).json({ error: "Transaccion no aceptada" }) as any;
    }

    // Guardar informacion para consultarse en el front
    let dataSave: IEpaycoTransSend = {
      status: EnumIEpaycoTransStatus.IN_PROGRESS, // Estatus del proceso de la transaccion en el negocio
      x_cust_id_cliente: data.x_cust_id_cliente, // Id del negocio
      x_ref_payco: data.x_ref_payco,
      x_id_invoice: data.x_id_invoice,
      x_description: data.x_description,
      x_amount: data.x_amount, // total de la venta
      x_amount_country: data.x_amount_country, // Total de la venta en moneda local
      x_tax: data.x_tax,
      x_amount_base: data.x_amount_base,
      x_currency_code: data.x_currency_code, // USD
      x_bank_name: data.x_bank_name,
      x_cardnumber: data.x_cardnumber,
      x_quotas: data.x_quotas,
      x_response: data.x_response, //'Aceptada',
      x_approval_code: data.x_approval_code,
      x_transaction_id: data.x_transaction_id,
      x_transaction_date: data.x_transaction_date,
      x_cod_response: data.x_cod_response, // '1',
      x_response_reason_text: data.x_response_reason_text,
      x_errorcode: data.x_errorcode,
      x_cod_transaction_state: data.x_cod_transaction_state,
      x_transaction_state: data.x_transaction_state, //'Aceptada',
      x_franchise: data.x_franchise,
      x_customer_doctype: data.x_customer_doctype, //'CC',
      x_customer_document: data.x_customer_document, // Numero de documento
      x_customer_name: data.x_customer_name, // Nombre del comprador
      x_customer_lastname: data.x_customer_lastname, // Apellido del comprador
      x_customer_email: data.x_customer_email, // Correo del comprador
      x_customer_phone: data.x_customer_phone,
      x_customer_movil: data.x_customer_movil,
      x_customer_ind_pais: data.x_customer_ind_pais,
      x_customer_country: data.x_customer_country,
      x_customer_city: data.x_customer_city,
      x_customer_address: data.x_customer_address,
      x_customer_ip: data.x_customer_ip,
      x_test_request: data.x_test_request,
      x_signature: data.x_signature,
      x_transaction_cycle: data.x_transaction_cycle,
      is_processable: data.is_processable,
      // Enviados del front
      token: data.x_extra1, // Token
      fecha: data.x_extra2, // Fecha
    };

    dataSave.status = EnumIEpaycoTransStatus.IN_PROGRESS;

    try {
      await epaycoTransService.postDataFS(dataSave);
    } catch (error) {
      let { date }: { date: string } = req.query as any;
      let data: IBackLogs = {
        date: new Date(date),
        userId: variablesGlobales.userId,
        log: `EpaycoTransController ~ confirmTransaccion ~ JSON.stringify(error): ${JSON.stringify(
          error
        )}`,
      };

      backLogsServices
        .postDataFS(data)
        .then((res) => {})
        .catch((err) => {
          console.log("🚀 ~ Server ~ err:", err);
          throw err;
        });

      res.status(500).json({
        error: `Error interno del servidor al guardar los datos de la transaccion de epayco x_ref_payco: ${dataSave.x_ref_payco}`,
      });
      throw error;
    }

    res.json({
      mensaje: `Transaccion exitosa x_ref_payco: ${dataSave.x_ref_payco}`,
    });
  }
}

const epaycoTransController = new EpaycoTransController();

export default epaycoTransController;
