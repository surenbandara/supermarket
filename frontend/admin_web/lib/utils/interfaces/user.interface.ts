// Interfaces
import { TSideBarFormPosition } from '../types/sidebar';
import { IGlobalComponentProps } from './global.interface';

export interface IUserResponseZone {
  __typename: 'Zone';
  _id: string;
  title: string;
}

export interface IUserResponse {
  __typename: 'User';
  _id: string;
  name: string;
  username: string;
  password: string;
  phone: string;
  createdAt: Date;
  available: boolean;
  assigned: string[];
  zone: IUserResponseZone;
}

// Define the structure of the query result object
export interface IUserDataResponse {
  User: IUserResponse[];
}

export interface IUsersHeaderComponentsProps extends IGlobalComponentProps {
  setIsAddUserVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface IUsersMainComponentsProps extends IGlobalComponentProps {
  setIsAddUserVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setUser: React.Dispatch<React.SetStateAction<IUserResponse | null>>;
}

export interface IUsersAddFormComponentProps extends IGlobalComponentProps {
  position?: TSideBarFormPosition;
  isAddUserVisible: boolean;
  onHide: () => void;
  rider: IUserResponse | null;
}

export interface IUserHeaderProps extends IGlobalComponentProps {
  setIsAddUserVisible: (visible: boolean) => void;
}
export interface IUsersTableHeaderProps {
  globalFilterValue: string;
  onGlobalFilterChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}