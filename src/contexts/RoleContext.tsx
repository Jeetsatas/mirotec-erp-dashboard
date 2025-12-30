import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useOperatorMode } from './OperatorModeContext';

export type UserRole = 'owner' | 'manager' | 'supervisor' | 'operator';

export interface RolePermissions {
  // Navigation access
  dashboard: boolean;
  dashboardAnalytics: boolean;
  inventory: boolean;
  inventoryAddStock: boolean;
  production: boolean;
  productionControl: boolean;
  orders: boolean;
  workforce: boolean;
  workforceAddEmployee: boolean;
  workforceAttendance: boolean;
  finance: boolean;
  financeManualEntry: boolean;
  billing: boolean;
  billingEdit: boolean;
  payroll: boolean;
  payrollEdit: boolean;
  // Feature access
  viewCharts: boolean;
  viewAllKPIs: boolean;
}

// Centralized role configuration - easy to extend
export const roleConfig: Record<UserRole, RolePermissions> = {
  owner: {
    dashboard: true,
    dashboardAnalytics: true,
    inventory: true,
    inventoryAddStock: true,
    production: true,
    productionControl: true,
    orders: true,
    workforce: true,
    workforceAddEmployee: true,
    workforceAttendance: true,
    finance: true,
    financeManualEntry: true,
    billing: true,
    billingEdit: true,
    payroll: true,
    payrollEdit: true,
    viewCharts: true,
    viewAllKPIs: true,
  },
  manager: {
    dashboard: true,
    dashboardAnalytics: true,
    inventory: true,
    inventoryAddStock: true,
    production: true,
    productionControl: true,
    orders: true,
    workforce: true,
    workforceAddEmployee: false,
    workforceAttendance: true,
    finance: true,
    financeManualEntry: false,
    billing: true,
    billingEdit: false,
    payroll: true,
    payrollEdit: false,
    viewCharts: true,
    viewAllKPIs: true,
  },
  supervisor: {
    dashboard: true,
    dashboardAnalytics: false,
    inventory: true,
    inventoryAddStock: false,
    production: true,
    productionControl: true,
    orders: false,
    workforce: true,
    workforceAddEmployee: false,
    workforceAttendance: true,
    finance: false,
    financeManualEntry: false,
    billing: false,
    billingEdit: false,
    payroll: false,
    payrollEdit: false,
    viewCharts: false,
    viewAllKPIs: false,
  },
  operator: {
    dashboard: false,
    dashboardAnalytics: false,
    inventory: true,
    inventoryAddStock: false,
    production: true,
    productionControl: true,
    orders: false,
    workforce: true,
    workforceAddEmployee: false,
    workforceAttendance: true,
    finance: false,
    financeManualEntry: false,
    billing: false,
    billingEdit: false,
    payroll: false,
    payrollEdit: false,
    viewCharts: false,
    viewAllKPIs: false,
  },
};

// Navigation items per role
export const roleNavItems: Record<UserRole, string[]> = {
  owner: ['/', '/inventory', '/production', '/orders', '/clients', '/exports', '/competitor-intelligence', '/shipping-optimizer', '/workforce', '/payroll', '/finance', '/billing', '/settings'],
  manager: ['/', '/inventory', '/production', '/orders', '/clients', '/exports', '/competitor-intelligence', '/shipping-optimizer', '/workforce', '/payroll', '/finance', '/billing'],
  supervisor: ['/', '/inventory', '/production', '/workforce'],
  operator: ['/production', '/workforce', '/inventory'],
};

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  permissions: RolePermissions;
  hasPermission: (permission: keyof RolePermissions) => boolean;
  allowedRoutes: string[];
  canEdit: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

const ROLE_STORAGE_KEY = 'erp-user-role';

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole>(() => {
    const stored = localStorage.getItem(ROLE_STORAGE_KEY);
    return (stored as UserRole) || 'owner';
  });

  const { setOperatorMode } = useOperatorMode();

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem(ROLE_STORAGE_KEY, newRole);

    // Auto-enable operator mode for operator role
    if (newRole === 'operator') {
      setOperatorMode(true);
    } else {
      setOperatorMode(false);
    }
  };

  // Sync operator mode on mount
  useEffect(() => {
    if (role === 'operator') {
      setOperatorMode(true);
    }
  }, [role, setOperatorMode]);

  const permissions = roleConfig[role];
  const allowedRoutes = roleNavItems[role];
  const canEdit = role === 'owner' || role === 'manager';

  const hasPermission = (permission: keyof RolePermissions): boolean => {
    return permissions[permission];
  };

  return (
    <RoleContext.Provider value={{ role, setRole, permissions, hasPermission, allowedRoutes, canEdit }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
