import { IpriceModel } from "./i-price-model";

export interface Imodels {
  id?: string;
  categorie?: string;
  name: string;
  description?: string;
  active?: string;
  price: IpriceModel[];
  groupId: string;
  gallery?: string;
  idUser?: string;
  commission: number;
}
