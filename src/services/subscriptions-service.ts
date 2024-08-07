import {
  CollectionReference,
  DocumentData,
  DocumentReference,
} from "firebase-admin/firestore";
import { environment } from "../environment";
import { Isubscriptions } from "../interfaces/i-subscriptions";
import { FireStorageService } from "./firestorage-service";
import { Helpers } from "../helpers/helpers";
import { EnumConsoleLogColors } from "../enums/enum-console-log-colors";

class SubscriptionsService {
  private urlSubscriptions: string = environment.urlCollections.subscriptions;
  private fireStorageService: FireStorageService;

  constructor() {
    Helpers.consoleLog(
      "~ file: subscriptions-service.ts ~ SubscriptionsService ~ constructor: Inicia",
      EnumConsoleLogColors.INFO
    );
    this.fireStorageService = new FireStorageService();
  }

  //------------ FireStorage---------------//
  /**
   * Se toma la informacion de la coleccion de subscriptions en Firebase
   *
   * @return {*}  {CollectionReference<DocumentData>}
   * @memberof SubscriptionsService
   */
  public getDataFS(): CollectionReference<DocumentData> {
    Helpers.consoleLog(
      "~ file: subscriptions-service.ts ~ SubscriptionsService ~ getDataFS: Inicia",
      EnumConsoleLogColors.INFO
    );
    return this.fireStorageService.getData(this.urlSubscriptions);
  }

  /**
   * Tomar un documento de subscriptions
   *
   * @param {string} doc
   * @return {*}  {DocumentReference<DocumentData>}
   * @memberof SubscriptionsService
   */
  public getItemFS(doc: string): DocumentReference<DocumentData> {
    Helpers.consoleLog(
      "~ file: subscriptions-service.ts ~ SubscriptionsService ~ getItemFS: Inicia Doc: " +
        doc,
      EnumConsoleLogColors.INFO
    );
    return this.fireStorageService.getItem(this.urlSubscriptions, doc);
  }

  /**
   * Guardar informacion del subscriptions
   *
   * @param {Isubscriptions} data
   * @return {*}  {Promise<any>}
   * @memberof SubscriptionsService
   */
  public postDataFS(data: Isubscriptions): Promise<any> {
    Helpers.consoleLog(
      "~ file: subscriptions-service.ts ~ SubscriptionsService ~ postDataFS: Inicia",
      EnumConsoleLogColors.INFO
    );
    return this.fireStorageService.post(this.urlSubscriptions, data);
  }

  /**
   * Actualizar subscriptions
   *
   * @param {string} doc
   * @param {Isubscriptions} data
   * @return {*}  {Promise<any>}
   * @memberof SubscriptionsService
   */
  public patchDataFS(doc: string, data: Isubscriptions): Promise<any> {
    Helpers.consoleLog(
      "~ file: subscriptions-service.ts ~ SubscriptionsService ~ patchDataFS: Inicia Doc: " +
        doc,
      EnumConsoleLogColors.INFO
    );
    return this.fireStorageService.patch(this.urlSubscriptions, doc, data);
  }

  /**
   * Eliminar subscriptions
   *
   * @param {string} doc
   * @return {*}  {Promise<any>}
   * @memberof SubscriptionsService
   */
  public deleteDataFS(doc: string): Promise<any> {
    Helpers.consoleLog(
      "~ file: subscriptions-service.ts ~ SubscriptionsService ~ deleteDataFS: Inicia Doc: " +
        doc,
      EnumConsoleLogColors.INFO
    );
    return this.fireStorageService.delete(this.urlSubscriptions, doc);
  }

  //------------ FireStorage---------------//
}

const subscripcionsServices = new SubscriptionsService();

export default subscripcionsServices;
