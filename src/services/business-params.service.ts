import { DocumentData, DocumentReference } from "firebase-admin/firestore";
import { environment } from "../environment";
import { FireStorageService } from "./firestorage-service";
import { Helpers } from "../helpers/helpers";
import { EnumConsoleLogColors } from "../enums/enum-console-log-colors";

export enum EnumBusinessParamsKeys {
  PUBLIC_KEY = "public_key",
  COMMISSION = "commission",
  ADMIN = "admin",
}

class BusinessParamsService {
  private urlBusinessParams: string =
    environment.urlCollections.business_params;
  private fireStorageService: FireStorageService;

  constructor() {
    Helpers.consoleLog(
      "~ file: business-params.service.ts ~ BusinessParamsService ~ constructor: Inicia",
      EnumConsoleLogColors.INFO
    );

    this.fireStorageService = new FireStorageService();
  }

  //------------ FireStorage---------------//
  /**
   * Tomar un documento de business params
   *
   * @param {EnumBusinessParamsKeys} doc
   * @return {*}  {DocumentReference<DocumentData>}
   * @memberof OrdersService
   */
  public getItemFS(
    doc: EnumBusinessParamsKeys
  ): DocumentReference<DocumentData> {
    Helpers.consoleLog(
      "~ file: business-params.service.ts ~ BusinessParamsService ~ getItemFS: Inicia Doc: " +
        doc,
      EnumConsoleLogColors.INFO
    );
    return this.fireStorageService.getItem(this.urlBusinessParams, doc);
  }

  //------------ FireStorage---------------//
}

const businessParamsService = new BusinessParamsService();

export default businessParamsService;
