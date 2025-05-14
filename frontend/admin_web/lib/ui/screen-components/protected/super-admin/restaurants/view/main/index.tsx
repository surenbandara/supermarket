// Core
import { useMutation } from '@apollo/client';
import { useContext, useEffect, useState } from 'react';

// Prime React
import { FilterMatchMode } from 'primereact/api';

// UI Components
import CustomDialog from '@/lib/ui/useable-components/delete-dialog';
import Table from '@/lib/ui/useable-components/table';

// Utilities and Data
import { IActionMenuItem } from '@/lib/utils/interfaces/action-menu.interface';

// Hooks
import { api, useQueryGQL } from '@/lib/hooks/useQueryQL';
import useToast from '@/lib/hooks/useToast';

// GraphQL and Utilities
import { IQueryResult, IRestaurantResponse, IUserDataResponse } from '@/lib/utils/interfaces';

// Data
import { generateDummyRestaurants } from '@/lib/utils/dummy';
import { useTranslations } from 'next-intl';
import { useConfiguration } from '@/lib/hooks/useConfiguration';
import { useUserContext } from '@/lib/hooks/useUser';
import { RESTAURANT_TABLE_COLUMNS } from '@/lib/ui/useable-components/table/columns/restaurant-column';
import RestaurantsTableHeader from '../header/table-header';

export default function RestaurantsMain({
  setIsAddRestaurantVisible,
  setRestaurant,
  reload
}: any) {
  // Hooks
  const t = useTranslations();
  const { showToast } = useToast();

  // State - Table
  const [deleteId, setDeleteId] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<IRestaurantResponse[]>(
    []
  );
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [filters, setFilters] = useState({
    global: { value: '' as string | null, matchMode: FilterMatchMode.CONTAINS },
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<IRestaurantResponse[]>([]);

  const {SERVER_URL} = useConfiguration();
  const {user} = useUserContext();

  useEffect(() => {
        if (!SERVER_URL || !user?.jwtToken) return;
      
        const fetchData = async () => {
          setLoading(true);
          try {
            const response = await api.get(`${SERVER_URL}/shop`, user.jwtToken);
            setData(response as IRestaurantResponse[]);
          } catch (error) {
          } finally {
            setLoading(false);
          }
        };
    
        fetchData();
      }, [user?.jwtToken, reload]);

  // For global search
  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const _filters = { ...filters };
    _filters['global'].value = value;
    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const menuItems: IActionMenuItem<IRestaurantResponse>[] = [
    {
      label: t('Edit'),
      command: (data?: IRestaurantResponse) => {
        if (data) {
          setIsAddRestaurantVisible(true);
          setRestaurant(data);
        }
      },
    }
  ];

  return (
    <div className="p-3">
      <Table
        header={
          <RestaurantsTableHeader
            globalFilterValue={globalFilterValue}
            onGlobalFilterChange={onGlobalFilterChange}
          />
        }
        data={loading ? generateDummyRestaurants() : data}
        filters={filters}
        setSelectedData={setSelectedProducts}
        selectedData={selectedProducts}
        loading={loading}
        columns={RESTAURANT_TABLE_COLUMNS({ menuItems })}
      />
      <CustomDialog
        loading={loading}
        visible={!!deleteId}
        onHide={() => {
          setDeleteId('');
        }}
        onConfirm={() => {
          
        }}
        message={t('Are you sure you want to delete this item?')}
      />
    </div>
  );
}
