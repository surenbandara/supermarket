import * as Yup from 'yup';
import { IDropdownSelectItem } from '../interfaces';

export const RestaurantSchema = Yup.object().shape({
  name: Yup.string()
    .max(35)
    .trim()
    .matches(/\S/, 'Name cannot be only spaces')
    .required('Required'),
  vendorName: Yup.string()
    .max(50)
    .trim()
    .matches(/\S/, 'Vendor name cannot be only spaces')
    .required('Required'),
  vendorPhoneNumber: Yup.string()
    .matches(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number')
    .required('Required'),
  vendorEmai: Yup.string().email('Invalid email').required('Required'),
  category: Yup.mixed<IDropdownSelectItem>().nullable().required('Required'),
  image: Yup.string().url('Invalid image URL'),
});
