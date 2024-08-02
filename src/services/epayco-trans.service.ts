import {
  CollectionReference,
  DocumentData,
  DocumentReference,
  QuerySnapshot,
} from "firebase-admin/firestore";
import { environment } from "../environment";
import { FireStorageService } from "./firestorage-service";
import {
  EnumIEpaycoTransStatus,
  IEpaycoTransRes,
  IEpaycoTransSend,
} from "../interfaces/i-epayco-trans";
import { variablesGlobales } from "../variables-globales";
import { IBackLogs } from "../interfaces/i-back-logs";
import backLogsServices from "./back-logs-service";
import { EnumEpaycoResponse } from "../enums/enum-epayco-response";
import encryptionService from "./encryption.service";

class EpaycoTransService {
  private urlEpaycoTrans: string = environment.urlCollections.epayco_trans;
  private fireStorageService: FireStorageService;

  constructor() {
    console.log("🚀 ~ EpaycoTransService ~ constructor: Inicia");
    this.fireStorageService = new FireStorageService();
  }

  //------------ FireStorage---------------//
  /**
   * Se toma la informacion de la coleccion de epayco_trans en Firebase
   *
   * @return {*}  {CollectionReference<DocumentData>}
   * @memberof EpaycoTransService
   */
  public getDataFS(): CollectionReference<DocumentData> {
    console.log(
      "🚀 ~ file: models-service.ts ~ ModelsService ~ getDataFS: Inicia"
    );
    return this.fireStorageService.getData(this.urlEpaycoTrans);
  }

  /**
   * Tomar un documento de epayco_trans
   *
   * @param {string} doc
   * @return {*}  {DocumentReference<DocumentData>}
   * @memberof EpaycoTransService
   */
  public getItemFS(doc: string): DocumentReference<DocumentData> {
    console.log(`🚀 ~ EpaycoTransService ~ getItemFS: Inicia Doc: ${doc}`);
    return this.fireStorageService.getItem(this.urlEpaycoTrans, doc);
  }

  /**
   * Guardar informacion del epayco_trans
   *
   * @param {IEpaycoTransSend} data
   * @return {*}  {Promise<any>}
   * @memberof EpaycoTransService
   */
  public postDataFS(data: IEpaycoTransSend): Promise<any> {
    console.log("🚀 ~ EpaycoTransService ~ postDataFS: Inicia");
    return this.fireStorageService.post(this.urlEpaycoTrans, data);
  }

  /**
   * Actualizar epayco_trans
   *
   * @param {string} doc
   * @param {IEpaycoTransSend} data
   * @return {*}  {Promise<any>}
   * @memberof EpaycoTransService
   */
  public patchDataFS(doc: string, data: IEpaycoTransSend): Promise<any> {
    console.log(`🚀 ~ EpaycoTransService ~ patchDataFS: Inicia Doc: ${doc}`);
    return this.fireStorageService.patch(this.urlEpaycoTrans, doc, data);
  }

  /**
   * Eliminar epayco_trans
   *
   * @param {string} doc
   * @return {*}  {Promise<any>}
   * @memberof EpaycoTransService
   */
  public deleteDataFS(doc: string): Promise<any> {
    console.log(`🚀 ~ EpaycoTransService ~ deleteDataFS: Inicia Doc: ${doc}`);
    return this.fireStorageService.delete(this.urlEpaycoTrans, doc);
  }

  // Firestorage ------------------------

  // Servicios comunes

  public async saveEpaycoTrans(
    data: IEpaycoTransRes
  ): Promise<IEpaycoTransSend> {
    // Desencriptar el carrito
    const cart: string = JSON.stringify(
      JSON.parse(data.x_extra3).map(
        (subCart: { infoModelSubscription: string; price: string }) => {
          // Desencriptar los datos
          let { infoModelSubscription, price } =
            encryptionService.decryptDataJson(subCart) as any;

          return {
            infoModelSubscription: JSON.parse(infoModelSubscription),
            price: Number(price),
          };
        }
      )
    );

    // Guardar informacion para consultarse en el front
    let dataSave: IEpaycoTransSend = {
      status:
        data.x_response.toLowerCase() == EnumEpaycoResponse.PENDIENTE
          ? EnumIEpaycoTransStatus.IN_PROGRESS
          : EnumIEpaycoTransStatus.FINISHED, // Estatus del proceso de la transaccion en el negocio
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
      userId: variablesGlobales.userId,
      cart,
    };

    let idOrderInProcess: string = null as any;
    if (data.x_response.toLowerCase() == EnumEpaycoResponse.ACEPTADA) {
      let res: QuerySnapshot<DocumentData> = null as any;
      try {
        res = await this.getDataFS()
          .where("x_ref_payco", "==", data.x_ref_payco)
          .where("status", "==", EnumIEpaycoTransStatus.IN_PROGRESS)
          .limit(1)
          .get();
      } catch (error) {
        backLogsServices.catchProcessError(
          `Error: ${error}`,
          `EpaycoTransController ~ confirmTransaccion ~ JSON.stringify(error): ${JSON.stringify(
            error
          )}`
        );

        return null as any;
      }

      if (res.docs?.length === 1)
        idOrderInProcess = res.docs[0]?.id || (null as any);
    }

    try {
      idOrderInProcess
        ? await this.patchDataFS(idOrderInProcess, dataSave)
        : await this.postDataFS(dataSave);
    } catch (error) {
      backLogsServices.catchProcessError(
        `Error: ${error}`,
        `EpaycoTransController ~ confirmTransaccion ~ JSON.stringify(error): ${JSON.stringify(
          error
        )}`
      );

      return null as any;
    }

    return dataSave;
  }
}

const epaycoTransService = new EpaycoTransService();

export default epaycoTransService;
