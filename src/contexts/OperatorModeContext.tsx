import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useResponsive } from '@/hooks/useResponsive';

interface OperatorModeContextType {
  isOperatorMode: boolean;
  setOperatorMode: (value: boolean) => void;
  toggleOperatorMode: () => void;
}

const OperatorModeContext = createContext<OperatorModeContextType | undefined>(undefined);

export function OperatorModeProvider({ children }: { children: ReactNode }) {
  const { isMobile } = useResponsive();
  const [isOperatorMode, setIsOperatorMode] = useState(false);

  // Auto-enable on mobile
  useEffect(() => {
    if (isMobile) {
      setIsOperatorMode(true);
    }
  }, [isMobile]);

  const setOperatorMode = (value: boolean) => setIsOperatorMode(value);
  const toggleOperatorMode = () => setIsOperatorMode(prev => !prev);

  return (
    <OperatorModeContext.Provider value={{ isOperatorMode, setOperatorMode, toggleOperatorMode }}>
      {children}
    </OperatorModeContext.Provider>
  );
}

export function useOperatorMode() {
  const context = useContext(OperatorModeContext);
  if (!context) {
    throw new Error('useOperatorMode must be used within OperatorModeProvider');
  }
  return context;
}
