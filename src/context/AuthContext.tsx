import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getUserContext, type UserContextResponse, type UserInfo } from '../api/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserInfo | null;
  currentUser: UserInfo | null;
  permissions: string[];
  isSuperAdmin: boolean;
  isAgencyAdmin: boolean;
  isAgencyUser: boolean;
  isCompanyAdmin: boolean;
  hasPermission: (slug: string) => boolean;
  login: (context: UserContextResponse) => void;
  logout: () => void;
  refreshCurrentUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('token'));
  const [user, setUser] = useState<UserInfo | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isAgencyAdmin, setIsAgencyAdmin] = useState(false);
  const [isAgencyUser, setIsAgencyUser] = useState(false);
  const [isCompanyAdmin, setIsCompanyAdmin] = useState(false);

  const applyContext = (context: UserContextResponse) => {
    setUser(context.user);
    setPermissions(context.permissions);
    setIsSuperAdmin(context.isSuperAdmin);
    setIsAgencyAdmin(context.isAgencyAdmin);
    setIsAgencyUser(context.isAgencyUser);
    setIsCompanyAdmin(context.isCompanyAdmin);
  };

  const fetchContext = async () => {
    try {
      const context = await getUserContext();
      applyContext(context);
    } catch (error) {
      setUser(null);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchContext();
    }
  }, [isAuthenticated]);

  const login = (context: UserContextResponse) => {
    localStorage.setItem('token', context.token);
    applyContext(context);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('selectedBusinessUnit');
    localStorage.removeItem('selectedBusinessUnitUserId');
    setIsAuthenticated(false);
    setUser(null);
    setPermissions([]);
    setIsSuperAdmin(false);
    setIsAgencyAdmin(false);
    setIsAgencyUser(false);
    setIsCompanyAdmin(false);
  };

  const hasPermission = (slug: string) => {
    if (isSuperAdmin) return true;
    return permissions.includes(slug);
  };

  const refreshCurrentUser = async () => {
    await fetchContext();
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        currentUser: user,
        permissions,
        isSuperAdmin,
        isAgencyAdmin,
        isAgencyUser,
        isCompanyAdmin,
        hasPermission,
        login,
        logout,
        refreshCurrentUser,
      }}
    >
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