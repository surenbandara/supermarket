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
import { CATEGORY_TABLE_COLUMNS } from '@/lib/ui/useable-components/table/columns/category-columns';
import ConfigurationTableHeader from '../header/table-header';

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

  const {SERVER_URL} = useConfiguration();
  const {user} = useUserContext();

  useEffect(() => {
        if (!SERVER_URL || !user?.jwtToken) return;
      
        const fetchData = async () => {
          setLoading(false);
          try {
            const response = await api.get(`${SERVER_URL}/configurations`, user.jwtToken);
            setData(response as IConfiguration[]);
          } catch (error) {
            console.error(error);
          } finally {
            setData([]);
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
          setDeleteId(data._id);
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
        data={data}
        filters={filters}
        setSelectedData={setSelectedProducts}
        selectedData={selectedProducts}
        loading={loading}
        columns={CATEGORY_TABLE_COLUMNS({ menuItems })}
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
