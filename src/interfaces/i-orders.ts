export interface Iorders {
  id?: number;
  date_created: string;
  ids_subscriptions: string[];
  userId: string;
  status: string;
  payMethod: string;
  price: number;
  usd_cop: number;
  idPay: string;
}
