import { AlertTriangle, Wrench, Package, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useERP } from '@/contexts/ERPContext';
import { cn } from '@/lib/utils';

const alertIcons = {
  lowStock: Package,
  maintenance: Wrench,
  orders: AlertTriangle,
};

const severityStyles = {
  warning: 'bg-[hsl(var(--warning))]/10 border-[hsl(var(--warning))]/30 hover:border-[hsl(var(--warning))]/50',
  error: 'bg-destructive/10 border-destructive/30 hover:border-destructive/50',
  info: 'bg-[hsl(var(--info))]/10 border-[hsl(var(--info))]/30 hover:border-[hsl(var(--info))]/50',
};

const severityIconStyles = {
  warning: 'text-[hsl(var(--warning))]',
  error: 'text-destructive',
  info: 'text-[hsl(var(--info))]',
};

export function AlertsPanel() {
  const { t } = useLanguage();
  const { alerts } = useERP();

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-semibold">{t('systemAlerts')}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">{alerts.length} active alerts</p>
        </div>
      </div>
      <div className="space-y-3">
        {alerts.map((alert) => {
          const Icon = alertIcons[alert.type];
          return (
            <div
              key={alert.id}
              className={cn(
                'flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 cursor-pointer group',
                severityStyles[alert.severity]
              )}
            >
              <div className={cn(
                'h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0',
                alert.severity === 'warning' && 'bg-[hsl(var(--warning))]/20',
                alert.severity === 'error' && 'bg-destructive/20',
                alert.severity === 'info' && 'bg-[hsl(var(--info))]/20',
              )}>
                <Icon className={cn('h-5 w-5', severityIconStyles[alert.severity])} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">
                  {t(alert.type === 'lowStock' ? 'lowStock' : alert.type === 'maintenance' ? 'maintenanceDue' : 'ordersPendingDispatch')}
                </p>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  {t(alert.messageKey as any)}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
