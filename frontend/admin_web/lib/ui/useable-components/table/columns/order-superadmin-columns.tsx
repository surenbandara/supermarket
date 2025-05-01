import { IExtendedOrder } from '@/lib/utils/interfaces';
import { useTranslations } from 'next-intl';
const dateOptions: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  hour12: true,
};

export const ORDER_SUPER_ADMIN_COLUMNS = () => {
  // Hooks
  const t = useTranslations();
  return [
    {
      headerName: t('Order ID'),
      propertyName: 'id',
    },
    {
      headerName: t('Shop'),
      propertyName: 'shop',
      body: (rowData: any) => {
        if (!rowData.bill || rowData.bill.length === 0) {
          return <span>-</span>;
        }
        return (
          <ul>
              {rowData.bill[0]?.product?.shop}
          </ul>
        );
      },
    },
    {
      headerName: t('Items'),
      propertyName: 'bill',
      body: (rowData: any) => {
        if (!rowData.bill || rowData.bill.length === 0) {
          return <span>-</span>;
        }
        return (
          <ul>
            {rowData.bill.map((item: any, index: any) => (
              <li key={index}>
                {item.product?.name} x {item.quantity}
              </li>
            ))}
          </ul>
        );
      },
    },
    {
      headerName: t('Payment'),
      propertyName: 'paymentMethod',
    },
    {
      headerName: t('Order Status'),
      propertyName: 'status',
    },
    {
      headerName: t('Created At'),
      propertyName: 'timestamp',
      body: (rowData: any) => {
        let date: string | number | Date = Number(rowData?.timestamp || null);
        if (date) {
          const newDate = new Date(date).toLocaleDateString(
            'en-US',
            dateOptions
          );
          return <span className="text-center">{newDate}</span>;
        }
      },
    },
    {
      headerName: t('Delivery Address'),
      propertyName: 'OrderdeliveryAddress',
    },
  ];
};
