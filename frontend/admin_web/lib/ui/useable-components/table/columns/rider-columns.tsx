// Core
import { useContext, useState } from 'react';

// Custom Components
import ActionMenu from '@/lib/ui/useable-components/action-menu';
import CustomInputSwitch from '../../custom-input-switch';

// Interfaces and Types
import { IActionMenuProps } from '@/lib/utils/interfaces/action-menu.interface';
import { IRiderResponse } from '@/lib/utils/interfaces/rider.interface';

// GraphQL
import { GET_RIDERS, TOGGLE_RIDER } from '@/lib/api/graphql';
import { useMutation } from '@apollo/client';
import { ToastContext } from '@/lib/context/global/toast.context';
import { useTranslations } from 'next-intl';
import { api } from '@/lib/hooks/useQueryQL';
import { useConfiguration } from '@/lib/hooks/useConfiguration';
import { useUserContext } from '@/lib/hooks/useUser';

export const RIDER_TABLE_COLUMNS = ({
  menuItems,
}: {
  menuItems: IActionMenuProps<IRiderResponse>['items'];
}) => {
  // Hooks
  const t = useTranslations();

   const {SERVER_URL} = useConfiguration();
  const {user} = useUserContext();
  // States
  const [selectedRider, setSelectedRider] = useState<{
    id: string;
    isActive: boolean;
  }>({ id: '', isActive: false });

  const { showToast } = useContext(ToastContext);

  // Handle availability toggle
  const onHandleBannerStatusChange = async (isActive: boolean, rider: IRiderResponse) => {
    try {
      rider.available = isActive
      await api.put(`${SERVER_URL}/rider`, rider, user?.jwtToken);
    } catch (error) {
      console.log(error)
      showToast({
        type: 'error',
        title: t('Banner Status'),
        message: t('Something went wrong'),
      });
    } finally {
      setSelectedRider({ id: '', isActive: false });
    }
  };

  return [
    { headerName: t('Name'), propertyName: 'name' },
    { headerName: t('Email'), propertyName: 'email' },
    { headerName: t('Phone'), propertyName: 'phoneNumber' },
    {
      headerName: t('Available'),
      propertyName: 'available',
      body: (rider: IRiderResponse) => (
        <CustomInputSwitch
          loading={rider._id === selectedRider.id }
          isActive={rider.available}
          onChange={async () => {
            await onHandleBannerStatusChange(!rider.available, rider);
          }}
        />
      ),
    },
    {
      propertyName: 'actions',
      body: (rider: IRiderResponse) => (
        <ActionMenu items={menuItems} data={rider} />
      ),
    },
  ];
};
