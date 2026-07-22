import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getCurrentUser, type CurrentUser } from '../api/auth';
import { getMyPermissions } from '../api/roles';

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: CurrentUser | null;
  permissions: string[];
  hasPermission: (slug: string) => boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    !!localStorage.getItem('token'),
  );
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCurrentUser();
    }
  }, [isAuthenticated]);

  const fetchCurrentUser = async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
      const perms = await getMyPermissions();
      setPermissions(perms);
    } catch (error) {
      setCurrentUser(null);
    }
  };

  const login = (token: string) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
  };

  const isSuperadmin = currentUser?.businessUnitId === null;

  const hasPermission = (slug: string) => {
    if (isSuperadmin) return true;
    return permissions.includes(slug);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('selectedBusinessUnit');
    localStorage.removeItem('selectedBusinessUnitUserId');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setPermissions([]);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, currentUser, permissions, hasPermission, login, logout }}>
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