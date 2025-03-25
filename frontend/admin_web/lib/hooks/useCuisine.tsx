import { useContext } from 'react';
import { CuisineContext } from '../context/global/cuisine-context';

export const useCusineContext = () => {
  const context = useContext(CuisineContext);
  if (!context) {
    throw new Error('useCusineContext must be used within a CusineProvider');
  }
  return context;
};
