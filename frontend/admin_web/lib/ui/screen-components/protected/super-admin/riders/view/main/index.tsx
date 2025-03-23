// Core
import { useMutation } from '@apollo/client';
import { useContext, useEffect, useState } from 'react';

// Prime React
import { FilterMatchMode } from 'primereact/api';

// Interface and Types
import {
  IRiderResponse,
  IRidersDataResponse,
  IRidersMainComponentsProps,
} from '@/lib/utils/interfaces/rider.interface';

// UI Components
import RidersTableHeader from '../header/table-header';
import CustomDialog from '@/lib/ui/useable-components/delete-dialog';
import Table from '@/lib/ui/useable-components/table';
import { RIDER_TABLE_COLUMNS } from '@/lib/ui/useable-components/table/columns/rider-columns';

// Utilities and Data
import { IActionMenuItem } from '@/lib/utils/interfaces/action-menu.interface';

// Hooks
import { api, useQueryGQL } from '@/lib/hooks/useQueryQL';
import useToast from '@/lib/hooks/useToast';

// GraphQL and Utilities
import { DELETE_RIDER, GET_RIDERS } from '@/lib/api/graphql';
import { IQueryResult, IUserDataResponse } from '@/lib/utils/interfaces';

// Data
import { generateDummyRiders } from '@/lib/utils/dummy';
import { useTranslations } from 'next-intl';
import { useConfiguration } from '@/lib/hooks/useConfiguration';
import { useUserContext } from '@/lib/hooks/useUser';

export default function RidersMain({
  setIsAddRiderVisible,
  setRider,
  reload
}: IRidersMainComponentsProps) {
  // Hooks
  const t = useTranslations();
  const { showToast } = useToast();

  // State - Table
  const [deleteId, setDeleteId] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<IRiderResponse[]>(
    []
  );
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [filters, setFilters] = useState({
    global: { value: '' as string | null, matchMode: FilterMatchMode.CONTAINS },
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<IRiderResponse[]>([]);

  const {SERVER_URL} = useConfiguration();
  const {user} = useUserContext();

  useEffect(() => {
        if (!SERVER_URL || !user?.jwtToken) return;
      
        const fetchData = async () => {
          setLoading(true);
          try {
            const response = await api.get(`${SERVER_URL}/rider`, user.jwtToken);
            setData(response as IRiderResponse[]);
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

  const menuItems: IActionMenuItem<IRiderResponse>[] = [
    {
      label: t('Edit'),
      command: (data?: IRiderResponse) => {
        if (data) {
          setIsAddRiderVisible(true);
          setRider(data);
        }
      },
    },
    {
      label: t('Delete'),
      command: (data?: IRiderResponse) => {
        if (data) {
          setDeleteId(data._id);
        }
      },
    },
  ];

  return (
    <div className="p-3">
      <Table
        header={
          <RidersTableHeader
            globalFilterValue={globalFilterValue}
            onGlobalFilterChange={onGlobalFilterChange}
          />
        }
        data={loading ? generateDummyRiders() : data}
        filters={filters}
        setSelectedData={setSelectedProducts}
        selectedData={selectedProducts}
        loading={loading}
        columns={RIDER_TABLE_COLUMNS({ menuItems })}
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
