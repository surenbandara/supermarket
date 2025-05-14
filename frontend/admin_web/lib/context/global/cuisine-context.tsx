import React, { createContext, useState, useEffect } from 'react';
import { APP_NAME } from '@/lib/utils/constants';
import { useConfiguration } from '@/lib/hooks/useConfiguration';
import { onUseLocalStorage } from '@/lib/utils/methods';
import { ICuisine } from '@/lib/utils/interfaces/cuisine.interface';

interface ICuisineContext {
  cusines: ICuisine[] | null;
  setCuisines: (cusine: ICuisine[] | null) => void;
}

export const CuisineContext = createContext<ICuisineContext | undefined>(undefined);

export const CuisineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cusines, setCuisines] = useState<ICuisine[] | null>(null);

  useEffect(() => {
    const savedCuisine = localStorage.getItem(`cusine-${APP_NAME}`);
    if (savedCuisine) {
      setCuisines(JSON.parse(savedCuisine));
    }
  }, []);


  return (
    <CuisineContext.Provider value={{ cusines, setCuisines }}>
      {children}
    </CuisineContext.Provider>
  );
};
