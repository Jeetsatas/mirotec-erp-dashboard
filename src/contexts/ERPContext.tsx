import React, { createContext, useContext, ReactNode } from 'react';
import { useERPState } from '@/hooks/useERPState';

type ERPContextType = ReturnType<typeof useERPState>;

const ERPContext = createContext<ERPContextType | undefined>(undefined);

export function ERPProvider({ children }: { children: ReactNode }) {
  const erpState = useERPState();

  return (
    <ERPContext.Provider value={erpState}>
      {children}
    </ERPContext.Provider>
  );
}

export function useERP() {
  const context = useContext(ERPContext);
  if (!context) {
    throw new Error('useERP must be used within ERPProvider');
  }
  return context;
}
