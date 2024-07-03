import {
  CollectionReference,
  DocumentData,
  DocumentReference,
} from "firebase-admin/firestore";
import { environment } from "../environment";
import { FireStorageService } from "./firestorage-service";
import {
  IEpaycoTransRes,
  IEpaycoTransSend,
} from "../interfaces/i-epayco-trans";

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
   * @param {IEpaycoTransRes} data
   * @return {*}  {Promise<any>}
   * @memberof EpaycoTransService
   */
  public patchDataFS(doc: string, data: IEpaycoTransRes): Promise<any> {
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
}

const epaycoTransService = new EpaycoTransService();

export default epaycoTransService;
