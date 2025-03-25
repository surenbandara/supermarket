import { IDropdownSelectItem } from '../global.interface';

export interface IProductForm {
  id: number;
  name: string;
  price: number;
  quantity: number;
  cusine: string[];
  brand: string;
  shop: string;
  timestamp: number;
  image: string;
  discount: number;
}

export interface IProductErrors {
  id: string[];
  name: string[];
  price: string[];
  quantity: string[];
  cusine: string[];
  brand: string[];
  shop: string[];
  timestamp: string[];
  image: string[];
  discount: string[];
}
