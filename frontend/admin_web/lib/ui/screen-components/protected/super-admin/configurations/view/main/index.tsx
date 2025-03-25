// Core
import { useEffect, useState } from 'react';

// Prime React
import { FilterMatchMode } from 'primereact/api';

// UI Components
import CustomDialog from '@/lib/ui/useable-components/delete-dialog';
import Table from '@/lib/ui/useable-components/table';
import { RIDER_TABLE_COLUMNS } from '@/lib/ui/useable-components/table/columns/rider-columns';

// Utilities and Data
import { IActionMenuItem } from '@/lib/utils/interfaces/action-menu.interface';

// Hooks
import { api } from '@/lib/hooks/useQueryQL';
import useToast from '@/lib/hooks/useToast';

// Data
import { useTranslations } from 'next-intl';
import { useConfiguration } from '@/lib/hooks/useConfiguration';
import { useUserContext } from '@/lib/hooks/useUser';
import { IConfiguration, IConfigurationResponse, IConfigurationsMainComponentsProps } from '@/lib/utils/interfaces';
import {  CONFIGURATION_TABLE_COLUMNS } from '@/lib/ui/useable-components/table/columns/configuration-columns';
import ConfigurationTableHeader from '../header/table-header';
import { generateDummyConfiguration } from '@/lib/utils/dummy';

export default function RidersMain({
  setIsAddConfigurationVisible,
  setConfiguration,
  reload
}: IConfigurationsMainComponentsProps) {
  // Hooks
  const t = useTranslations();
  const { showToast } = useToast();

  // State - Table
  const [deleteId, setDeleteId] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<IConfiguration[]>(
    []
  );
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [filters, setFilters] = useState({
    global: { value: '' as string | null, matchMode: FilterMatchMode.CONTAINS },
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<IConfiguration[]>([]);

  const [deleteReload, setDeleteReload] = useState<number>(0);

  const {SERVER_URL} = useConfiguration();
  const {user} = useUserContext();

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get(`${SERVER_URL}/system-parameters`, user?.jwtToken);
      setData(response as IConfiguration[]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
        if (!SERVER_URL || !user?.jwtToken) return;
    
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

  useEffect(() => {
    fetchData();
  }, [deleteReload]);

  const menuItems: IActionMenuItem<IConfiguration>[] = [
    {
      label: t('Edit'),
      command: (data?: IConfiguration) => {
        if (data) {
          setIsAddConfigurationVisible(true);
          setConfiguration(data);
        }
      },
    },
    {
      label: t('Delete'),
      command: (data?: IConfiguration) => {
        if (data) {
          setDeleteId(data.name);
        }
      },
    },
  ];

  return (
    <div className="p-3">
      <Table
        header={
          <ConfigurationTableHeader
            globalFilterValue={globalFilterValue}
            onGlobalFilterChange={onGlobalFilterChange}
          />
        }
        data={loading ? generateDummyConfiguration() : data}
        filters={filters}
        setSelectedData={setSelectedProducts}
        selectedData={selectedProducts}
        loading={loading}
        columns={CONFIGURATION_TABLE_COLUMNS({ menuItems })}
      />
      <CustomDialog
        loading={loading}
        visible={!!deleteId}
        onHide={() => {
          setDeleteId('');
        }}
        onConfirm={async () => {
          const response: any = await api.delete(`${SERVER_URL}/system-parameters`, {name: deleteId}, user?.jwtToken);
          if (Object.keys(response).length != 0 && response.status != 400) {
            showToast({
              type: 'success',
              title: t('Success'),
              message: 'Configuration deleted',
              duration: 3000,
            }); 
            setDeleteReload(deleteReload+1);
          } else {
            const message = t('ActionFailedTryAgain');
            showToast({
              type: 'error',
              title: t('Error'),
              message,
              duration: 3000,
            });
          }
          setDeleteId('');
          
        }}
        message={t('Are you sure you want to delete this parameter?')}
      />
    </div>
  );
}
