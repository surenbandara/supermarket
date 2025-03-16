'use client';

// Core
import { useRouter } from 'next/navigation';
import { useContext, useEffect } from 'react';

// Context
import { SidebarContext } from '@/lib/context/global/sidebar.context';

// Interface & Types
import { IUserLoginDataResponse, ISidebarContextProps } from '@/lib/utils/interfaces';
import { onUseLocalStorage } from '@/lib/utils/methods';
import { APP_NAME } from '@/lib/utils/constants';
import { DEFAULT_ROUTES } from '@/lib/utils/constants/routes';

export default function RootPage() {
  // Context
  const { setSelectedItem } = useContext<ISidebarContextProps>(SidebarContext);

  // Hooks
  const router = useRouter();

  // Effects
  useEffect(() => {
    setSelectedItem({ screenName: 'Home' });
    const user = onUseLocalStorage('get', `user-${APP_NAME}`);
    if (user) {
      const userInfo: IUserLoginDataResponse = JSON.parse(user);
      router.push(DEFAULT_ROUTES[userInfo.basicUserDetails.role as keyof typeof DEFAULT_ROUTES]);
    } else {
      router.replace('/authentication/login');
    }
  }, []);

  return <></>;
}
