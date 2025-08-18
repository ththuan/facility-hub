'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { authManager, User } from '@/lib/authManager';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateUser: (updatedUser: User) => Promise<void>;
  hasPermission: (module: string, action: string) => boolean;
  hasRole: (roleName: string) => boolean;
  canAccess: (requiredRole: string) => boolean;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Memoize auth check to prevent unnecessary re-renders
  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      try {
        const currentUser = authManager.getCurrentUser();
        if (isMounted) {
          setUser(currentUser);
          setIsLoading(false);

          // Auto-redirect logic - use replace for better performance
          if (currentUser && (pathname === '/' || pathname === '/login')) {
            router.replace('/dashboard');
          } else if (!currentUser && pathname !== '/' && pathname !== '/login' && pathname !== '/unauthorized') {
            router.replace('/');
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [pathname, router]);

  const login = useCallback(async (username: string, password: string) => {
    const result = await authManager.login(username, password);
    if (result.success && result.user) {
      setUser(result.user);
    }
    return result;
  }, []);

  const logout = () => {
    authManager.logout();
    setUser(null);
    router.push('/');
  };

  const updateUser = async (updatedUser: User): Promise<void> => {
    const success = authManager.updateUser(updatedUser.id, updatedUser);
    if (success) {
      setUser(updatedUser);
    } else {
      throw new Error('Không thể cập nhật thông tin người dùng');
    }
  };

  const hasPermission = (module: string, action: string): boolean => {
    return authManager.hasPermission(module, action);
  };

  const hasRole = (roleName: string): boolean => {
    return authManager.hasRole(roleName);
  };

  const canAccess = (requiredRole: string): boolean => {
    return authManager.canAccess(requiredRole);
  };

  const isAdmin = (): boolean => {
    return authManager.isAdmin();
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      logout,
      updateUser,
      hasPermission,
      hasRole,
      canAccess,
      isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Higher-order component for protected routes
export function withAuth<T extends object>(
  Component: React.ComponentType<T>,
  requiredRole?: string,
  requiredPermissions?: { module: string; action: string }[]
) {
  return function AuthenticatedComponent(props: T) {
    const { user, isLoading, canAccess, hasPermission } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !user) {
        router.push('/');
        return;
      }

      if (user) {
        // Check role access
        if (requiredRole && !canAccess(requiredRole)) {
          router.push('/unauthorized');
          return;
        }

        // Check permissions
        if (requiredPermissions) {
          const hasAllPermissions = requiredPermissions.every(perm =>
            hasPermission(perm.module, perm.action)
          );
          if (!hasAllPermissions) {
            router.push('/unauthorized');
            return;
          }
        }
      }
    }, [user, isLoading, canAccess, hasPermission, router]);

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!user) {
      return null;
    }

    if (requiredRole && !canAccess(requiredRole)) {
      return null;
    }

    if (requiredPermissions) {
      const hasAllPermissions = requiredPermissions.every(perm =>
        hasPermission(perm.module, perm.action)
      );
      if (!hasAllPermissions) {
        return null;
      }
    }

    return <Component {...props} />;
  };
}
