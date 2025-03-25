import * as Yup from 'yup';
import { IDropdownSelectItem } from '../interfaces';

export const ProductSchema = Yup.object().shape({
  id: Yup.number().required('Required'),
  name: Yup.string()
    .max(100, 'Name cannot be longer than 100 characters')
    .trim()
    .matches(/\S/, 'Name cannot be only spaces')
    .required('Required'),
  price: Yup.number()
    .min(0, 'Price must be a positive number')
    .required('Required'),
  quantity: Yup.number()
    .min(0, 'Quantity must be a positive number')
    .required('Required'),
  cusine: Yup.mixed<IDropdownSelectItem>().nullable().required('Required'),
  brand: Yup.string().max(50, 'Brand cannot be longer than 50 characters').required('Required'),
  shop: Yup.string().max(50, 'Shop cannot be longer than 50 characters').required('Required'),
  timestamp: Yup.number().required('Required'),
  image: Yup.string().url('Invalid image URL').optional(),
  discount: Yup.number().min(0, 'Discount must be a positive number').optional()
});
