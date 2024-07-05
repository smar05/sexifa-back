export interface Iorders {
  id?: string;
  date_created: string;
  ids_subscriptions: string[];
  userId: string;
  status: string;
  payMethod: string;
  price: number;
  idPay: string;
  currency: string;
  user_view: boolean; // Campo para saber si el usuario recibe la informacion en el front
}
