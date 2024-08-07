import {
  CollectionReference,
  DocumentData,
  DocumentReference,
} from "firebase-admin/firestore";
import { environment } from "../environment";
import { Iorders } from "../interfaces/i-orders";
import { FireStorageService } from "./firestorage-service";
import { Helpers } from "../helpers/helpers";
import { EnumConsoleLogColors } from "../enums/enum-console-log-colors";

class OrdersService {
  private urlOrders: string = environment.urlCollections.orders;
  private fireStorageService: FireStorageService;

  constructor() {
    Helpers.consoleLog(
      "~ file: orders-service.ts ~ OrdersService ~ constructor: Inicia",
      EnumConsoleLogColors.INFO
    );

    this.fireStorageService = new FireStorageService();
  }

  //------------ FireStorage---------------//
  /**
   * Se toma la informacion de la coleccion de Orders en Firebase
   *
   * @return {*}  {CollectionReference<DocumentData>}
   * @memberof OrdersService
   */
  public getDataFS(): CollectionReference<DocumentData> {
    Helpers.consoleLog(
      "~ file: orders-service.ts ~ OrdersService ~ getDataFS: Inicia",
      EnumConsoleLogColors.INFO
    );
    return this.fireStorageService.getData(this.urlOrders);
  }

  /**
   * Tomar un documento de Orders
   *
   * @param {string} doc
   * @return {*}  {DocumentReference<DocumentData>}
   * @memberof OrdersService
   */
  public getItemFS(doc: string): DocumentReference<DocumentData> {
    Helpers.consoleLog(
      "~ file: orders-service.ts ~ OrdersService ~ getItemFS: Inicia Doc: " +
        doc,
      EnumConsoleLogColors.INFO
    );
    return this.fireStorageService.getItem(this.urlOrders, doc);
  }

  /**
   * Guardar informacion del Orders
   *
   * @param {Iorders} data
   * @return {*}  {Promise<any>}
   * @memberof OrdersService
   */
  public postDataFS(data: Iorders): Promise<any> {
    Helpers.consoleLog(
      "~ file: orders-service.ts ~ OrdersService ~ postDataFS: Inicia",
      EnumConsoleLogColors.INFO
    );
    return this.fireStorageService.post(this.urlOrders, data);
  }

  /**
   * Actualizar Orders
   *
   * @param {string} doc
   * @param {Iorders} data
   * @return {*}  {Promise<any>}
   * @memberof OrdersService
   */
  public patchDataFS(doc: string, data: Iorders): Promise<any> {
    Helpers.consoleLog(
      "~ file: orders-service.ts ~ OrdersService ~ patchDataFS: Inicia Doc: " +
        doc,
      EnumConsoleLogColors.INFO
    );
    return this.fireStorageService.patch(this.urlOrders, doc, data);
  }

  /**
   * Eliminar Orders
   *
   * @param {string} doc
   * @return {*}  {Promise<any>}
   * @memberof OrdersService
   */
  public deleteDataFS(doc: string): Promise<any> {
    Helpers.consoleLog(
      "~ file: orders-service.ts ~ OrdersService ~ deleteDataFS: Inicia Doc: " +
        doc,
      EnumConsoleLogColors.INFO
    );
    return this.fireStorageService.delete(this.urlOrders, doc);
  }

  //------------ FireStorage---------------//
}

const ordersServices = new OrdersService();

export default ordersServices;
