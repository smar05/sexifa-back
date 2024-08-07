import {
  CollectionReference,
  DocumentData,
  DocumentReference,
} from "firebase-admin/firestore";
import db from "../firebase";
import { Helpers } from "../helpers/helpers";
import { EnumConsoleLogColors } from "../enums/enum-console-log-colors";

export class FireStorageService {
  constructor() {
    Helpers.consoleLog(
      "~ file: firestorage-service.ts ~ FireStorageService ~ constructor: Inicia",
      EnumConsoleLogColors.INFO
    );
  }

  /**
   * Traer datos de una coleccion
   *
   * @param {string} collection
   * @return {*}  {CollectionReference}
   * @memberof FireStorageService
   */
  public getData(collection: string): CollectionReference<DocumentData> {
    Helpers.consoleLog(
      "~ file: firestorage-service.ts ~ FireStorageService ~ getData: Inicia",
      EnumConsoleLogColors.INFO
    );
    return db.collection(collection);
  }

  /**
   * Traer un documento de una coleccion
   *
   * @param {string} collection
   * @param {string} doc
   * @return {*}  {DocumentReference}
   * @memberof FireStorageService
   */
  public getItem(
    collection: string,
    doc: string
  ): DocumentReference<DocumentData> {
    Helpers.consoleLog(
      `~ file: firestorage-service.ts ~ FireStorageService ~ getItem: Inicia Coleccion: ${collection} Doc: ${doc}`,
      EnumConsoleLogColors.INFO
    );
    return db.collection(collection).doc(doc);
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
    Helpers.consoleLog(
      `~ file: firestorage-service.ts ~ FireStorageService ~ post: Inicia Coleccion: ${collection}`,
      EnumConsoleLogColors.INFO
    );
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
    Helpers.consoleLog(
      `~ file: firestorage-service.ts ~ FireStorageService ~ patch: Inicia Coleccion: ${collection} Doc: ${doc}`,
      EnumConsoleLogColors.INFO
    );
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
    Helpers.consoleLog(
      `~ file: firestorage-service.ts ~ FireStorageService ~ delete: Inicia Coleccion: ${collection} Doc: ${doc}`,
      EnumConsoleLogColors.INFO
    );
    return db.collection(collection).doc(doc).delete();
  }
}
