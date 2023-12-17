import {
  CollectionReference,
  DocumentData,
  DocumentReference,
} from "firebase-admin/firestore";
import { environment } from "../environment";
import { Imodels } from "../interfaces/i-models";
import { FireStorageService } from "./firestorage-service";

class ModelsService {
  private urlModels: string = environment.urlCollections.models;
  private fireStorageService: FireStorageService;

  constructor() {
    this.fireStorageService = new FireStorageService();
  }

  //------------ FireStorage---------------//
  /**
   * Se toma la informacion de la coleccion de modelos en Firebase
   *
   * @return {*}  {CollectionReference<DocumentData>}
   * @memberof ModelsService
   */
  public getDataFS(): CollectionReference<DocumentData> {
    return this.fireStorageService.getData(this.urlModels);
  }

  /**
   * Tomar un documento de modelos
   *
   * @param {string} doc
   * @return {*}  {DocumentReference<DocumentData>}
   * @memberof ModelsService
   */
  public getItemFS(doc: string): DocumentReference<DocumentData> {
    return this.fireStorageService.getItem(this.urlModels, doc);
  }

  /**
   * Guardar informacion del modelo
   *
   * @param {Imodels} data
   * @return {*}  {Promise<any>}
   * @memberof ModelsService
   */
  public postDataFS(data: Imodels): Promise<any> {
    return this.fireStorageService.post(this.urlModels, data);
  }

  /**
   * Actualizar modelo
   *
   * @param {string} doc
   * @param {Imodels} data
   * @return {*}  {Promise<any>}
   * @memberof ModelsService
   */
  public patchDataFS(doc: string, data: Imodels): Promise<any> {
    return this.fireStorageService.patch(this.urlModels, doc, data);
  }

  /**
   * Eliminar modelo
   *
   * @param {string} doc
   * @return {*}  {Promise<any>}
   * @memberof ModelsService
   */
  public deleteDataFS(doc: string): Promise<any> {
    return this.fireStorageService.delete(this.urlModels, doc);
  }

  //------------ FireStorage---------------//
}

const modelsServices = new ModelsService();

export default modelsServices;
