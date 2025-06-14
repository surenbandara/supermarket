// Core
import { useContext, useState } from 'react';
import Image from 'next/image';

// Custom Components
import ActionMenu from '@/lib/ui/useable-components/action-menu';
import CustomInputSwitch from '../../custom-input-switch';

// Interfaces and Types
import { IActionMenuProps } from '@/lib/utils/interfaces/action-menu.interface';
import { IProductResponse } from '@/lib/utils/interfaces/product.interface';  // Adjusted to use product interface

import { useTranslations } from 'next-intl';

export const PRODUCT_TABLE_COLUMNS = ({
  menuItems,
}: {
  menuItems: IActionMenuProps<IProductResponse>['items'];
}) => {
  // Hooks
  const t = useTranslations();

  return [
    { headerName: t('Name'), propertyName: 'name' },
    {
          headerName: t('Image'),
          propertyName: 'image',
          body: (product: IProductResponse) => {
            return (
              <Image
                width={30}
                height={30}
                alt={t('Store')}
                src={
                  product.image
                    ? product.image
                    : 'https://images.unsplash.com/photo-1595418917831-ef942bd9f9ec?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
                }
              />
            );
          },
        },
    { headerName: "Shop", propertyName: 'shop' },
    { headerName: t('Price'), propertyName: 'price' }, 
    { headerName: t('Quantity'), propertyName: 'quantity' }, 
    { headerName: t('Brand'), propertyName: 'brand' },
    // {
    //   headerName: t('Cusine'), 
    //   propertyName: 'cusine',
    //   body: (product: IProductResponse) => (
    //     <div className="flex flex-wrap gap-2">
    //       {product.cusine.map((cuisineItem, index) => (
    //         <span 
    //           key={index} 
    //           className="bg-green-200 text-green-800 px-2 py-1 rounded-full text-sm"
    //         >
    //           {cuisineItem}
    //         </span>
    //       ))}
    //     </div>
    //   ),
    // },
    {
      propertyName: 'actions',
      body: (product: IProductResponse) => (
        <ActionMenu items={menuItems} data={product} />
      ),
    },
  ];
};
