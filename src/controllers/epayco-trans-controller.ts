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

export class EpaycoTransController {
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
      data.x_extra1?.length > 0 &&
      data.x_extra2?.length > 0 &&
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

    let dataSave: IEpaycoTransSend = await epaycoTransService.saveEpaycoTrans(
      data
    );

    if (!dataSave) {
      res.status(500).json({
        error: `Error interno del servidor al guardar los datos de la transaccion de epayco x_ref_payco: ${data.x_ref_payco}`,
      });
    }

    res.json({
      mensaje: `Transaccion exitosa x_ref_payco: ${dataSave.x_ref_payco}`,
    });
  }
}

const epaycoTransController = new EpaycoTransController();

export default epaycoTransController;
