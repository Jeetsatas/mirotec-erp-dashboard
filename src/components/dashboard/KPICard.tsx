import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: {
    value: number;
    positive: boolean;
  };
  className?: string;
  iconColor?: string;
  compact?: boolean;
}

export function KPICard({ title, value, subtitle, icon, trend, className, iconColor = 'primary', compact = false }: KPICardProps) {
  const iconColorClasses: Record<string, string> = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]',
    warning: 'bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]',
    info: 'bg-[hsl(var(--info))]/10 text-[hsl(var(--info))]',
  };

  if (compact) {
    return (
      <div className={cn('glass-card p-3 card-hover group', className)}>
        <div className="flex items-center gap-3">
          <div className={cn(
            'icon-container h-10 w-10 rounded-xl flex-shrink-0',
            iconColorClasses[iconColor]
          )}>
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium text-muted-foreground truncate">{title}</p>
            <div className="flex items-baseline gap-1">
              <p className="text-lg font-bold tracking-tight truncate">{value}</p>
              {subtitle && (
                <span className="text-[10px] font-medium text-muted-foreground">{subtitle}</span>
              )}
            </div>
          </div>
        </div>
        {trend && (
          <div className={cn(
            'flex items-center gap-1 text-[10px] font-semibold mt-2',
            trend.positive ? 'text-[hsl(var(--success))]' : 'text-destructive'
          )}>
            {trend.positive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span>{trend.positive ? '+' : ''}{trend.value}%</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn(
      'glass-card p-4 md:p-6 card-hover group',
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-2 md:space-y-3">
          <p className="text-xs md:text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl md:text-3xl font-bold tracking-tight">{value}</p>
            {subtitle && (
              <span className="text-xs md:text-sm font-medium text-muted-foreground">{subtitle}</span>
            )}
          </div>
          {trend && (
            <div className={cn(
              'flex items-center gap-1 text-xs md:text-sm font-semibold',
              trend.positive ? 'text-[hsl(var(--success))]' : 'text-destructive'
            )}>
              {trend.positive ? (
                <TrendingUp className="h-3 w-3 md:h-4 md:w-4" />
              ) : (
                <TrendingDown className="h-3 w-3 md:h-4 md:w-4" />
              )}
              <span>{trend.positive ? '+' : ''}{trend.value}%</span>
            </div>
          )}
        </div>
        <div className={cn(
          'icon-container h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl group-hover:scale-110',
          iconColorClasses[iconColor]
        )}>
          {icon}
        </div>
      </div>
    </div>
  );
}
