// Interfaces and Types
import { IActionMenuProps } from '@/lib/utils/interfaces/action-menu.interface';
import { IConfiguration } from '@/lib/utils/interfaces/configuration.interface';
import ActionMenu from '../../action-menu';

export const CONFIGURATION_TABLE_COLUMNS = ({
  menuItems,
}: {
  menuItems: IActionMenuProps<IConfiguration>['items'];
}) => {
  return [
    { headerName: 'Name', propertyName: 'name' },
    { headerName: 'Value', propertyName: 'value' },
    {
      propertyName: 'actions',
      body: (rider: IConfiguration) => (
        <ActionMenu items={menuItems} data={rider} />
      ),
    }
  ];
};
