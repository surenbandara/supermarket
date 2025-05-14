import { ReactNode } from 'react';
import { IGlobalComponentProps, IGlobalProps } from './global.interface';
import { TSideBarFormPosition } from '../types/sidebar';

export interface IConfigurationContextProps extends IGlobalProps {}

export interface IConfiguration {
  _id: string;
  pushToken?: string;
  webClientID?: string;
  publishableKey?: string;
  clientId?: string;
  googleApiKey?: string;
  webAmplitudeApiKey?: string;
  appAmplitudeApiKey?: string;
  googleColor?: string;
  webSentryUrl?: string;
  apiSentryUrl?: string;
  customerAppSentryUrl?: string;
  restaurantAppSentryUrl?: string;
  riderAppSentryUrl?: string;
  skipEmailVerification?: boolean;
  skipMobileVerification?: boolean;
  currency?: string;
  currencySymbol?: string;
  deliveryRate: number;
  googleMapLibraries: string;
  twilioEnabled: boolean;
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  twilioPhoneNumber?: string;
  firebaseKey?: string;
  appId?: string;
  authDomain?: string;
  storageBucket?: string;
  msgSenderId?: string;
  measurementId?: string;
  projectId?: string;
  dashboardSentryUrl?: string;
  cloudinaryUploadUrl?: string;
  cloudinaryApiKey?: string;
  vapidKey?: string;
  isPaidVersion?: boolean;
  email?: string;
  emailName?: string;
  password?: string;
  enableEmail?: boolean;
  clientSecret?: string;
  sandbox?: boolean;
  secretKey?: string;
  formEmail?: string;
  sendGridApiKey?: string;
  sendGridEnabled?: boolean;
  sendGridEmail?: string;
  sendGridEmailName?: string;
  sendGridPassword?: string;
  androidClientID?: string;
  iOSClientID?: string;
  expoClientID?: string;
  termsAndConditions?: string;
  privacyPolicy?: string;
  testOtp?: string;
  enableRiderDemo?: boolean;
  enableRestaurantDemo?: boolean;
  enableAdminDemo?: boolean;
  costType?: string;
  name: string;
}

export interface IConfigurationResponse {
  __typename: 'Configuration';
  name: string;
  value: string;
}

// Define the structure of the query result object
export interface IConfigurationDataResponse {
  riders: IConfigurationResponse[];
}

export interface IConfigurationsMainComponentsProps extends IGlobalComponentProps {
  setIsAddConfigurationVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setConfiguration: React.Dispatch<React.SetStateAction<IConfiguration | null>>;
  reload: number;
}

export interface IConfigurationHeaderProps extends IGlobalComponentProps {
  setIsAddConfigurationVisible: (visible: boolean) => void;
}

export interface IConfigurationAddFormComponentProps extends IGlobalComponentProps {
  position?: TSideBarFormPosition;
  isAddConfigurationVisible: boolean;
  onHide: () => void;
  configuration: IConfiguration | null;
  setReload: React.Dispatch<React.SetStateAction<number>>;
}

export interface IConfigurationTableHeaderProps {
  globalFilterValue: string;
  onGlobalFilterChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface IConfigurationUnresolved {
  currency: string;
  currencySymbol: string;
  deliveryRate: number;
}

export interface IConfigurationProviderProps {
  children: ReactNode;
}
