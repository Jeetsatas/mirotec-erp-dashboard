import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Factory,
  ClipboardList,
  Users,
  IndianRupee,
  FileText,
  Wallet,
  Users2,
  Globe,
  TrendingUp,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Truck,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRole } from '@/contexts/RoleContext';
import { useCompany } from '@/contexts/CompanyContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

const navItems = [
  { path: '/', icon: LayoutDashboard, labelKey: 'dashboard' as const },
  { path: '/inventory', icon: Package, labelKey: 'inventory' as const },
  { path: '/production', icon: Factory, labelKey: 'production' as const },
  { path: '/orders', icon: ClipboardList, labelKey: 'orders' as const },
  { path: '/clients', icon: Users2, labelKey: 'clients' as const },
  { path: '/exports', icon: Globe, labelKey: 'exports' as const },
  { path: '/competitor-intelligence', icon: TrendingUp, labelKey: 'competitorIntelligence' as const },
  { path: '/shipping-optimizer', icon: Truck, labelKey: 'shippingOptimizer' as const },
  { path: '/workforce', icon: Users, labelKey: 'workforce' as const },
  { path: '/payroll', icon: Wallet, labelKey: 'payroll' as const },
  { path: '/finance', icon: IndianRupee, labelKey: 'finance' as const },
  { path: '/billing', icon: FileText, labelKey: 'billing' as const },
];

interface SidebarProps {
  collapsed?: boolean;
}

export function Sidebar({ collapsed: initialCollapsed = false }: SidebarProps) {
  const { t } = useLanguage();
  const location = useLocation();
  const { allowedRoutes } = useRole();
  const { company } = useCompany();
  const [collapsed, setCollapsed] = useState(initialCollapsed);

  // Sync with prop (for tablet auto-collapse)
  useEffect(() => {
    setCollapsed(initialCollapsed);
  }, [initialCollapsed]);

  // Filter nav items based on role permissions
  const filteredNavItems = navItems.filter(item => allowedRoutes.includes(item.path));

  return (
    <aside
      className={cn(
        'h-screen bg-sidebar backdrop-blur-xl flex flex-col transition-all duration-300 ease-out border-r border-sidebar-border/50 relative flex-shrink-0',
        collapsed ? 'w-[72px]' : 'w-[240px] lg:w-[260px]'
      )}
    >
      {/* Subtle Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-sidebar-primary/5 to-transparent pointer-events-none" />

      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-3 lg:px-4 border-b border-sidebar-border/50 relative">
        {!collapsed && (
          <div className="flex items-center gap-2 lg:gap-3">
            {company.logo ? (
              <div className="h-9 w-9 lg:h-10 lg:w-10 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 bg-background/50 border border-border/30">
                <img src={company.logo} alt={company.name} className="h-full w-full object-contain p-0.5" />
              </div>
            ) : (
              <div className="h-9 w-9 lg:h-10 lg:w-10 rounded-xl bg-gradient-to-br from-sidebar-primary to-sidebar-primary/70 flex items-center justify-center shadow-lg shadow-sidebar-primary/30 flex-shrink-0">
                <Sparkles className="h-4 w-4 lg:h-5 lg:w-5 text-sidebar-primary-foreground" />
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sm lg:text-base text-sidebar-foreground truncate">{company.name || t('appName')}</span>
              <span className="text-[10px] text-sidebar-foreground/50 uppercase tracking-wider">Enterprise</span>
            </div>
          </div>
        )}
        {collapsed && (
          company.logo ? (
            <div className="h-9 w-9 lg:h-10 lg:w-10 rounded-xl flex items-center justify-center overflow-hidden mx-auto bg-background/50 border border-border/30">
              <img src={company.logo} alt={company.name} className="h-full w-full object-contain p-0.5" />
            </div>
          ) : (
            <div className="h-9 w-9 lg:h-10 lg:w-10 rounded-xl bg-gradient-to-br from-sidebar-primary to-sidebar-primary/70 flex items-center justify-center shadow-lg shadow-sidebar-primary/30 mx-auto">
              <Sparkles className="h-4 w-4 lg:h-5 lg:w-5 text-sidebar-primary-foreground" />
            </div>
          )
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-lg transition-smooth h-7 w-7 lg:h-8 lg:w-8 flex-shrink-0",
            collapsed && "absolute -right-3 top-1/2 -translate-y-1/2 bg-sidebar border border-sidebar-border shadow-lg"
          )}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 lg:py-6 px-2 lg:px-3 relative overflow-y-auto custom-scrollbar">
        <ul className="space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={cn(
                    'flex items-center gap-2 lg:gap-3 px-2.5 lg:px-3 py-2 lg:py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden',
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/30'
                      : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                  )}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  )}
                  <item.icon className={cn(
                    "h-5 w-5 flex-shrink-0 transition-transform duration-200",
                    !isActive && "group-hover:scale-110"
                  )} />
                  {!collapsed && (
                    <span className="font-medium text-sm truncate">{t(item.labelKey)}</span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Settings */}
      <div className="p-2 lg:p-3 border-t border-sidebar-border/50 relative">
        <NavLink
          to="/settings"
          className={cn(
            'flex items-center gap-2 lg:gap-3 px-2.5 lg:px-3 py-2 lg:py-2.5 rounded-xl transition-all duration-200',
            'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
          )}
        >
          <Settings className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span className="font-medium text-sm truncate">{t('settings')}</span>}
        </NavLink>
      </div>

      {/* Company Name */}
      {!collapsed && (
        <div className="p-3 lg:p-4 border-t border-sidebar-border/50 relative">
          <p className="text-[10px] lg:text-[11px] text-sidebar-foreground/40 font-medium truncate">{company.name || t('companyName')}</p>
          <p className="text-[9px] lg:text-[10px] text-sidebar-foreground/30 mt-0.5">© 2024</p>
        </div>
      )}
    </aside>
  );
}
