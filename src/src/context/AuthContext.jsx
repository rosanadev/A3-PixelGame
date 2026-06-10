import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('pixelgame_token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 > Date.now()) {
          setUser(decoded);
        } else {
          localStorage.removeItem('pixelgame_token');
        }
      } catch {
        localStorage.removeItem('pixelgame_token');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, senha) => {
    const response = await authService.login(email, senha);
    const { token } = response.data;
    const decoded = jwtDecode(token);
    localStorage.setItem('pixelgame_token', token);
    setUser(decoded);
    return decoded;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('pixelgame_token');
    setUser(null);
  }, []);

  const isAdmin = user?.fk_perfil === 1;

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
