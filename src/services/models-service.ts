import {
  CollectionReference,
  DocumentData,
  DocumentReference,
} from "firebase-admin/firestore";
import { environment } from "../environment";
import { Imodels } from "../interfaces/i-models";
import { FireStorageService } from "./firestorage-service";
import {
  IpriceModel,
  PriceTypeLimitEnum,
  TypeOfferEnum,
} from "../interfaces/i-price-model";

class ModelsService {
  private urlModels: string = environment.urlCollections.models;
  private fireStorageService: FireStorageService;

  constructor() {
    console.log(
      "🚀 ~ file: models-service.ts ~ ModelsService ~ constructor: Inicia"
    );
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
    console.log(
      "🚀 ~ file: models-service.ts ~ ModelsService ~ getDataFS: Inicia"
    );
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
    console.log(
      `🚀 ~ file: models-service.ts ~ ModelsService ~ getItemFS: Inicia Doc: ${doc}`
    );
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
    console.log(
      "🚀 ~ file: models-service.ts ~ ModelsService ~ postDataFS: Inicia"
    );
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
    console.log(
      `🚀 ~ file: models-service.ts ~ ModelsService ~ patchDataFS: Inicia Doc: ${doc}`
    );
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
    console.log(
      `🚀 ~ file: models-service.ts ~ ModelsService ~ deleteDataFS: Inicia Doc: ${doc}`
    );
    return this.fireStorageService.delete(this.urlModels, doc);
  }

  //------------ FireStorage---------------//

  /**
   * Obtener el precio del cupo de la modelo
   *
   * @param {IpriceModel} price
   * @param {Date} [fechaActual]
   * @return {*}  {(number | undefined)}
   * @memberof ModelsService
   */
  public calculoPrecioSubscripcion(
    price: IpriceModel,
    fechaActual: Date
  ): number | undefined {
    if (
      price.value &&
      price.type_offer &&
      price.type_limit &&
      price.value_offer &&
      (price.date_offer || price.sales)
    ) {
      switch (price.type_limit) {
        case PriceTypeLimitEnum.SALES:
          if (price.sales <= 0) return price.value;

          break;

        case PriceTypeLimitEnum.DATE:
          // Crear una fecha a partir de un string (por ejemplo, "2023-07-27")
          let fechaComparacion: Date = new Date(price.date_offer?.toString());
          fechaComparacion.setDate(fechaComparacion.getDate() + 2);

          fechaComparacion.setHours(0, 0, 0, 0);

          // Comparar las fechas
          if (
            price.type_limit === PriceTypeLimitEnum.DATE &&
            fechaComparacion < fechaActual
          )
            return price.value;
          break;

        default:
          break;
      }

      switch (price.type_offer) {
        case TypeOfferEnum.DESCUENTO:
          return (
            Math.floor(price.value * (1 - price.value_offer / 100) * 100) / 100
          );

        case TypeOfferEnum.FIJO:
          return price.value - price.value_offer;

        default:
          return price.value;
      }
    } else if (price.value) {
      return price.value;
    }

    return undefined;
  }
}

const modelsServices = new ModelsService();

export default modelsServices;
