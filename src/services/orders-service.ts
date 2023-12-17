import {
  CollectionReference,
  DocumentData,
  DocumentReference,
} from "firebase-admin/firestore";
import { environment } from "../environment";
import { Iorders } from "../interfaces/i-orders";
import { FireStorageService } from "./firestorage-service";

class OrdersService {
  private urlOrders: string = environment.urlCollections.orders;
  private fireStorageService: FireStorageService;

  constructor() {
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
    return this.fireStorageService.delete(this.urlOrders, doc);
  }

  //------------ FireStorage---------------//
}

const ordersServices = new OrdersService();

export default ordersServices;
