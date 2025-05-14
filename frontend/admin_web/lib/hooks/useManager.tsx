import { useContext } from "react";
import { ManagerContext } from "../context/global/manager-context";


export const useManagerContext = () => {
  const context = useContext(ManagerContext);
  if (!context) {
    throw new Error('useManagerContext must be used within a ManagerContext');
  }
  return context;
};
