// Interfaces and Types
import { IUserResponse } from '@/lib/utils/interfaces/user.interface';

// Icons
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslations } from 'next-intl';

export const USERS_TABLE_COLUMNS = () => {
  // Hooks
  const t = useTranslations();
  return [
    {
      headerName: t('Name'),
      propertyName: 'username'
    },
    { headerName: t('Email'), propertyName: 'email' },
    { headerName: t('Phone'), propertyName: 'phoneNumber' },
    { headerName: t('Role'), propertyName: 'role' },
    
  ];
};
