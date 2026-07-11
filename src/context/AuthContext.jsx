import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { loginRequest, logoutRequest, meRequest } from '../api/auth.js';
import { setAccessToken } from '../api/http.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const [token, setToken] = useState(() => localStorage.getItem('accessToken') || '');

  useEffect(() => {
    const handleTokenChange = () => setToken(localStorage.getItem('accessToken') || '');
    window.addEventListener('auth-token-changed', handleTokenChange);
    window.addEventListener('storage', handleTokenChange);
    return () => {
      window.removeEventListener('auth-token-changed', handleTokenChange);
      window.removeEventListener('storage', handleTokenChange);
    };
  }, []);

  const meQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: meRequest,
    enabled: Boolean(token)
  });

  const login = async (payload) => {
    const data = await loginRequest(payload);
    sessionStorage.removeItem('adminSessionLock');
    if (data.user?.role === 'Admin') {
      localStorage.setItem('adminLastActivityAt', String(Date.now()));
    }
    await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    return data;
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } finally {
      setAccessToken('');
      queryClient.clear();
    }
  };

  const lockSession = async () => {
    const currentUser = meQuery.data?.user;
    if (currentUser?.role !== 'Admin') return;
    sessionStorage.setItem(
      'adminSessionLock',
      JSON.stringify({ username: currentUser.username, name: currentUser.name, lockedAt: Date.now() })
    );
    await logout();
  };

  const value = useMemo(
    () => ({
      user: meQuery.data?.user || null,
      settings: meQuery.data?.settings || null,
      isLoading: meQuery.isLoading,
      isFetching: meQuery.isFetching,
      login,
      logout,
      lockSession,
      refetchMe: () => meQuery.refetch()
    }),
    [meQuery.data, meQuery.isLoading, meQuery.isFetching]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};
