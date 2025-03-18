import { IDropdownSelectItem } from '../global.interface';

// Errors
export interface IRestaurantFormErrors {
  name: string[];
  vendorName: string[];
  vendorPhoneNumber: string[];
  vendorEmai: string[];
  timestamp: string[];
  category: string[];
  image?: string[];
}


export interface IRestaurantForm {
  name: string;
  vendorName: string;
  vendorPhoneNumber: string;
  vendorEmai: string;
  timestamp: number;
  category: IDropdownSelectItem | null;
  image?: string;
}

export interface IRestaurantDeliveryForm {
  minDeliveryFee: number | null;
  deliveryDistance: number | null;
  deliveryFee: number | null;
}

export interface IRestaurantDeliveryFormErrors {
  minDeliveryFee: string[];
  deliveryDistance: string[];
  deliveryFee: string[];
}
