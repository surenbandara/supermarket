// Hooks
import { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { api, useQueryGQL } from '@/lib/hooks/useQueryQL';

// Interfaces & Types
import { IDateFilter, IQueryResult } from '@/lib/utils/interfaces';
import { IOrder, IExtendedOrder } from '@/lib/utils/interfaces';
import { TOrderRowData } from '@/lib/utils/types';

// Components
import OrderSuperAdminTableHeader from '../header/table-header';
import Table from '@/lib/ui/useable-components/table';
import OrderTableSkeleton from '@/lib/ui/useable-components/custom-skeletons/orders.vendor.row.skeleton';
import { ORDER_SUPER_ADMIN_COLUMNS } from '@/lib/ui/useable-components/table/columns/order-superadmin-columns';
import OrderDetailModal from '@/lib/ui/useable-components/popup-menu/order-details-modal';
import DashboardDateFilter from '@/lib/ui/useable-components/date-filter';

// Prime React
import { FilterMatchMode } from 'primereact/api';
import { DataTableRowClickEvent } from 'primereact/datatable';
import { useConfiguration } from '@/lib/hooks/useConfiguration';
import { useUserContext } from '@/lib/hooks/useUser';
import { AnyARecord } from 'dns';
import { useManagerContext } from '@/lib/hooks/useManager';

export default function OrderSuperAdminMain() {
  // Hooks
  const t = useTranslations();

  // States
  const [selectedData, setSelectedData] = useState<IExtendedOrder[]>([]);
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<IExtendedOrder | null>(null);
  const [dateFilter, setDateFilter] = useState<IDateFilter>({
    dateKeyword: 'All',
    startDate: `${new Date().getFullYear()}-01-01`, // Current year, January 1st
    endDate: `${new Date().getFullYear()}-${String(new Date().getMonth()).padStart(2, '0')}-${String(new Date(new Date().getFullYear(), new Date().getMonth(), 0).getDate()).padStart(2, '0')}`, // Last day of previous month
  });

  const [data, setData] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [timerCount, setTimerCount] = useState<number>(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const {SERVER_URL} = useConfiguration();
  const {user} = useUserContext();
  const {orders, setOrders, shops, setShops, products, setsProducts} = useManagerContext();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        let orders: any = await api.get(`${SERVER_URL}/orders`, user?.jwtToken);
        const products: any = await api.get(`${SERVER_URL}/products`, user?.jwtToken);
        const shops: any = await api.get(`${SERVER_URL}/shop`, user?.jwtToken);


        orders = orders.map((item: any) => {
          const totalPrice = JSON.parse(item.totalPrice);
          const bills = JSON.parse(item.bill).map((billItem: any) => ({
            ...billItem,
            product: (products as any[]).find((product) => product.id === billItem.productId)
          }));
  
          return {
            ...item,
            totalPrice,
            bill: bills
          };
        });
        setData(orders as IOrder[]);
        setShops(shops as any[]);
        setsProducts(products as any[]);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    

    const timer = setInterval(() => {
      console.log('Timer event fired');
      setOrders([]);
      orderFetch(undefined);
      setTimerCount((prev) => prev + 1); 
    }, 5000); 

  
    timerRef.current = timer;


    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [user]); 


  const orderFetch = async (orderId: any | undefined) => {

    try {
      if (orderId) {
        const fetchedOrder: any = await api.get(`${SERVER_URL}/orders?id=${orderId}`, user?.jwtToken);
        const totalPrice = JSON.parse(fetchedOrder?.totalPrice);
        const bills = JSON.parse(fetchedOrder?.bill).map((billItem: any) => ({
          ...billItem,
          product: products.current?.find((product) => product.id === billItem.productId)
        }));
    
        const populatedOrders = {
              ...fetchedOrder,
              totalPrice,
              bill: bills
            };
        const updatedOrders = data.map(order =>
          order.id === orderId ? populatedOrders : order
        );
        setData(updatedOrders);

      } else {
        let ordersFetched: any = await api.get(`${SERVER_URL}/orders`, user?.jwtToken);
        const orders = ordersFetched.map((item: any) => {
          const totalPrice = JSON.parse(item.totalPrice);
          const bills = JSON.parse(item.bill).map((billItem: any) => ({
            ...billItem,
            product: (products?.current as any[]).find((product) => product.id === billItem.productId)
          }));
  
          return {
            ...item,
            totalPrice,
            bill: bills
          };
        });

        setData(orders as IOrder[]);
      }

    

    } catch (error) {
      console.error("Error:", error);
    } 

  }

  const orderUpdate = async (order: any) => {

    try {
      order.productList = order.bill
      await api.put(`${SERVER_URL}/orders`, order, user?.jwtToken);
    } catch (error) {
      console.error("Error:", error);
    } 

  }

  const onUpdate = async (data: any, fun: () => void) => {
    try {
      await orderUpdate(data);
      await orderFetch(data.id);
    } catch (e) {
      console.log('Error:', e);
    } finally {
      fun();
      setIsModalOpen(false);
    }
  };

  const handleDateFilter = (dateFilter: IDateFilter) => {
    setDateFilter({
      ...dateFilter,
      dateKeyword: dateFilter.dateKeyword ?? '',
    });
  };


  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [filters, setFilters] = useState({
    global: {
      value: '' as string | null,
      matchMode: FilterMatchMode.CONTAINS,
    },
  });

  // For global search
  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const _filters = { ...filters };
    _filters['global'].value = value;
    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const handleSearch = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
  };

  const handleRowClick = (event: DataTableRowClickEvent) => {
    const selectedOrder = event.data as IExtendedOrder;
    setSelectedRestaurant(selectedOrder);
    setIsModalOpen(true);
  };

  const tableData = useMemo(() => {
    if (!data) return [];

    return data.map(
      (order: any): IExtendedOrder => ({
        ...order,
        itemsTitle:
          order?.bill
            .map((item: any) => item.id)
            .join(', ')
            .slice(0, 15) + '...',
        OrderdeliveryAddress:
          order.userLocation.toString().slice(0, 15) + '...',
        DateCreated: order.timestamp.toString().slice(0, 10),
      })
    );
  }, [data]);

  const filteredData = useMemo(() => {
    return tableData.filter((order: IExtendedOrder) => {
      const statusFilter =
        selectedActions.length === 0 ||
        selectedActions.includes(order.orderStatus);
      return statusFilter;
    });
  }, [tableData, selectedActions, searchTerm]);

  const displayData: TOrderRowData[] = useMemo(() => {
    if (loading) {
      return OrderTableSkeleton({ rowCount: 10 }); // Display 10 skeleton rows while loading
    }
    return filteredData;
  }, [loading, filteredData]);

  return (
    <div className="p-3 screen-container">
      <Table
        header={
          <>
            <OrderSuperAdminTableHeader
              globalFilterValue={globalFilterValue}
              onGlobalFilterChange={onGlobalFilterChange}
              selectedActions={selectedActions}
              setSelectedActions={setSelectedActions}
              onSearch={handleSearch}
              dateFilter={dateFilter}
              handleDateFilter={handleDateFilter}
            />
            <DashboardDateFilter
              dateFilter={dateFilter}
              setDateFilter={setDateFilter}
            />
          </>
        }
        data={displayData as IExtendedOrder[]}
        setSelectedData={setSelectedData}
        selectedData={selectedData}
        columns={ORDER_SUPER_ADMIN_COLUMNS()}
        loading={loading}
        filters={filters}
        handleRowClick={handleRowClick}
        moduleName={'SuperAdmin-Order'}
      />
      <OrderDetailModal
        visible={isModalOpen}
        onHide={() => setIsModalOpen(false)}
        restaurantData={selectedRestaurant}
        onUpdate={(data: any, fun: () => void) => onUpdate(data, fun)}
      />

      {/* {error && (
        <p className="text-red-500">
          {t('Error')}: {error.message}
        </p>
      )} */}
    </div>
  );
}
