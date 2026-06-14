import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginUser, registerUser, getMe } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  /* Load current user on mount / when token changes */
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await getMe();
        setUser(res.data.data || res.data.user || res.data);
      } catch {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [token]);

  const login = useCallback(async (email, password) => {
    const res = await loginUser({ email, password });
    const data = res.data;
    const jwt = data.token || data.data?.token;
    const usr = data.user || data.data?.user || data.data;
    localStorage.setItem('token', jwt);
    setToken(jwt);
    setUser(usr);
    return usr;
  }, []);

  const register = useCallback(async (name, email, password, role = 'admin', phone, vehicleType) => {
    const res = await registerUser({ name, email, password, role, phone, vehicleType });
    const data = res.data;
    const jwt = data.token || data.data?.token;
    const usr = data.user || data.data?.user || data.data;
    localStorage.setItem('token', jwt);
    setToken(jwt);
    setUser(usr);
    return usr;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((newData) => {
    setUser((prev) => ({ ...prev, ...newData }));
  }, []);

  const value = { user, token, loading, login, register, logout, updateUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
