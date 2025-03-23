import { IDropdownSelectItem } from '../global.interface';

export interface IRiderForm {
  name: string;
  email: string;
  phoneNumber: string;
  vehicle: string;
  available: boolean;
}

export interface IRiderErrors {
  name: string[];
  email: string[];
  phoneNumber: string[];
  vehicle: string[];
  available: string[];
}
