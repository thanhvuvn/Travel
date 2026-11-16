import React, { createContext, useContext, useState } from 'react';

export type UserRole = 'guest' | 'user' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Exclude<UserRole, 'guest'>;
}

interface AuthContextValue {
  user: UserProfile | null;
  role: UserRole;
  isAuthModalVisible: boolean;
  authModalInitialTab: 'login' | 'register';
  openAuthModal: (tab?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  login: (email: string, password: string, roleOverride?: 'user' | 'admin') => { ok: boolean; error?: string };
  register: (name: string, email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  setDemoRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  role: 'guest',
  isAuthModalVisible: false,
  authModalInitialTab: 'login',
  openAuthModal: () => {},
  closeAuthModal: () => {},
  login: () => ({ ok: true }),
  register: () => ({ ok: true }),
  logout: () => {},
  setDemoRole: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthModalVisible, setIsAuthModalVisible] = useState(false);
  const [authModalInitialTab, setAuthModalInitialTab] = useState<'login' | 'register'>('login');

  const openAuthModal = (tab: 'login' | 'register' = 'login') => {
    setAuthModalInitialTab(tab);
    setIsAuthModalVisible(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalVisible(false);
  };

  const login = (
    email: string,
    password: string,
    roleOverride?: 'user' | 'admin'
  ): { ok: boolean; error?: string } => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { ok: false, error: 'Vui lòng nhập địa chỉ email hợp lệ.' };
    }
    if (!password || password.length < 6) {
      return { ok: false, error: 'Mật khẩu phải có ít nhất 6 ký tự.' };
    }

    const resolvedRole =
      roleOverride || (cleanEmail.includes('admin') ? 'admin' : 'user');

    setUser({
      id: 'u-' + Date.now(),
      name:
        resolvedRole === 'admin'
          ? 'Quản Trị Viên Vivu'
          : cleanEmail.split('@')[0].replace(/[._]/g, ' '),
      email: cleanEmail,
      role: resolvedRole,
    });
    setIsAuthModalVisible(false);
    return { ok: true };
  };

  const register = (
    name: string,
    email: string,
    password: string
  ): { ok: boolean; error?: string } => {
    if (!name.trim() || name.trim().length < 2) {
      return { ok: false, error: 'Vui lòng nhập họ tên (ít nhất 2 ký tự).' };
    }
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { ok: false, error: 'Email không hợp lệ.' };
    }
    if (!password || password.length < 6) {
      return { ok: false, error: 'Mật khẩu phải có ít nhất 6 ký tự.' };
    }

    setUser({
      id: 'u-' + Date.now(),
      name: name.trim(),
      email: cleanEmail,
      role: 'user',
    });
    setIsAuthModalVisible(false);
    return { ok: true };
  };

  const logout = () => {
    setUser(null);
  };

  const setDemoRole = (targetRole: UserRole) => {
    if (targetRole === 'guest') {
      setUser(null);
    } else if (targetRole === 'user') {
      setUser({
        id: 'demo-user',
        name: 'Nguyễn Văn Du Khách',
        email: 'dukhach@vivuai.vn',
        role: 'user',
      });
    } else {
      setUser({
        id: 'demo-admin',
        name: 'Admin Hệ Thống Vivu',
        email: 'admin@vivuai.vn',
        role: 'admin',
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : 'guest',
        isAuthModalVisible,
        authModalInitialTab,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        logout,
        setDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
