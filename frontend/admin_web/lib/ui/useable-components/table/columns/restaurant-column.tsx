'use client';

// Core
import Image from 'next/image';
import { useContext, useState } from 'react';

// Context
import { ToastContext } from '@/lib/context/global/toast.context';

// Apollo Client
import { ApolloError, useMutation } from '@apollo/client';

// Custom Components
import CustomInputSwitch from '../../custom-input-switch';

// Interfaces
import { IActionMenuProps, IRestaurantResponse } from '@/lib/utils/interfaces';

// GraphQL Queries and Mutations
import { DELETE_RESTAURANT } from '@/lib/api/graphql';

// Components
import ActionMenu from '../../action-menu';
import { useTranslations } from 'next-intl';

export const RESTAURANT_TABLE_COLUMNS = ({
  menuItems,
}: {
  menuItems: IActionMenuProps<IRestaurantResponse>['items'];
}) => {
  // Hooks
  const t = useTranslations();

  // Context
  const { showToast } = useContext(ToastContext);

  // State
  const [deletingRestaurant, setDeletingRestaurant] = useState<{
    id: string;
    isActive: boolean;
  }>({ id: '', isActive: false });

  // API
  const [deleteRestaurant] = useMutation(DELETE_RESTAURANT, {
    onCompleted: () => {
      showToast({
        type: 'success',
        title: t('Store Status'),
        message: `${t('Store has been marked as')} ${deletingRestaurant.isActive ? t('in-active') : t('active')}`,
        duration: 2000,
      });
    },
    onError,
  });

  function onError({ graphQLErrors, networkError }: ApolloError) {
    showToast({
      type: 'error',
      title: t('Store Status Change'),
      message:
        graphQLErrors[0]?.message ??
        networkError?.message ??
        t('Store Status Change Failed'),
      duration: 2500,
    });

    setDeletingRestaurant({
      ...deletingRestaurant,
      id: '',
    });
  }

  return [
    {
      headerName: t('Image'),
      propertyName: 'image',
      body: (restaurant: IRestaurantResponse) => {
        return (
          <Image
            width={30}
            height={30}
            alt={t('Store')}
            src={
              restaurant.image
                ? restaurant.image
                : 'https://images.unsplash.com/photo-1595418917831-ef942bd9f9ec?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
            }
          />
        );
      },
    },
    { headerName: t('Name'), propertyName: 'name' },
    { headerName: t('Vendor'), propertyName: 'vendorName' },
    {
      headerName: t('Email'),
      propertyName: 'vendorEmai',
    },
    {
      headerName: t('Category'),
      propertyName: 'category',
    },
    {
      propertyName: 'actions',
      body: (rowData: IRestaurantResponse) => (
        <ActionMenu items={menuItems} data={rowData} />
      ),
    },
  ];
};
