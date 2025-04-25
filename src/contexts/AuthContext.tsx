
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'employee' | 'admin' | 'superadmin';
  avatar?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isEmployee: boolean;
  isCustomer: boolean;
  userData: any;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  
  // Simulate loading user data
  useEffect(() => {
    // For demo purposes, we'll simulate a logged-in admin user
    const mockUser: User = {
      id: '1',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
      avatar: '/lovable-uploads/47eceaaa-7293-4544-a9d0-3810212f7c1c.png'
    };
    
    const timer = setTimeout(() => {
      setUser(mockUser);
      setIsAuthenticated(true);
      setUserData({
        preferences: {
          notifications: true,
          theme: 'light'
        }
      });
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  const login = async (email: string, password: string) => {
    try {
      // Simulate authentication logic
      console.log('Login with:', email, password);
      
      // Mock successful login
      const mockUser: User = {
        id: '1',
        name: 'Admin User',
        email: email,
        role: 'admin',
      };
      
      setUser(mockUser);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };
  
  const logout = async () => {
    try {
      // Simulate logout logic
      setUser(null);
      setIsAuthenticated(false);
      setUserData(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };
  
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const isSuperAdmin = user?.role === 'superadmin';
  const isEmployee = user?.role === 'employee';
  const isCustomer = user?.role === 'customer';
  
  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        isAdmin,
        isSuperAdmin,
        isEmployee,
        isCustomer,
        userData,
        login,
        logout,
      }}
    >
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

export const AuthService = {
  // Mock service methods for auth functionality that can be used outside of React components
  checkAdminAccess: async () => {
    return new Promise<boolean>((resolve) => {
      // In a real app, this would make an API call to verify admin access
      setTimeout(() => resolve(true), 500);
    });
  },
  refreshToken: async () => {
    // Mock token refresh
    return new Promise<void>((resolve) => {
      setTimeout(resolve, 300);
    });
  }
};
