import { ReactNode } from 'react';

export interface User {
  id: string;
  username: string;
  email: string;
  user_type: string;
  status: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (username: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface AuthProviderProps {
  children: ReactNode;
}
