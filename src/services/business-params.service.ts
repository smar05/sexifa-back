import { DocumentData, DocumentReference } from "firebase-admin/firestore";
import { environment } from "../environment";
import { FireStorageService } from "./firestorage-service";

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
    console.log(
      "🚀 ~ file: business-params.service.ts ~ BusinessParamsService ~ constructor: Inicia"
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
    console.log(
      "🚀 ~ file: business-params.service.ts ~ BusinessParamsService ~ getItemFS: Inicia Doc: " +
        doc
    );
    return this.fireStorageService.getItem(this.urlBusinessParams, doc);
  }

  //------------ FireStorage---------------//
}

const businessParamsService = new BusinessParamsService();

export default businessParamsService;
