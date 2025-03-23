// Core
import { useEffect, useState } from 'react';

// Prime React
import { FilterMatchMode } from 'primereact/api';

// Interface and Types
import { IQueryResult } from '@/lib/utils/interfaces';
import {
  IUserResponse,
  IUsersDataResponse,
} from '@/lib/utils/interfaces';

// Components
import { USERS_TABLE_COLUMNS } from '@/lib/ui/useable-components/table/columns/user-columns';

//Toast
import { api, useQueryGQL } from '@/lib/hooks/useQueryQL';
import Table from '@/lib/ui/useable-components/table';

// GraphQL
import { GET_USERS } from '@/lib/api/graphql';
import UsersTableHeader from '../header/table-header';
import { useConfiguration } from '@/lib/hooks/useConfiguration';
import { useUserContext } from '@/lib/hooks/useUser';
import { generateDummyUsers } from '@/lib/utils/dummy';

export default function UsersMain() {
  // State - Table
  const [selectedProducts, setSelectedProducts] = useState<IUserResponse[]>([]);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [filters, setFilters] = useState({
    global: { value: '' as string | null, matchMode: FilterMatchMode.CONTAINS },
  });

  const [data, setData] = useState<IUserResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const {SERVER_URL} = useConfiguration();
  const {user} = useUserContext();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await api.get(`${SERVER_URL}/users`, user?.jwtToken);
        setData(response as IUserResponse[]);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]); 


  // For global search
  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const _filters = { ...filters };
    _filters['global'].value = value;
    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const _restaurants = data
  return (
    <div className="p-3">
      <Table
        header={
          <UsersTableHeader
            globalFilterValue={globalFilterValue}
            onGlobalFilterChange={onGlobalFilterChange}
          />
        }
        data={loading ? generateDummyUsers() : (data ?? [])}
        loading={loading}
        filters={filters}
        setSelectedData={setSelectedProducts}
        selectedData={selectedProducts}
        columns={USERS_TABLE_COLUMNS()}
      />
    </div>
  );
}
