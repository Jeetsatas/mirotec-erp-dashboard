import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Factory,
  Users,
  IndianRupee,
  FileText,
  Menu,
  Crown,
  Briefcase,
  UserCheck,
  HardHat,
  ClipboardList,
  Globe,
  TrendingUp,
  Truck,
  Settings,
  Sun,
  Moon,
  Languages,
  Users2,
  Wallet,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useCompany } from '@/contexts/CompanyContext';
import { useRole, UserRole } from '@/contexts/RoleContext';
import { Language, languageNames } from '@/i18n/translations';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const allNavItems = [
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
  { path: '/settings', icon: Settings, labelKey: 'settings' as const },
];

const roleIcons: Record<UserRole, typeof Crown> = {
  owner: Crown,
  manager: Briefcase,
  supervisor: UserCheck,
  operator: HardHat,
};

const roleColors: Record<UserRole, string> = {
  owner: 'text-amber-500',
  manager: 'text-blue-500',
  supervisor: 'text-green-500',
  operator: 'text-orange-500',
};

export function MobileBottomNav() {
  const { t } = useLanguage();
  const location = useLocation();
  const { allowedRoutes, role } = useRole();

  // Filter nav items based on role
  const filteredNavItems = allNavItems.filter(item => allowedRoutes.includes(item.path));

  // Show max 4 items in bottom nav, rest goes to menu
  const bottomNavItems = filteredNavItems.slice(0, 4);
  const hasMoreItems = filteredNavItems.length > 4;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-sidebar/95 backdrop-blur-xl border-t border-sidebar-border/50 safe-area-pb">
      <div className="flex items-center justify-around h-16 px-2">
        {bottomNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl min-w-[64px] transition-all duration-200',
                isActive
                  ? 'text-sidebar-primary bg-sidebar-primary/10'
                  : 'text-sidebar-foreground/60 active:scale-95'
              )}
            >
              <item.icon className={cn('h-5 w-5', isActive && 'text-sidebar-primary')} />
              <span className="text-[10px] font-medium truncate max-w-[60px]">
                {t(item.labelKey)}
              </span>
            </NavLink>
          );
        })}
        {hasMoreItems && <MobileMenuButton />}
      </div>
    </nav>
  );
}

function MobileMenuButton() {
  const { t } = useLanguage();
  const location = useLocation();
  const { allowedRoutes } = useRole();
  const [open, setOpen] = useState(false);

  const filteredNavItems = allNavItems.filter(item => allowedRoutes.includes(item.path));

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl text-sidebar-foreground/60">
          <Menu className="h-5 w-5" />
          <span className="text-[10px] font-medium">{t('more') || 'More'}</span>
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="bg-sidebar border-sidebar-border/50 rounded-t-2xl h-auto max-h-[70vh]">
        <div className="py-4 space-y-2">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-200',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground/80 active:bg-sidebar-accent'
                )}
              >
                <item.icon className="h-6 w-6" />
                <span className="font-medium text-base">{t(item.labelKey)}</span>
              </NavLink>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function MobileHeader() {
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { company } = useCompany();
  const { role, setRole } = useRole();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const roles: UserRole[] = ['owner', 'manager', 'supervisor', 'operator'];
  const languages: Language[] = ['en', 'hi', 'gu'];
  const RoleIcon = roleIcons[role];

  return (
    <header className="sticky top-0 z-40 glass border-b border-border/50 px-4 h-14 flex items-center justify-between">
      <div className="flex items-center gap-2">
        {company.logo ? (
          <div className="h-8 w-8 rounded-lg flex items-center justify-center overflow-hidden bg-background/50 border border-border/30">
            <img src={company.logo} alt={company.name} className="h-full w-full object-contain" />
          </div>
        ) : (
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xs">MC</span>
          </div>
        )}
        <span className="font-semibold text-sm">{company.name || t('companyName')}</span>
      </div>

      <div className="flex items-center gap-1">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="rounded-lg h-8 w-8"
        >
          {theme === 'light' ? (
            <Moon className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Sun className="h-4 w-4 text-yellow-400" />
          )}
        </Button>

        {/* Language Selector */}
        <Sheet open={langMenuOpen} onOpenChange={setLangMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-8 px-2 rounded-lg font-semibold"
            >
              {languageNames[language]}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="bg-sidebar border-sidebar-border/50 rounded-t-2xl h-auto">
            <div className="py-4 space-y-2">
              <p className="text-xs text-muted-foreground px-4 mb-3">
                {t('selectLanguage') || 'Select Language'}
              </p>
              {languages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    setLanguage(lang);
                    setLangMenuOpen(false);
                  }}
                  className={cn(
                    'flex items-center justify-between gap-4 px-4 py-4 rounded-xl transition-all duration-200 w-full',
                    language === lang
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground/80 active:bg-sidebar-accent'
                  )}
                >
                  <span className="font-medium text-base">{languageNames[lang]}</span>
                  <span className="text-sm text-muted-foreground">
                    {lang === 'en' ? 'English' : lang === 'hi' ? 'हिंदी' : 'ગુજરાતી'}
                  </span>
                </button>
              ))}
            </div>
          </SheetContent>
        </Sheet>

        {/* Role Selector */}
        <Sheet open={roleMenuOpen} onOpenChange={setRoleMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'text-xs h-8 px-2 rounded-lg gap-1.5',
                'bg-muted/50'
              )}
            >
              <RoleIcon className={cn('h-4 w-4', roleColors[role])} />
              <span className="capitalize">
                {t(`role${role.charAt(0).toUpperCase() + role.slice(1)}` as any)}
              </span>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="bg-sidebar border-sidebar-border/50 rounded-t-2xl h-auto">
            <div className="py-4 space-y-2">
              <p className="text-xs text-muted-foreground px-4 mb-3">
                {t('selectRole' as any)}
              </p>
              {roles.map((r) => {
                const Icon = roleIcons[r];
                return (
                  <button
                    key={r}
                    onClick={() => {
                      setRole(r);
                      setRoleMenuOpen(false);
                    }}
                    className={cn(
                      'flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-200 w-full',
                      role === r
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                        : 'text-sidebar-foreground/80 active:bg-sidebar-accent'
                    )}
                  >
                    <Icon className={cn('h-6 w-6', role !== r && roleColors[r])} />
                    <span className="font-medium text-base capitalize">
                      {t(`role${r.charAt(0).toUpperCase() + r.slice(1)}` as any)}
                    </span>
                  </button>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
