'use client';
// Core
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Constants and Utils
import { APP_NAME } from '@/lib/utils/constants';
import { onUseLocalStorage } from '@/lib/utils/methods';

const RESTAURANT_GUARD = <T extends object>(
  Component: React.ComponentType<T>
) => {
  const WrappedComponent = (props: T) => {
    const router = useRouter();

    useEffect(() => {
      // Check if logged in
      const isLoggedIn = !!onUseLocalStorage('get', `user-${APP_NAME}`);
      if (!isLoggedIn) {
        router.replace('/authentication/login');
      }

      // For VENDOR
      // if (user?.userType === 'VENDOR') {
      //   router.replace('/forbidden');
      // }
    }, []);

    // ADMIN/RESTAURANT is always allowed
    return <Component {...props} />;
  };

  return WrappedComponent;
};

export default RESTAURANT_GUARD;
