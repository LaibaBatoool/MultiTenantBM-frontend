import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { getBusinessUnit } from '../api/businessUnits';

interface SelectedBusinessUnit {
  id: number;
  name: string;
}

interface BusinessUnitContextType {
  selectedBusinessUnit: SelectedBusinessUnit | null;
  selectBusinessUnit: (bu: SelectedBusinessUnit) => void;
  clearSelectedBusinessUnit: () => void;
  isSuperadmin: boolean;
  isReady: boolean;
}

const BusinessUnitContext = createContext<BusinessUnitContextType | undefined>(undefined);

export function BusinessUnitProvider({ children }: { children: ReactNode }) {
  const { currentUser, isSuperAdmin } = useAuth();
  const [selectedBusinessUnit, setSelectedBusinessUnit] = useState<SelectedBusinessUnit | null>(() => {
    const stored = localStorage.getItem('selectedBusinessUnit');
    return stored ? JSON.parse(stored) : null;
  });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    if (!isSuperAdmin && currentUser.businessUnitId) {
      getBusinessUnit(currentUser.businessUnitId)
        .then((bu) => {
          selectBusinessUnit({ id: bu.id, name: bu.name });
          setIsReady(true);
        })
        .catch(() => setIsReady(true));
    } else {
      const stored = localStorage.getItem('selectedBusinessUnit');
      const storedForUser = localStorage.getItem('selectedBusinessUnitUserId');

      if (stored && storedForUser === String(currentUser.id)) {
        setSelectedBusinessUnit(JSON.parse(stored));
      } else {
        localStorage.removeItem('selectedBusinessUnit');
        setSelectedBusinessUnit(null);
      }
      setIsReady(true);
    }
  }, [currentUser, isSuperAdmin]);

  const selectBusinessUnit = (bu: SelectedBusinessUnit) => {
    localStorage.setItem('selectedBusinessUnit', JSON.stringify(bu));
    if (currentUser) {
      localStorage.setItem('selectedBusinessUnitUserId', String(currentUser.id));
    }
    setSelectedBusinessUnit(bu);
  };

  const clearSelectedBusinessUnit = () => {
    localStorage.removeItem('selectedBusinessUnit');
    localStorage.removeItem('selectedBusinessUnitUserId');
    setSelectedBusinessUnit(null);
  };

  return (
    <BusinessUnitContext.Provider
      value={{ selectedBusinessUnit, selectBusinessUnit, clearSelectedBusinessUnit, isSuperadmin: isSuperAdmin, isReady }}
    >
      {children}
    </BusinessUnitContext.Provider>
  );
}

export function useBusinessUnit() {
  const context = useContext(BusinessUnitContext);
  if (!context) {
    throw new Error('useBusinessUnit must be used within BusinessUnitProvider');
  }
  return context;
}