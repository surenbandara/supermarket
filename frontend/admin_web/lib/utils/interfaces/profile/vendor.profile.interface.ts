import { IGlobalComponentProps } from '../global.interface';
import {
  IQueryResult,
} from '@/lib/utils/interfaces';

export interface IVendorProfileContextData extends IGlobalComponentProps {
  isUpdateProfileVisible: boolean;
  setIsUpdateProfileVisible: React.Dispatch<React.SetStateAction<boolean>>;
  handleUpdateProfile: () => void;
  vendorProfileResponse: IQueryResult<
    any | undefined,
    undefined
  >;
  activeIndex: number;
  onActiveStepChange: (activeStep: number) => void;
  refetchVendorProfile: () => Promise<void>; // Add this line
}
