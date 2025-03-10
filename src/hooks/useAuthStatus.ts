import { useSession } from 'next-auth/react';

export const useAuthStatus = () => {
  const { data: session, status } = useSession();

  return {
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    user: session?.user,
    status,
  };
};
