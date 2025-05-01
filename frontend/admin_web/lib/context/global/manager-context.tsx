import React, { createContext, useRef } from 'react';

interface IManagerContext {
  orders: React.MutableRefObject<any[] | null>;
  shops: React.MutableRefObject<any[] | null>;
  products: React.MutableRefObject<any[] | null>;
  setOrders: (orders: any[] | null) => void;
  setShops: (shops: any[] | null) => void;
  setsProducts: (products: any[] | null) => void;
}

export const ManagerContext = createContext<IManagerContext | undefined>(undefined);

export const ManagerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const orders = useRef<any[] | null>(null);
  const shops = useRef<any[] | null>(null);
  const products = useRef<any[] | null>(null);

  const setOrders = (newOrders: any[] | null) => {
    console.log('Setting orders:', newOrders);
    orders.current = newOrders;
  };

  const setShops = (newShops: any[] | null) => {
    console.log('Setting shops:', newShops);
    shops.current = newShops;
  };

  const setsProducts = (newProducts: any[] | null) => {
    console.log('Setting products:', newProducts);
    products.current = newProducts;
  };

  return (
    <ManagerContext.Provider value={{ orders, setOrders, shops, setShops, products, setsProducts }}>
      {children}
    </ManagerContext.Provider>
  );
};
