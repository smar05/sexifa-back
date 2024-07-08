export interface ICart {
  infoModelSubscription: IInfoModelSubscription;
  price: number;
}

export interface IInfoModelSubscription {
  idModel: string;
  timeSubscription: number;
}
