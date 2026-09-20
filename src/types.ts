export type ItemStatus = 'falta' | 'acabando';

export interface Item {
  id: string;
  name: string;
  price: number;
  status: ItemStatus;
  priority: string;
  image: string;
  url: string;
  bought: boolean;
}

