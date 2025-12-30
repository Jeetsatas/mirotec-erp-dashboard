import { useLanguage } from '@/contexts/LanguageContext';
import { useERP } from '@/contexts/ERPContext';
import { useResponsive } from '@/hooks/useResponsive';
import { useOperatorMode } from '@/contexts/OperatorModeContext';
import { MachineStatus } from '@/types/erp';
import { MachineCard } from '@/components/production/MachineCard';
import { Factory, Gauge, Zap, Package, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function Production() {
  const { t } = useLanguage();
  const { machines, updateMachineStatus, dailyProduction, runningMachines, avgEfficiency, lowStockItems } = useERP();
  const { isMobile } = useResponsive();
  const { isOperatorMode } = useOperatorMode();

  return (
    <div className="space-y-4 md:space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <h1 className="text-xl md:text-3xl font-bold tracking-tight">{t('production')}</h1>
          <p className="text-muted-foreground text-sm mt-0.5 md:mt-1">{t('companyName')}</p>
        </div>
        {/* Production-Inventory Link Indicator */}
        <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-xl px-3 py-2">
          <Package className="h-4 w-4 text-primary" />
          <span className="text-xs md:text-sm text-muted-foreground">{t('linkedToRawMaterial')}</span>
          <ArrowRight className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs md:text-sm font-medium">{t('inventory')}</span>
          {lowStockItems.length > 0 && (
            <Badge variant="destructive" className="ml-1 text-[10px] px-1.5 py-0">
              {lowStockItems.length} {t('lowStockStatus')}
            </Badge>
          )}
        </div>
      </div>

      {/* Production Summary */}
      <div className="grid grid-cols-3 gap-2 md:gap-5">
        <div className="glass-card p-3 md:p-5 flex flex-col md:flex-row items-center gap-2 md:gap-4 card-hover">
          <div className="icon-container h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-primary/10 text-primary">
            <Factory className="h-5 w-5 md:h-7 md:w-7" />
          </div>
          <div className="text-center md:text-left">
            <p className="text-[10px] md:text-sm text-muted-foreground font-medium">{t('totalOutput')}</p>
            <p className="text-lg md:text-3xl font-bold">{dailyProduction} <span className="text-xs md:text-lg font-normal text-muted-foreground">{t('kg')}</span></p>
          </div>
        </div>

        <div className="glass-card p-3 md:p-5 flex flex-col md:flex-row items-center gap-2 md:gap-4 card-hover">
          <div className="icon-container h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]">
            <Zap className="h-5 w-5 md:h-7 md:w-7" />
          </div>
          <div className="text-center md:text-left">
            <p className="text-[10px] md:text-sm text-muted-foreground font-medium">{t('machinesActive')}</p>
            <p className="text-lg md:text-3xl font-bold">{runningMachines} <span className="text-xs md:text-lg font-normal text-muted-foreground">/ {machines.length}</span></p>
          </div>
        </div>

        <div className="glass-card p-3 md:p-5 flex flex-col md:flex-row items-center gap-2 md:gap-4 card-hover">
          <div className="icon-container h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-[hsl(var(--info))]/10 text-[hsl(var(--info))]">
            <Gauge className="h-5 w-5 md:h-7 md:w-7" />
          </div>
          <div className="text-center md:text-left">
            <p className="text-[10px] md:text-sm text-muted-foreground font-medium">{t('avgEfficiency')}</p>
            <p className="text-lg md:text-3xl font-bold">{avgEfficiency}<span className="text-xs md:text-lg font-normal text-muted-foreground">%</span></p>
          </div>
        </div>
      </div>

      {/* Machines Grid */}
      <div className="glass-card p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6 gap-3">
          <div>
            <h3 className="text-lg md:text-xl font-semibold">{t('machines')}</h3>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">{t('machineStatus')}</p>
          </div>
          {!isMobile && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--success))]" />
                <span className="text-sm text-muted-foreground">{t('running')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground" />
                <span className="text-sm text-muted-foreground">{t('stopped')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--warning))]" />
                <span className="text-sm text-muted-foreground">{t('maintenance')}</span>
              </div>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
          {machines.map((machine, index) => (
            <div 
              key={machine.id} 
              className="animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <MachineCard
                machine={machine}
                onStatusChange={(status: MachineStatus) => updateMachineStatus(machine.id, status)}
                operatorMode={isOperatorMode}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
