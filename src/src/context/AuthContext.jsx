import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ao montar, verifica se já tem sessão salva
  useEffect(() => {
    const token = localStorage.getItem('pixelgame_token');
    const savedUser = localStorage.getItem('pixelgame_user');
    if (token && savedUser) {
      try {
        const decoded = jwtDecode(token);
        // Verifica se o token não expirou
        if (decoded.exp * 1000 > Date.now()) {
          setUser(JSON.parse(savedUser));
        } else {
          localStorage.removeItem('pixelgame_token');
          localStorage.removeItem('pixelgame_user');
        }
      } catch {
        localStorage.removeItem('pixelgame_token');
        localStorage.removeItem('pixelgame_user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const response = await authService.login(email, password);
    const { token, user: userData } = response.data;
    localStorage.setItem('pixelgame_token', token);
    localStorage.setItem('pixelgame_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('pixelgame_token');
    localStorage.removeItem('pixelgame_user');
    setUser(null);
  }, []);

  const isAdmin = user?.role === 'admin' || user?.perfil === 'admin';

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook de conveniência
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
