import { Helpers } from "../helpers/helpers";
import { IBackLogs } from "../interfaces/i-back-logs";
import { IEpaycoTransRes } from "../interfaces/i-epayco-trans";
import { variablesGlobales } from "../variables-globales";
import backLogsServices from "./back-logs-service";

export default class EpaycoSdkService {
  private epayco: any = null;

  constructor() {
    this.epayco = require("epayco-sdk-node")({
      apiKey: "3ee3536f1a43c9102dd1f97b491a1a4d",
      privateKey: "40f61af9c1a1dec2ae658873674beaf1",
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
    console.log(
      "🚀 ~ EpaycoSdkService ~ validarTransaccion: Inicia para refPayco: " +
        refPayco
    );
    let res = null;

    try {
      res = await this.epayco.charge.get(refPayco);
    } catch (error) {
      let date: string = variablesGlobales.date.toISOString();
      let data: IBackLogs = {
        date: new Date(date),
        userId: variablesGlobales.userId,
        log: `EpaycoSdkService ~ validarTransaccion ~ JSON.stringify(error): ${JSON.stringify(
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

      return null as any;
    }

    if (!res.success || !res.data) return false;
    if (!dataRecibida) return true;

    let data: IEpaycoTransRes = res.data;

    return Helpers.areObjectsEqual(data, dataRecibida);
  }
}
