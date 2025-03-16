import { useUserContext } from './useUser';

const useCheckAllowedRoutes = <T extends { text: string }>(arr: T[]): T[] => {
  const { user } = useUserContext();

  return arr;
};

export default useCheckAllowedRoutes;
