export interface ISignInForm {
  email: string;
  password: string;
}

export interface ISignInFormErrors {
  email: string[];
  password: string[];
}

export interface ISignInOwnerRestaurants {
  _id: string;
  orderId: string;
  name: string;
  image: string;
  address: string;
}

export interface IBasicUserDetails {
  role: string;
  email: string;
}

export interface IUserLoginDataResponse {
  jwtToken: string;
  basicUserDetails: IBasicUserDetails;
}
