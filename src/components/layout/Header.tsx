import { Bell, Search, Sun, Moon, Shield, Crown, Briefcase, HardHat, UserCheck } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useRole, UserRole } from '@/contexts/RoleContext';
import { languageNames, Language } from '@/i18n/translations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

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

export function Header() {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { role, setRole } = useRole();

  const languages: Language[] = ['en', 'hi', 'gu'];
  const roles: UserRole[] = ['owner', 'manager', 'supervisor', 'operator'];

  const RoleIcon = roleIcons[role];

  return (
    <header className="h-14 lg:h-16 glass border-b border-border/50 px-3 lg:px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-2 lg:gap-4 flex-1">
        <div className="relative max-w-xs lg:max-w-md w-full">
          <Search className="absolute left-2.5 lg:left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('search')}
            className="pl-8 lg:pl-10 bg-background/50 border-border/50 focus:bg-background transition-smooth h-9 lg:h-10 text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-1 lg:gap-2">
        {/* Role Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'rounded-xl hover:bg-muted/80 transition-smooth h-8 lg:h-9 px-2 lg:px-3 gap-1.5',
                'bg-muted/50'
              )}
            >
              <RoleIcon className={cn('h-4 w-4', roleColors[role])} />
              <span className="hidden lg:inline text-xs font-medium capitalize">
                {t(`role${role.charAt(0).toUpperCase() + role.slice(1)}` as any)}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass-card min-w-[180px]">
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              {t('selectRole' as any)}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {roles.map((r) => {
              const Icon = roleIcons[r];
              return (
                <DropdownMenuItem
                  key={r}
                  onClick={() => setRole(r)}
                  className={cn(
                    'cursor-pointer rounded-lg transition-smooth py-2.5 gap-3',
                    role === r && 'bg-primary/10'
                  )}
                >
                  <Icon className={cn('h-4 w-4', roleColors[r])} />
                  <span className="font-medium capitalize">
                    {t(`role${r.charAt(0).toUpperCase() + r.slice(1)}` as any)}
                  </span>
                  {role === r && (
                    <Shield className="h-3 w-3 ml-auto text-primary" />
                  )}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="rounded-xl hover:bg-muted/80 transition-smooth h-8 w-8 lg:h-9 lg:w-9"
        >
          {theme === 'light' ? (
            <Moon className="h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground" />
          ) : (
            <Sun className="h-4 w-4 lg:h-5 lg:w-5 text-yellow-400" />
          )}
        </Button>

        {/* Language Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="font-semibold rounded-xl hover:bg-muted/80 transition-smooth px-2 lg:px-3 h-8 lg:h-9 text-xs lg:text-sm"
            >
              {languageNames[language]}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass-card min-w-[140px] lg:min-w-[160px]">
            {languages.map((lang) => (
              <DropdownMenuItem
                key={lang}
                onClick={() => setLanguage(lang)}
                className={cn(
                  'cursor-pointer rounded-lg transition-smooth py-2.5',
                  language === lang && 'bg-primary/10 text-primary'
                )}
              >
                <span className="font-medium">{languageNames[lang]}</span>
                <span className="ml-2 text-muted-foreground text-xs">
                  {lang === 'en' ? 'EN' : lang === 'hi' ? 'HI' : 'GU'}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative rounded-xl hover:bg-muted/80 transition-smooth h-8 w-8 lg:h-9 lg:w-9"
        >
          <Bell className="h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground" />
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 lg:h-5 lg:w-5 rounded-full bg-destructive text-destructive-foreground text-[9px] lg:text-[10px] font-bold flex items-center justify-center animate-pulse">
            3
          </span>
        </Button>

        {/* User Avatar */}
        <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-bold text-xs lg:text-sm shadow-lg shadow-primary/20 ml-1">
          RP
        </div>
      </div>
    </header>
  );
}
