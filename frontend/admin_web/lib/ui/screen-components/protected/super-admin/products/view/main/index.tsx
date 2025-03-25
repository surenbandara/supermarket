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
// Data
import { generateDummyProducts } from '@/lib/utils/dummy';
import { useTranslations } from 'next-intl';
import { useConfiguration } from '@/lib/hooks/useConfiguration';
import { useUserContext } from '@/lib/hooks/useUser';
import { IProductResponse, IProductsMainComponentsProps } from '@/lib/utils/interfaces/product.interface';
import ProductsTableHeader from '../header/table-header';
import { PRODUCT_TABLE_COLUMNS } from '@/lib/ui/useable-components/table/columns/product-columns';
import { ICuisine } from '@/lib/utils/interfaces/cuisine.interface';
import { useCusineContext } from '@/lib/hooks/useCuisine';

export default function ProductsMain({
  setIsAddProductVisible,
  setProduct,
  reload
}: IProductsMainComponentsProps) {
  // Hooks
  const t = useTranslations();
  const { showToast } = useToast();

  // State - Table
  const [deleteId, setDeleteId] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<IProductResponse[]>(
    []
  );
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [filters, setFilters] = useState({
    global: { value: '' as string | null, matchMode: FilterMatchMode.CONTAINS },
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<IProductResponse[]>([]);
  const [deleteReload, setDeleteReload] = useState<number>(0);

  const {SERVER_URL} = useConfiguration();
  const {user} = useUserContext();
  const {setCuisines} = useCusineContext();

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get(`${SERVER_URL}/products`, user?.jwtToken);
      const responseCusine = await api.get(`${SERVER_URL}/cusine`, user?.jwtToken);
      setCuisines(responseCusine as ICuisine[]);
      setData(response as IProductResponse[]);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

  const menuItems: IActionMenuItem<IProductResponse>[] = [
    {
      label: t('Edit'),
      command: (data?: IProductResponse) => {
        if (data) {
          setIsAddProductVisible(true);
          setProduct(data);
        }
      },
    },
    {
      label: t('Delete'),
      command: (data?: IProductResponse) => {
        if (data) {
          setDeleteId(String(data.id));
        }
      },
    },
  ];

  return (
    <div className="p-3">
      <Table
        header={
          <ProductsTableHeader
            globalFilterValue={globalFilterValue}
            onGlobalFilterChange={onGlobalFilterChange}
          />
        }
        data={loading ? generateDummyProducts() : data}
        filters={filters}
        setSelectedData={setSelectedProducts}
        selectedData={selectedProducts}
        loading={loading}
        columns={PRODUCT_TABLE_COLUMNS({ menuItems })}
      />
      <CustomDialog
        loading={loading}
        visible={!!deleteId}
        onHide={() => {
          setDeleteId('');
        }}
        onConfirm={async () => {
          const response: any = await api.delete(`${SERVER_URL}/product`, {id: deleteId}, user?.jwtToken);
          if (Object.keys(response).length != 0 && response.status != 400) {
            showToast({
              type: 'success',
              title: t('Success'),
              message: 'product deleted',
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
        message={t('Are you sure you want to delete this product?')}
      />
    </div>
  );
}
