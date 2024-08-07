import {
  CollectionReference,
  DocumentData,
  DocumentReference,
} from "firebase-admin/firestore";
import { environment } from "../environment";
import { Iuser } from "../interfaces/i-user";
import { FireStorageService } from "./firestorage-service";
import { Helpers } from "../helpers/helpers";
import { EnumConsoleLogColors } from "../enums/enum-console-log-colors";

class UserService {
  private urlUsers: string = environment.urlCollections.users;
  private fireStorageService: FireStorageService;

  constructor() {
    Helpers.consoleLog(
      "~ file: user-service.ts ~ UserService ~ constructor: Inicia",
      EnumConsoleLogColors.INFO
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
    Helpers.consoleLog(
      "~ file: user-service.ts ~ UserService ~ getDataFS: Inicia",
      EnumConsoleLogColors.INFO
    );
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
    Helpers.consoleLog(
      "~ file: user-service.ts ~ UserService ~ getItemFS: Inicia Doc: " + doc,
      EnumConsoleLogColors.INFO
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
    Helpers.consoleLog(
      "~ file: user-service.ts ~ UserService ~ postDataFS: Inicia",
      EnumConsoleLogColors.INFO
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
    Helpers.consoleLog(
      "~ file: user-service.ts ~ UserService ~ patchDataFS: Inicia Doc: " + doc,
      EnumConsoleLogColors.INFO
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
    Helpers.consoleLog(
      "~ file: user-service.ts ~ UserService ~ deleteDataFS: Inicia Doc: " +
        doc,
      EnumConsoleLogColors.INFO
    );
    return this.fireStorageService.delete(this.urlUsers, doc);
  }

  //------------ FireStorage---------------//
}

const userServices = new UserService();

export default userServices;
