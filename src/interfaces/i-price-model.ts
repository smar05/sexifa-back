export interface IpriceModel {
  time?: number;
  value?: number;
  value_offer?: number;
  type_offer?: string;
  date_offer?: string;
}

export enum TypeOfferEnum {
  DESCUENTO = "Disccount",
  FIJO = "Fixed",
}
