import { EnumConsoleLogColors } from "../enums/enum-console-log-colors";
import { environment } from "../environment";
import { Helpers } from "../helpers/helpers";
import { IBackLogs } from "../interfaces/i-back-logs";
import { IEpaycoTransRes } from "../interfaces/i-epayco-trans";
import { variablesGlobales } from "../variables-globales";
import backLogsServices from "./back-logs-service";

class EpaycoSdkService {
  private epayco: any = null;

  constructor() {
    this.epayco = require("epayco-sdk-node")({
      apiKey: environment.epayco.apiKey,
      privateKey: environment.epayco.privateKey,
      lang: "ES",
      test: true,
    });
  }

  /**
   * Validar que la transaccion recibida por POST si sea de Epayco
   *
   * @param {string} refPayco
   * @param {IEpaycoTransRes} [dataRecibida=null as any]
   * @return {*}  {Promise<boolean>}
   * @memberof EpaycoSdkService
   */
  public async validarTransaccion(
    refPayco: string,
    dataRecibida: IEpaycoTransRes = null as any
  ): Promise<boolean> {
    Helpers.consoleLog(
      "~ EpaycoSdkService ~ validarTransaccion: Inicia para refPayco: " +
        refPayco,
      EnumConsoleLogColors.INFO
    );
    let res = null;

    try {
      res = await this.epayco.charge.get(refPayco);
    } catch (error) {
      backLogsServices.catchProcessError(
        `Error: ${error}`,
        `EpaycoSdkService ~ validarTransaccion ~ JSON.stringify(error): ${JSON.stringify(
          error
        )}`
      );

      return null as any;
    }

    if (!res.success || !res.data) return false;
    if (!dataRecibida) return true;

    let data: IEpaycoTransRes = res.data;

    return this.validarDatos(data, dataRecibida);
  }

  /**
   * Validar que los datos de ambos objetos coincidan
   *
   * @private
   * @param {IEpaycoTransRes} data1
   * @param {IEpaycoTransRes} data2
   * @return {*}  {boolean}
   * @memberof EpaycoSdkService
   */
  private validarDatos(
    data1: IEpaycoTransRes,
    data2: IEpaycoTransRes
  ): boolean {
    return (
      data1.x_cust_id_cliente == data2.x_cust_id_cliente &&
      data1.x_ref_payco == data2.x_ref_payco &&
      data1.x_id_factura == data2.x_id_factura &&
      data1.x_amount == data2.x_amount &&
      data1.x_currency_code == data2.x_currency_code &&
      data1.x_response == data2.x_response &&
      data1.x_cod_response == data2.x_cod_response &&
      data1.x_customer_ip == data2.x_customer_ip &&
      data1.x_extra1 == data2.x_extra1 &&
      data1.x_extra2 == data2.x_extra2 &&
      data1.x_extra3 == data2.x_extra3
    );
  }
}

const epaycoSdkService = new EpaycoSdkService();

export default epaycoSdkService;
