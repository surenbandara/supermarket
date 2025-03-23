'use client';

// Core
import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// PrimeReact
import { FilterMatchMode } from 'primereact/api';

// Context
import { ToastContext } from '@/lib/context/global/toast.context';
import { RestaurantsContext } from '@/lib/context/super-admin/restaurants.context';

// Custom Hooks
import { api } from '@/lib/hooks/useQueryQL';

// Custom Components
import RestaurantDuplicateDialog from '../duplicate-dialog';
import RestaurantsTableHeader from '../header/table-header';
import Table from '@/lib/ui/useable-components/table';
import CustomDialog from '@/lib/ui/useable-components/delete-dialog';

// Constants and Interfaces
import {
  IActionMenuItem,
  IQueryResult,
  IRestaurantResponse,
  IRestaurantsResponseGraphQL,
} from '@/lib/utils/interfaces';

// Method
import { onUseLocalStorage } from '@/lib/utils/methods';

// Dummy
import { generateDummyRestaurants } from '@/lib/utils/dummy';
import { DataTableRowClickEvent } from 'primereact/datatable';
import { useTranslations } from 'next-intl';
import { RESTAURANT_TABLE_COLUMNS } from '@/lib/ui/useable-components/table/columns/restaurant-column';
import { useConfiguration } from '@/lib/hooks/useConfiguration';
import { useUserContext } from '@/lib/hooks/useUser';

export default function RestaurantsMain() {
  // Hooks
  const t = useTranslations();

  // Context
  const { showToast } = useContext(ToastContext);
  //const { currentTab } = useContext(RestaurantsContext);
  // Hooks
  const router = useRouter();

  const [deleteId, setDeleteId] = useState('');
  const [duplicateId, setDuplicateId] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<
    IRestaurantResponse[]
  >([]);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const filters = {
    global: { value: globalFilterValue, matchMode: FilterMatchMode.CONTAINS },
    action: {
      value: selectedActions.length > 0 ? selectedActions : null,
      matchMode: FilterMatchMode.IN,
    },
  };
  const [isHardDeleting, setisHardDeleting] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<IRestaurantResponse[]>([]);

  const {SERVER_URL} = useConfiguration();
  const {user} = useUserContext();
  const { activeIndex } =
    useContext(RestaurantsContext);

  useEffect(() => {
      if (!SERVER_URL || !user?.jwtToken) return;
    
      const fetchData = async () => {
        console.log(data.length);
        if (data.length == 0) {
          setLoading(true);
        }
        try {
          const response = await api.get(`${SERVER_URL}/shop`, user.jwtToken);
          setData(response as IRestaurantResponse[]);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
  
      fetchData();
    }, [user?.jwtToken, activeIndex]);


  const handleDelete = async (id: string) => {
    try {
      console.log("delete")
    } catch (err) {
      showToast({
        type: 'error',
        title: t('Store Delete'),
        message: t(`Store delete failed`),
      });
      setDeleteId('');
    }
  };

  // Constants
  const menuItems: IActionMenuItem<IRestaurantResponse>[] = [
    {
      label: t('Edit'),
      command: (data?: IRestaurantResponse) => {
        if (data) {
        }
      },
    },
    {
      label: t('Delete'),
      command: (data?: IRestaurantResponse) => {
        if (data) {
        }
      },
    }
  ];

  const _restaurants = data;
  return (
    <div className="p-3">
      <Table
        header={
          <RestaurantsTableHeader
            globalFilterValue={globalFilterValue}
            onGlobalFilterChange={(e) => setGlobalFilterValue(e.target.value)}
            selectedActions={selectedActions}
            setSelectedActions={setSelectedActions}
          />
        }
        data={loading ? generateDummyRestaurants() : (_restaurants ?? [])}
        filters={filters}
        setSelectedData={setSelectedProducts}
        selectedData={selectedProducts}
        columns={RESTAURANT_TABLE_COLUMNS({ menuItems })}
        loading={loading}
      />

      <CustomDialog
        loading={isHardDeleting}
        visible={!!deleteId}
        onHide={() => {
          setDeleteId('');
        }}
        onConfirm={() => {
          handleDelete(deleteId);
        }}
        message={t('Are you sure you want to delete this store?')}
      />

      <RestaurantDuplicateDialog
        restaurantId={duplicateId}
        visible={!!duplicateId}
        onHide={() => {
          setDuplicateId('');
        }}
      />
    </div>
  );
}
