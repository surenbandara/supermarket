// Interfaces and Types
import { IActionMenuProps } from '@/lib/utils/interfaces/action-menu.interface';
import { IConfiguration } from '@/lib/utils/interfaces/configuration.interface';

export const CATEGORY_TABLE_COLUMNS = ({
  menuItems,
}: {
  menuItems: IActionMenuProps<IConfiguration>['items'];
}) => {
  return [
    { headerName: 'Key', propertyName: 'key' },
    { headerName: 'Value', propertyName: 'value' }
  ];
};
