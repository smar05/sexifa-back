import {
  CollectionReference,
  DocumentData,
  DocumentReference,
} from "firebase-admin/firestore";
import { environment } from "../environment";
import { Iuser } from "../interfaces/i-user";
import { FireStorageService } from "./firestorage-service";

class UserService {
  private urlUsers: string = environment.urlCollections.users;
  private fireStorageService: FireStorageService;

  constructor() {
    console.log(
      "🚀 ~ file: user-service.ts ~ UserService ~ constructor: Inicia"
    );
    this.fireStorageService = new FireStorageService();
  }

  //------------ FireStorage---------------//
  /**
   *
   *
   * @return {*}  {CollectionReference<DocumentData>}
   * @memberof UserService
   */
  public getDataFS(): CollectionReference<DocumentData> {
    console.log("🚀 ~ file: user-service.ts ~ UserService ~ getDataFS: Inicia");
    return this.fireStorageService.getData(this.urlUsers);
  }

  /**
   *
   *
   * @param {string} doc
   * @return {*}  {DocumentReference<DocumentData>}
   * @memberof UserService
   */
  public getItemFS(doc: string): DocumentReference<DocumentData> {
    console.log(
      "🚀 ~ file: user-service.ts ~ UserService ~ getItemFS: Inicia Doc: " + doc
    );
    return this.fireStorageService.getItem(this.urlUsers, doc);
  }

  /**
   *
   *
   * @param {Iuser} data
   * @return {*}  {Promise<any>}
   * @memberof UserService
   */
  public postDataFS(data: Iuser): Promise<any> {
    console.log(
      "🚀 ~ file: user-service.ts ~ UserService ~ postDataFS: Inicia"
    );
    return this.fireStorageService.post(this.urlUsers, data);
  }

  /**
   *
   *
   * @param {string} doc
   * @param {Iuser} data
   * @return {*}  {Promise<any>}
   * @memberof UserService
   */
  public patchDataFS(doc: string, data: Iuser): Promise<any> {
    console.log(
      "🚀 ~ file: user-service.ts ~ UserService ~ patchDataFS: Inicia Doc: " +
        doc
    );
    return this.fireStorageService.patch(this.urlUsers, doc, data);
  }

  /**
   *
   *
   * @param {string} doc
   * @return {*}  {Promise<any>}
   * @memberof UserService
   */
  public deleteDataFS(doc: string): Promise<any> {
    console.log(
      "🚀 ~ file: user-service.ts ~ UserService ~ deleteDataFS: Inicia Doc: " +
        doc
    );
    return this.fireStorageService.delete(this.urlUsers, doc);
  }

  //------------ FireStorage---------------//
}

const userServices = new UserService();

export default userServices;
