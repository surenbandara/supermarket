import { IDropdownSelectItem } from '../global.interface';

export interface IConfigurationForm {
  key: string;
  value: string;
}

export interface IConfigurationErrors {
  key: string[];
  value: string[];
}
