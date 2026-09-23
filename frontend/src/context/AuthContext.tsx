import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../api';

interface Admin {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  admin: Admin | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  admin: null,
  token: null,
  login: async () => {},
  logout: () => {},
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('fort_admin_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      authAPI.getProfile()
        .then((res) => setAdmin(res.data))
        .catch(() => { localStorage.removeItem('fort_admin_token'); setToken(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await authAPI.login({ email, password });
    localStorage.setItem('fort_admin_token', res.data.token);
    setToken(res.data.token);
    setAdmin(res.data.admin);
  };

  const logout = () => {
    localStorage.removeItem('fort_admin_token');
    setToken(null);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
