import { IDropdownSelectItem } from '../global.interface';

export interface IUserForm {
  name: string;
  username: string;
  password: string;
  confirmPassword: string;
  zone: IDropdownSelectItem | null;
  phone: number | null;
}

export interface IUserErrors {
  name: string[];
  username: string[];
  password: string[];
  confirmPassword: string[];
  zone: string[];
  phone: string[];
}
