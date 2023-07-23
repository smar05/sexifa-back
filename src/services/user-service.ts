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
    return this.fireStorageService.delete(this.urlUsers, doc);
  }

  //------------ FireStorage---------------//
}

const userServices = new UserService();

export default userServices;
