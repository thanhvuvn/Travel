import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { apiRequest, onInvalidSession, restoreToken, saveToken } from '../services/api';
export type UserRole = 'guest' | 'user' | 'admin';
export interface UserProfile { id: string; name: string; email: string; role: 'user' | 'admin'; }
type AuthResult = { ok: boolean; error?: string };
interface AuthContextValue {
  user: UserProfile | null;
  role: UserRole;
  isLoading: boolean;
  isAuthModalVisible: boolean;
  authModalInitialTab: 'login' | 'register';
  openAuthModal: (tab?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (name: string, email: string, password: string) => Promise<AuthResult>;
  logout: () => void;
}
const AuthContext = createContext<AuthContextValue>(null!);
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalVisible, setIsAuthModalVisible] = useState(false);
  const [authModalInitialTab, setAuthModalInitialTab] = useState<'login' | 'register'>('login');
  const generation = useRef(0);
  const logout = () => {
    generation.current++;
    setUser(null);
    void saveToken(null).catch(() => {});
  };
  useEffect(() => {
    let mounted = true;
    const version = generation.current;
    onInvalidSession(logout);
    (async () => {
      try {
        if (await restoreToken()) {
          const profile = await apiRequest<UserProfile>('/auth/me');
          if (mounted && version === generation.current) setUser(profile);
        }
      } catch { /* Không giả lập session khi offline; có thể đăng nhập lại. */ }
      finally { if (mounted) setIsLoading(false); }
    })();
    return () => { mounted = false; onInvalidSession(undefined); };
  }, []);
  const authenticate = async (path: string, body: object): Promise<AuthResult> => {
    const version = ++generation.current;
    try {
      const result = await apiRequest<{ token: string; user: UserProfile }>(path, { method: 'POST', body: JSON.stringify(body) });
      if (version !== generation.current) return { ok: false, error: 'Yêu cầu đã hủy.' };
      await saveToken(result.token);
      setUser(result.user);
      setIsAuthModalVisible(false);
      return { ok: true };
    } catch (error) { return { ok: false, error: error instanceof Error ? error.message : 'Không thể đăng nhập.' }; }
  };
  return <AuthContext.Provider value={{ user, role: user?.role || 'guest', isLoading,
    isAuthModalVisible, authModalInitialTab,
    openAuthModal: (tab = 'login') => { setAuthModalInitialTab(tab); setIsAuthModalVisible(true); },
    closeAuthModal: () => setIsAuthModalVisible(false),
    login: (email, password) => authenticate('/auth/login', { email, password }),
    register: (name, email, password) => authenticate('/auth/register', { name, email, password }), logout,
  }}>{children}</AuthContext.Provider>;
};
export const useAuth = () => useContext(AuthContext);
