import React, { createContext, useState, useEffect } from 'react';
import { IUserLoginDataResponse } from '@/lib/utils/interfaces';
import { APP_NAME } from '@/lib/utils/constants';
import { useConfiguration } from '@/lib/hooks/useConfiguration';
import { onUseLocalStorage } from '@/lib/utils/methods';

interface IUserContext {
  user: IUserLoginDataResponse | null;
  setUser: (user: IUserLoginDataResponse | null) => void;
  onLogin: (email: string, password: string) => Promise<IUserLoginDataResponse>;
}

export const UserContext = createContext<IUserContext | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUserLoginDataResponse | null>(null);
  const { SERVER_URL } = useConfiguration();

  useEffect(() => {
    const savedUser = localStorage.getItem(`user-${APP_NAME}`);
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const onLogin = async (email: string, password: string): Promise<IUserLoginDataResponse> => {
    try {
      const response = await fetch(`${SERVER_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data: IUserLoginDataResponse = await response.json();
      setUser(data);

      // Store user in localStorage
      onUseLocalStorage('save',`user-${APP_NAME}`, JSON.stringify(data));
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Login failed');
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, onLogin }}>
      {children}
    </UserContext.Provider>
  );
};
