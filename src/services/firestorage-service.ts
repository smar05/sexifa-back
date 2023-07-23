import db from "../firebase";

export class FireStorageService {
  constructor() {}

  /**
   * Traer datos de una coleccion
   *
   * @param {string} collection
   * @return {*}  {Promise<any>}
   * @memberof FireStorageService
   */
  public getData(collection: string): Promise<any> {
    return db.collection(collection).get();
  }

  /**
   * Traer un documento de una coleccion
   *
   * @param {string} collection
   * @param {string} doc
   * @return {*}  {Promise<any>}
   * @memberof FireStorageService
   */
  public getItem(collection: string, doc: string): Promise<any> {
    return db.collection(collection).doc(doc).get();
  }

  /**
   * Guardar la informacion en una coleccion
   *
   * @param {string} collection
   * @param {Object} data
   * @return {*}  {Promise<any>}
   * @memberof FireStorageService
   */
  public post(collection: string, data: Object): Promise<any> {
    return db.collection(collection).add(data);
  }

  /**
   * Actualizar un documento de una coleccion
   *
   * @param {string} collection
   * @param {string} doc
   * @param {Object} data
   * @return {*}  {Promise<any>}
   * @memberof FireStorageService
   */
  public patch(collection: string, doc: string, data: Object): Promise<any> {
    return db.collection(collection).doc(doc).set(data);
  }

  /**
   * Elimina un documento de una coleccion
   *
   * @param {string} collection
   * @param {string} doc
   * @return {*}  {Promise<any>}
   * @memberof FireStorageService
   */
  public delete(collection: string, doc: string): Promise<any> {
    return db.collection(collection).doc(doc).delete();
  }
}
