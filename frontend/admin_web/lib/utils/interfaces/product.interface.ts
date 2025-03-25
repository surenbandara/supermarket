// Interfaces
import { TSideBarFormPosition } from '../types/sidebar';
import { IGlobalComponentProps } from './global.interface';

export interface IProductResponse {
  _id: string;
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


// Define the structure of the query result object
export interface IProductsDataResponse {
  products: IProductResponse[];
}

export interface IProductsHeaderComponentsProps extends IGlobalComponentProps {
  setIsAddProductVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface IProductsMainComponentsProps extends IGlobalComponentProps {
  setIsAddProductVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setProduct: React.Dispatch<React.SetStateAction<IProductResponse | null>>;
  reload: number;
}

export interface IProductsAddFormComponentProps extends IGlobalComponentProps {
  position?: TSideBarFormPosition;
  isAddProductVisible: boolean;
  onHide: () => void;
  product: IProductResponse | null;
  setReload: React.Dispatch<React.SetStateAction<number>>;
}

export interface IProductHeaderProps extends IGlobalComponentProps {
  setIsAddProductVisible: (visible: boolean) => void;
}

export interface IProductsTableHeaderProps {
  globalFilterValue: string;
  onGlobalFilterChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface IProductsResponseGraphQL {
  products: IProductResponse[];
}
