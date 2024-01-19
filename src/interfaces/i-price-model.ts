export interface IpriceModel {
  time: number;
  value: number;
  sales: number;
  value_offer: number;
  type_offer: string;
  type_limit: string;
  date_offer: string;
}

export enum TypeOfferEnum {
  DESCUENTO = "Disccount",
  FIJO = "Fixed",
}

export enum PriceTypeLimitEnum {
  DATE = "date",
  SALES = "sales",
}
