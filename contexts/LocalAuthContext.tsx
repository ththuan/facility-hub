'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// Backup localStorage-based auth context
interface LocalUser {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: {
    name: string;
    display_name: string;
    level: number;
  };
  department: string;
  status: string;
  loginTime: string;
}

interface LocalAuthContextType {
  user: LocalUser | null;
  isLoading: boolean;
  isAdminUser: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

const LocalAuthContext = createContext<LocalAuthContextType | undefined>(undefined);

const accounts = {
  'admin': { password: 'admin123', role: 'admin', fullName: 'Administrator', level: 1 },
  'manager': { password: 'manager123', role: 'manager', fullName: 'Manager User', level: 2 },
  'staff': { password: 'staff123', role: 'staff', fullName: 'Staff User', level: 3 }
};

export function LocalAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check for existing session
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem('facility_hub_user');
        const storedToken = localStorage.getItem('facility_hub_token');
        
        if (storedUser && storedToken) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsAdminUser(userData.role.name === 'admin');
          
          // Auto-redirect logic
          if (pathname === '/' || pathname === '/login') {
            router.replace('/dashboard');
          }
        } else {
          // No auth, redirect to login if on protected route
          if (pathname !== '/' && pathname !== '/login' && pathname !== '/emergency-login') {
            router.replace('/emergency-login');
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [pathname, router]);

  const login = async (username: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const account = accounts[username as keyof typeof accounts];
      
      if (account && account.password === password) {
        const userSession: LocalUser = {
          id: Date.now().toString(),
          username: username,
          email: `${username}@facility-hub.com`,
          full_name: account.fullName,
          role: {
            name: account.role,
            display_name: account.role === 'admin' ? 'Quản trị viên' : 
                          account.role === 'manager' ? 'Quản lý' : 'Nhân viên',
            level: account.level
          },
          department: 'IT',
          status: 'active',
          loginTime: new Date().toISOString()
        };

        localStorage.setItem('facility_hub_user', JSON.stringify(userSession));
        localStorage.setItem('facility_hub_token', 'local_token_' + Date.now());
        
        setUser(userSession);
        setIsAdminUser(userSession.role.name === 'admin');
        
        return { success: true, message: 'Đăng nhập thành công' };
      } else {
        return { success: false, message: 'Tên đăng nhập hoặc mật khẩu không đúng' };
      }
    } catch (error) {
      return { success: false, message: 'Có lỗi xảy ra khi đăng nhập' };
    }
  };

  const logout = () => {
    localStorage.removeItem('facility_hub_user');
    localStorage.removeItem('facility_hub_token');
    setUser(null);
    setIsAdminUser(false);
    router.push('/emergency-login');
  };

  return (
    <LocalAuthContext.Provider value={{
      user,
      isLoading,
      isAdminUser,
      login,
      logout
    }}>
      {children}
    </LocalAuthContext.Provider>
  );
}

export const useLocalAuth = () => {
  const context = useContext(LocalAuthContext);
  if (context === undefined) {
    throw new Error('useLocalAuth must be used within a LocalAuthProvider');
  }
  return context;
};
