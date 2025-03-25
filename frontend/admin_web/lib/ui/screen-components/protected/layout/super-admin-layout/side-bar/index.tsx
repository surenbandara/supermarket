'use client';

// Core
import { useContext } from 'react';

// Context
import { LayoutContext } from '@/lib/context/global/layout.context';

// Interface & Types
import {
  IGlobalComponentProps,
  ISidebarMenuItem,
  LayoutContextProps,
} from '@/lib/utils/interfaces';

// Icons
import {
  faCog,
  faHome,
  faShoppingBag,
  faSliders,
} from '@fortawesome/free-solid-svg-icons';

// Constants and Utiils
import useCheckAllowedRoutes from '@/lib/hooks/useCheckAllowedRoutes';

// Components
import SidebarItem from './side-bar-item';
import { useTranslations } from 'next-intl';
import { faStore } from '@fortawesome/free-solid-svg-icons/faStore';
import { faMotorcycle } from '@fortawesome/free-solid-svg-icons/faMotorcycle';
import { faUsers } from '@fortawesome/free-solid-svg-icons/faUsers';
import { faCogs } from '@fortawesome/free-solid-svg-icons/faCogs';
import { faListAlt } from '@fortawesome/free-solid-svg-icons/faListAlt';
import { faUtensils } from '@fortawesome/free-solid-svg-icons/faUtensils';
import { faHandHoldingUsd } from '@fortawesome/free-solid-svg-icons/faHandHoldingUsd';
import { faBell } from '@fortawesome/free-solid-svg-icons/faBell';

function SuperAdminSidebar({ children }: IGlobalComponentProps) {
  // Contexts
  const { isSuperAdminSidebarVisible } =
    useContext<LayoutContextProps>(LayoutContext);

  return (
    <div className="relative">
      <aside
        id="app-sidebar"
        className={`box-border transform overflow-hidden transition-all duration-300 ease-in-out ${isSuperAdminSidebarVisible ? 'w-64 translate-x-0' : 'w-0 -translate-x-full'}`}
      >
        <nav
          className={`flex h-full flex-col border-r bg-white shadow-sm transition-opacity duration-300 ${isSuperAdminSidebarVisible ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        >
          <ul className="flex-1 pl-2">{children}</ul>
        </nav>
      </aside>
    </div>
  );
}

export default function MakeSidebar() {
  // Hooks
  const t = useTranslations();

  // Contexts
  const { isSuperAdminSidebarVisible } =
    useContext<LayoutContextProps>(LayoutContext);

  const navBarItems: ISidebarMenuItem[] = [
    {
      text: t('Stores'),
      route: '/stores',
      isParent: false,
      icon: faStore
    },
    {
      text: t('Products'),
      route: '/products',
      isParent: false,
      icon: faShoppingBag
    },
    {
      text: t('Riders'),
      route: '/riders',
      isParent: false,
      icon: faMotorcycle
    },
    {
      text: t('Users'),
      route: '/users',
      isParent: false,
      icon: faUsers
    },
    {
      text: t('Configuration'),
      route: '/configurations',
      isParent: false,
      icon: faCogs 
    },
    {
      text: t('Orders'),
      route: '/orders',
      isParent: false,
      icon: faListAlt 
    },
    {
      text: t('Cuisine'),
      route: '/cuisines',
      isParent: false,
      icon: faUtensils 
    },
    {
      text: t('Withdraw Request'),
      route: '/withdraw-requests',
      isParent: false,
      icon: faHandHoldingUsd 
    }
  ];

  return (
    <>
      <SuperAdminSidebar>
        <div className="h-[90vh] pb-4 overflow-y-auto overflow-x-hidden pr-2">
          {navBarItems.map((item, index) =>
            item.shouldShow && !item.shouldShow() ? null : (
              <SidebarItem
                key={index}
                expanded={isSuperAdminSidebarVisible}
                {...item}
              />
            )
          )}
        </div>
      </SuperAdminSidebar>
    </>
  );
}
