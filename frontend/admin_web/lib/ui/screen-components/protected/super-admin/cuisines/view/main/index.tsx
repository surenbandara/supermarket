// GrpphQL
import { DELETE_CUISINE, GET_CUISINES } from '@/lib/api/graphql';

// Interfaces
import {
  IActionMenuItem,
  IEditState,
  ILazyQueryResult,
} from '@/lib/utils/interfaces';
import {
  ICuisine,
  ICuisineMainProps,
  IGetCuisinesData,
} from '@/lib/utils/interfaces/cuisine.interface';
import { FilterMatchMode } from 'primereact/api';

//  Contexts
import { ToastContext } from '@/lib/context/global/toast.context';

// Hooks
import { useLazyQueryQL } from '@/lib/hooks/useLazyQueryQL';
import { useMutation } from '@apollo/client';
import { useContext, useEffect, useState } from 'react';

// Components
import CustomDialog from '@/lib/ui/useable-components/delete-dialog';
import Table from '@/lib/ui/useable-components/table';
import CuisineTableHeader from '../header/table-header';
import { generateDummyCuisines, generateDummyCusines } from '@/lib/utils/dummy';
import { CUISINE_TABLE_COLUMNS } from '@/lib/ui/useable-components/table/columns/cuisine-columns';
import { useTranslations } from 'next-intl';
import { useConfiguration } from '@/lib/hooks/useConfiguration';
import { useUserContext } from '@/lib/hooks/useUser';
import { api } from '@/lib/hooks/useQueryQL';
import { CuisineContext } from '@/lib/context/global/cuisine-context';
import { useCusineContext } from '@/lib/hooks/useCuisine';

export default function CuisinesMain({
  setVisible,
  isEditing,
  setIsEditing,
  cuisine,
  reload,
  setReaload
}: any) {

  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<ICuisine[]>([]);

  const {SERVER_URL} = useConfiguration();
  const {user} = useUserContext();
  const {setCuisines} = useCusineContext();
  
  // Hooks
  const t = useTranslations();
  const { showToast } = useContext(ToastContext);

  // States
  const [selectedData, setSelectedData] = useState<ICuisine[]>([]);
  const [isDeleting, setIsDeleting] = useState<IEditState<ICuisine>>({
    bool: false,
    data: {
      description: '',
      name: '',
      image: '',
      _id: '',
      __typename: ''
    },
  });
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [globalFilterValue, setGlobalFilterValue] = useState('');

  const filters = {
    global: { value: globalFilterValue, matchMode: FilterMatchMode.CONTAINS },
    shopType: {
      value:
        selectedActions.length === 0 || selectedActions.length === 2
          ? null 
          : selectedActions,
      matchMode: FilterMatchMode.IN,
    },
  };

  // Menu Items
  const menuItems: IActionMenuItem<ICuisine>[] = [
    {
      label: t('Edit'),
      command: (data?: ICuisine) => {
        if (data) {
          setIsEditing({
            bool: true,
            data: data,
          });
          setIsDeleting({
            bool: false,
            data: {
              description: '',
              name: '',
              image: '',
              _id: '',
              __typename: ''
            },
          });
        }
      },
    },
    {
      label: t('Delete'),
      command: (data?: ICuisine) => {
        if (data) {
          setIsDeleting({
            bool: true,
            data: data,
          });
          setIsEditing({
            bool: false,
            data: {
              description: '',
              name: '',
              image: '',
              _id: '',
              __typename: ''
            },
          });
        }
      },
    },
  ];

  async function deleteItem() {
    try {
      let response: any = await api.delete(`${SERVER_URL}/cusine`, {name: isDeleting?.data?.name}, user?.jwtToken);
      
      if (Object.keys(response).length != 0 && response.status != 400) {
        showToast({
          title: t('Delete Cuisine'),
          type: 'success',
          message: t('Cuisine has been deleted successfully'),
          duration: 2000,
        });
        setReaload(Date.now()) 
      } else {
        const message = t('ActionFailedTryAgain');
        showToast({
          type: 'error',
          title: t('Error'),
          message,
          duration: 3000,
        });
      }
      setIsDeleting({ bool: false, data: { ...isDeleting.data } });
    } catch (err) {
      showToast({
        title: t('Delete Cuisine'),
        type: 'error',
        message: t('Cuisine Deletion Failed'),
        duration: 2000,
      });
    }
  }data

  const onFetchCuisines = () => {
    setLoading(true);
    console.log('uuuuuuuuuuuuuuuuuuuu ', user);
    const fetchData = async () => {
        try {
          const response = await api.get(`${SERVER_URL}/cusine`, user?.jwtToken);
          setData(response as ICuisine[]);
          setCuisines(response as ICuisine[]);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
        
      fetchData();
  };

  // UseEffects
  useEffect(() => {
    setVisible(isEditing.bool);
  }, [data, isEditing.bool]);

  useEffect(() => {
    onFetchCuisines();
  }, [reload]);

  

  return (
    <div className="p-3">
      <Table
        columns={CUISINE_TABLE_COLUMNS({ menuItems })}
        data={loading ? generateDummyCusines() : data}
        selectedData={selectedData}
        setSelectedData={(e) => setSelectedData(e as ICuisine[])}
        filters={filters}
        loading={loading}
        header={
          <CuisineTableHeader
            globalFilterValue={globalFilterValue}
            onGlobalFilterChange={(e) => setGlobalFilterValue(e.target.value)}
            selectedActions={selectedActions}
            setSelectedActions={setSelectedActions}
          />
        }
      />
      <CustomDialog
        onConfirm={deleteItem}
        onHide={() => {
          setIsDeleting({ bool: false, data: { ...isDeleting.data } });
          setIsEditing({ bool: false, data: { ...isEditing.data } });
        }}
        visible={isDeleting.bool}
        loading={loading}
        message={t('Are you sure to delete the cuisine?')}
      />
    </div>
  );
}
