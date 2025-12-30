import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CompanyProfile {
  name: string;
  logo: string | null;
  gstin: string;
  address: string;
  phone: string;
  email: string;
  state: string;
}

const defaultCompanyProfile: CompanyProfile = {
  name: 'Mirotec Corporation',
  logo: null,
  gstin: '24AAAFM9339E1ZE',
  address: 'Valsad, Gujarat, India',
  phone: '+91 8048601530',
  email: 'info@glittermiro.com',
  state: 'gujarat',
};

interface CompanyContextType {
  company: CompanyProfile;
  updateCompany: (updates: Partial<CompanyProfile>) => void;
  resetCompany: () => void;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

const COMPANY_STORAGE_KEY = 'erp-company-profile';

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [company, setCompany] = useState<CompanyProfile>(() => {
    const stored = localStorage.getItem(COMPANY_STORAGE_KEY);
    if (stored) {
      try {
        return { ...defaultCompanyProfile, ...JSON.parse(stored) };
      } catch {
        return defaultCompanyProfile;
      }
    }
    return defaultCompanyProfile;
  });

  useEffect(() => {
    localStorage.setItem(COMPANY_STORAGE_KEY, JSON.stringify(company));
  }, [company]);

  const updateCompany = (updates: Partial<CompanyProfile>) => {
    setCompany(prev => ({ ...prev, ...updates }));
  };

  const resetCompany = () => {
    setCompany(defaultCompanyProfile);
    localStorage.removeItem(COMPANY_STORAGE_KEY);
  };

  return (
    <CompanyContext.Provider value={{ company, updateCompany, resetCompany }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
}
