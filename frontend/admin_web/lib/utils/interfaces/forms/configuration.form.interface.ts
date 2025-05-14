import { IDropdownSelectItem } from '../global.interface';

export interface IConfigurationForm {
  name: string;
  value: string;
}

export interface IConfigurationErrors {
  name: string[];
  value: string[];
}
