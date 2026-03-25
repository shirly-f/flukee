import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { authService } from '../services/authService';
import i18n from '../i18n';

function applyRoleDocumentTitle(user) {
  if (typeof document === 'undefined') return;
  const brand = i18n.t('login.title');
  if (!user) {
    document.title = brand;
    return;
  }
  const suffix =
    user.role === 'coach'
      ? i18n.t('dashboard.coachDashboard')
      : i18n.t('dashboard.traineeDashboard');
  document.title = `${brand} – ${suffix}`;
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const userRef = useRef(null);
  userRef.current = user;

  useEffect(() => {
    applyRoleDocumentTitle(user);
  }, [user]);

  useEffect(() => {
    const onLang = () => applyRoleDocumentTitle(userRef.current);
    window.addEventListener('flukee:languageChanged', onLang);
    return () => window.removeEventListener('flukee:languageChanged', onLang);
  }, []);

  useEffect(() => {
    // Check for existing session on mount
    const token = localStorage.getItem('auth_token');
    if (token) {
      authService.getCurrentUser()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem('auth_token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password, inviteToken) => {
    const response = await authService.login(email, password, inviteToken);
    localStorage.setItem('auth_token', response.token);
    setUser(response.user);
    return response;
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  const setSession = (token, userData) => {
    localStorage.setItem('auth_token', token);
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
