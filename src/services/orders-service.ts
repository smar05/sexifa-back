import { environment } from "../environment";
import { Iorders } from "../interfaces/i-orders";
import { FireStorageService } from "./firestorage-service";

export class OrdersService {
  private urlOrders: string = environment.urlCollections.orders;

  constructor(private fireStorageService: FireStorageService) {}

  //------------ FireStorage---------------//
  /**
   * Se toma la informacion de la coleccion de Orders en Firebase
   *
   * @return {*}  {Promise<any>}
   * @memberof OrdersService
   */
  public getDataFS(): Promise<any> {
    return this.fireStorageService.getData(this.urlOrders);
  }

  /**
   * Tomar un documento de Orders
   *
   * @param {string} doc
   * @return {*}  {Promise<any>}
   * @memberof OrdersService
   */
  public getItemFS(doc: string): Promise<any> {
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
