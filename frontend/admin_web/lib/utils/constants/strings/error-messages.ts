import {
  ICategoryErrors,
  IOptionErrors,
  IRiderErrors,
  ISignInFormErrors,
  ISignUpFormErrors,
  IVendorErrors,
  IUpdateProfileFormErrors,
  IVariationErrors,
  IUserErrors,
} from '@/lib/utils/interfaces/forms';

import {
  IRestaurantDeliveryFormErrors,
  IRestaurantFormErrors,
} from '@/lib/utils/interfaces/forms/restaurant.form.interface';
import { ICuisineErrors } from '../../interfaces/forms/cuisine.form.interface';
import { ICouponErrors } from '../../interfaces/forms/coupon.form.interface';
import { IFoodErrors } from '../../interfaces/forms/food.form.interface';
import { INoticiationErrors } from '../../interfaces/forms/notification.form.interface';
import { IConfigurationErrors } from '../../interfaces/forms/configuration.form.interface';
import { IProductErrors } from '../../interfaces/forms/product.form.interface';

export const PasswordErrors = [
  'At least 6 characters',
  'At least one lowercase letter (a-z)',
  'At least one uppercase letter (A-Z)',
  'At least one number (0-9)',
  'At least one special character',
  'Password does not match',
];

export const SignUpErrors: ISignUpFormErrors = {
  firstName: ['Required', 'Name cannot be only spaces'],
  lastName: ['Required', 'Name cannot be only spaces'],
  email: ['Required', 'Invalid email'],
  password: ['Required', ...PasswordErrors],
  confirmPassword: ['Required', 'Password must match'],
};

export const SignInErrors: ISignInFormErrors = {
  email: ['Required', 'Invalid email'],
  password: ['Required'],
};

export const VendorErrors: IVendorErrors = {
  _id: ['Required'],
  name: ['Required', 'Name cannot be only spaces'],
  email: ['Required', 'Invalid email'],
  image: ['Required', 'Invalid image URL'],
  firstName: ['Required', 'Firstname cannot be only spaces'],
  lastName: ['Required', 'Lastname cannot be only spaces'],
  phoneNumber: [],
};

export const RestaurantErrors: IRestaurantFormErrors = {
  name: ['Name is required', 'Name cannot be only spaces'],
  vendorName: ['Vendor name is required', 'Vendor name cannot be only spaces'],
  vendorPhoneNumber: ['Vendor phone number is required', 'Invalid phone number'],
  vendorEmai: ['Vendor email is required', 'Invalid email format'],
  timestamp: ['Timestamp is required'],
  category: ['Category is required'],
  image: ['Image is required', 'Invalid image URL'],
};

export const ProfileErrors: IUpdateProfileFormErrors = {
  name: ['Required', 'Name cannot be only spaces'],
  email: ['Required', 'Invalid email'],
  address: ['Required', 'Name cannot be only spaces'],
  deliveryTime: ['Required'],
  minOrder: ['Required'],
  salesTax: ['Required'],
  orderprefix: ['Required'],
  shopType: ['Required'],
  cuisines: ['Required', 'Cuisines field must have at least 1 items'],
  image: ['Required', 'Invalid image URL'],
  logo: ['Required', 'Invalid logo URL'],
};

export const RiderErrors: IRiderErrors = {
  name: ['Required', 'Name cannot be only spaces'],
  email: ['Required'],
  phoneNumber: ['Required', ...PasswordErrors],
  vehicle: ['Required', 'Password must match'],
  available: ['Required']
};

export const ProductErrors: any = {
  id: ['Required'],
  name: ['Required', 'Name cannot be only spaces', 'Name cannot be longer than 100 characters'],
  price: ['Required', 'Price must be a positive number'],
  quantity: ['Required', 'Quantity must be a positive number'],
  cuisine: ['Required', 'At least one cuisine type is required'],
  brand: ['Required', 'Brand cannot be longer than 50 characters'],
  shop: ['Required', 'Shop cannot be longer than 50 characters'],
  timestamp: ['Required'],
  image: ['Invalid image URL'],
  discount: ['Discount must be a positive number'],
  additionalData: ['Invalid additional data'],
  available: ['Required']
};

export const ConfigurationErrors: IConfigurationErrors = {
  name: ['Required'],
  value: ['Required']
};

export const UaserErrors: IUserErrors = {
  name: ['Required', 'Name cannot be only spaces'],
  username: ['Required'],
  password: ['Required', ...PasswordErrors],
  confirmPassword: ['Required', 'Password must match'],
  zone: ['Required'],
  phone: ['Required'],
};

export const CategoryErrors: ICategoryErrors = {
  _id: [],
  title: ['Required', 'Name cannot be only spaces'],
};

export const OptionErrors: IOptionErrors = {
  _id: [],
  title: ['Required', 'Name cannot be only spaces'],
  description: [],
  price: [
    'Required',
    'Minimum value must be greater than 0',
    'Maximum price is 99999',
  ],
};

export const CuisineErrors: ICuisineErrors = {
  name: ['Required', 'Name cannot be only spaces'],
  description: ['Required', 'Name cannot be only spaces'],
  shopType: ['Required'],
  image:['Required']
};

export const CouponErrors: ICouponErrors = {
  title: ['Required', 'Name cannot be only spaces'],
  discount: ['Required'],
  enabled: ['Required'],
};
export const NotificationErrors: INoticiationErrors = {
  title: ['Required'],
  body: ['Required'],
};

export const FoodErrors: IFoodErrors = {
  title: ['Required', 'Name cannot be only spaces'],
  description: [],
  image: ['Required'],
  category: ['Required'],
  subCategory: [''],
};

export const VariationErrors: IVariationErrors = {
  title: ['Required', 'Name cannot be only spaces'],
  discounted: ['Required'],
  price: ['Required', 'Minimum value must be greater than 0'],
  isOutOfStock: ['Required'],
};

export const RestaurantDeliveryErrors: IRestaurantDeliveryFormErrors = {
  minDeliveryFee: ['Required'],
  deliveryDistance: ['Required'],
  deliveryFee: ['Required'],
};
