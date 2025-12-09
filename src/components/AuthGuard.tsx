import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface AuthGuardProps {
  children: ReactNode;
  fallback: ReactNode;
}

export const AuthGuard = ({ children, fallback }: AuthGuardProps) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return fallback;
  }
  
  return children;
};
