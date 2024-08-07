import {
  CollectionReference,
  DocumentData,
  DocumentReference,
} from "firebase-admin/firestore";
import { environment } from "../environment";
import { FireStorageService } from "./firestorage-service";
import { IBackLogs } from "../interfaces/i-back-logs";
import { variablesGlobales } from "../variables-globales";
import { Helpers } from "../helpers/helpers";
import { EnumConsoleLogColors } from "../enums/enum-console-log-colors";

class BackLogsService {
  private urlBackLogs: string = environment.urlCollections.back_logs;
  private fireStorageService: FireStorageService;

  constructor() {
    Helpers.consoleLog(
      "~ file: back-logs-service.ts: ~ BackLogsService ~ constructor: Inicia",
      EnumConsoleLogColors.INFO
    );
    this.fireStorageService = new FireStorageService();
  }

  //------------ FireStorage---------------//
  /**
   * Se toma la informacion de la coleccion de back logs en Firebase
   *
   * @return {*}  {CollectionReference<DocumentData>}
   * @memberof BackLogsService
   */
  public getDataFS(): CollectionReference<DocumentData> {
    Helpers.consoleLog(
      "~ file: back-logs-service.ts: ~ BackLogsService ~ getDataFS: Inicia",
      EnumConsoleLogColors.INFO
    );
    return this.fireStorageService.getData(this.urlBackLogs);
  }

  /**
   * Tomar un documento de back logs
   *
   * @param {string} doc
   * @return {*}  {DocumentReference<DocumentData>}
   * @memberof BackLogsService
   */
  public getItemFS(doc: string): DocumentReference<DocumentData> {
    Helpers.consoleLog(
      `~ file:back-logs-service.ts: ~ BackLogsService ~ getItemFS: Inicia Doc: ${doc}`,
      EnumConsoleLogColors.INFO
    );
    return this.fireStorageService.getItem(this.urlBackLogs, doc);
  }

  /**
   * Guardar informacion del back logs
   *
   * @param {IBackLogs} data
   * @return {*}  {Promise<any>}
   * @memberof BackLogsService
   */
  public postDataFS(data: IBackLogs): Promise<any> {
    Helpers.consoleLog(
      "~ file: back-logs-service.ts: ~ BackLogsService ~ postDataFS: Inicia",
      EnumConsoleLogColors.INFO
    );
    return this.fireStorageService.post(this.urlBackLogs, data);
  }

  /**
   * Actualizar back logs
   *
   * @param {string} doc
   * @param {IBackLogs} data
   * @return {*}  {Promise<any>}
   * @memberof BackLogsService
   */
  public patchDataFS(doc: string, data: IBackLogs): Promise<any> {
    Helpers.consoleLog(
      `~ file: back-logs-service.ts: ~ BackLogsService ~ patchDataFS: Inicia Doc: ${doc}`,
      EnumConsoleLogColors.INFO
    );
    return this.fireStorageService.patch(this.urlBackLogs, doc, data);
  }

  /**
   * Eliminar back logs
   *
   * @param {string} doc
   * @return {*}  {Promise<any>}
   * @memberof BackLogsService
   */
  public deleteDataFS(doc: string): Promise<any> {
    Helpers.consoleLog(
      `~ file: back-logs-service.ts: ~ BackLogsService ~ deleteDataFS: Inicia Doc: ${doc}`,
      EnumConsoleLogColors.INFO
    );
    return this.fireStorageService.delete(this.urlBackLogs, doc);
  }

  /**
   * Metodo general para manejar los catch
   *
   * @param {string} consoleLog
   * @param {string} log
   * @memberof BackLogsService
   */
  public catchProcessError(consoleLog: string, log: string): void {
    Helpers.consoleLog(consoleLog, EnumConsoleLogColors.ERROR);

    let date: string = variablesGlobales.date
      ? variablesGlobales.date.toISOString()
      : "";
    let data: IBackLogs = {
      userId: variablesGlobales?.userId,
      date: date ? new Date(date) : (null as any),
      log,
    };

    backLogsServices
      .postDataFS(data)
      .then((res) => {})
      .catch((err) => {
        Helpers.consoleLog("~ Server ~ err:", EnumConsoleLogColors.INFO, [err]);
        throw err;
      });
  }

  //------------ FireStorage---------------//
}

const backLogsServices = new BackLogsService();

export default backLogsServices;
