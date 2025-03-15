'use client';
// Core
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Hooks
import { useUserContext } from '@/lib/hooks/useUser';

// Constants and Utils
import { APP_NAME } from '@/lib/utils/constants';
import { onUseLocalStorage } from '@/lib/utils/methods';

const SUPER_ADMIN_GUARD = <T extends object>(
  Component: React.ComponentType<T>
) => {
  const WrappedComponent = (props: T) => {
    const router = useRouter();
    const { user } = useUserContext();

    useEffect(() => {
      // Check if logged in
      const isLoggedIn = !!onUseLocalStorage('get', `user-${APP_NAME}`);
      if (!isLoggedIn) {
        router.replace('/authentication/login');
      }

      // For Others
      if (user?.userType === 'RESTAURANT' || user?.userType === 'VENDOR') {
        router.replace('/forbidden');
      }
    }, []);

    return <Component {...props} />;
  };

  return WrappedComponent;
};

export default SUPER_ADMIN_GUARD;
