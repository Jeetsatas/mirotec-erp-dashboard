import { Play, Square, Wrench, Thermometer, Gauge, Package, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useERP } from '@/contexts/ERPContext';
import { Machine, MachineStatus, MachineType } from '@/types/erp';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getMachineConsumption } from '@/config/productionConfig';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/hooks/use-toast';

interface MachineCardProps {
  machine: Machine;
  onStatusChange: (status: MachineStatus) => { success: boolean; reason?: string; material?: string; required?: number; available?: number };
  operatorMode?: boolean;
}

const statusStyles: Record<MachineStatus, { bg: string; text: string; indicator: string }> = {
  [MachineStatus.RUNNING]: { 
    bg: 'bg-[hsl(var(--success))]/10', 
    text: 'text-[hsl(var(--success))]',
    indicator: 'bg-[hsl(var(--success))]'
  },
  [MachineStatus.STOPPED]: { 
    bg: 'bg-muted', 
    text: 'text-muted-foreground',
    indicator: 'bg-muted-foreground'
  },
  [MachineStatus.MAINTENANCE]: { 
    bg: 'bg-[hsl(var(--warning))]/10', 
    text: 'text-[hsl(var(--warning))]',
    indicator: 'bg-[hsl(var(--warning))]'
  },
};

const machineTypeIcons: Record<MachineType, string> = {
  [MachineType.WIRE_DRAWING]: '🔩',
  [MachineType.FLATTENING]: '🔨',
  [MachineType.WINDING]: '🧵',
  [MachineType.ELECTROPLATING]: '⚡',
};

export function MachineCard({ machine, onStatusChange, operatorMode = false }: MachineCardProps) {
  const { t } = useLanguage();
  const { getInventoryByMaterialKey } = useERP();
  const style = statusStyles[machine.status];
  const consumptionRates = getMachineConsumption(machine.type);
  const hasConsumption = consumptionRates.length > 0;

  const handleStatusChange = (status: MachineStatus) => {
    const result = onStatusChange(status);
    if (!result.success && result.reason === 'insufficientStock') {
      const materialName = result.material ? t(result.material as any) : '';
      toast({
        title: t('cannotStartMachine'),
        description: `${t('insufficientStock')}: ${materialName} (${result.available} ${t('kg')} / ${result.required} ${t('kg')})`,
        variant: 'destructive',
      });
    } else if (result.success && status === MachineStatus.RUNNING) {
      // Show consumption feedback
      const consumed = consumptionRates.map(r => `${r.amountPerStart} ${t('kg')} ${t(r.materialKey as any)}`).join(', ');
      if (consumed) {
        toast({
          title: t('inventoryConsumed'),
          description: consumed,
        });
      }
    }
  };

  // Check if machine can start (has sufficient stock)
  const canStart = () => {
    for (const rate of consumptionRates) {
      const item = getInventoryByMaterialKey(rate.materialKey);
      if (!item || item.quantity < rate.amountPerStart) {
        return false;
      }
    }
    return true;
  };

  const isStartDisabled = machine.status !== MachineStatus.RUNNING && !canStart();

  // Consumption info tooltip content
  const ConsumptionInfo = () => (
    <div className="space-y-2 text-xs">
      <div className="font-semibold flex items-center gap-1.5">
        <Package className="h-3 w-3" />
        {t('consumptionDetails')}
      </div>
      {consumptionRates.map(rate => {
        const item = getInventoryByMaterialKey(rate.materialKey);
        const hasEnough = item && item.quantity >= rate.amountPerStart;
        return (
          <div key={rate.materialKey} className="flex justify-between gap-3">
            <span>{t(rate.materialKey as any)}:</span>
            <span className={cn(!hasEnough && 'text-destructive font-medium')}>
              {rate.amountPerStart} {t('kg')} {t('perStart')}
              {item && ` (${item.quantity} ${t('kg')} ${t('inStock').toLowerCase()})`}
            </span>
          </div>
        );
      })}
      <div className="text-muted-foreground italic pt-1 border-t border-border/50">
        {t('productionReducesInventory')}
      </div>
    </div>
  );

  // Operator mode - simplified, large touch targets
  if (operatorMode) {
    return (
      <div className={cn(
        'glass-card p-4 relative overflow-hidden',
        machine.status === MachineStatus.RUNNING && 'ring-2 ring-[hsl(var(--success))]/50'
      )}>
        {/* Status Indicator */}
        <div className={cn('absolute top-0 left-0 right-0 h-1.5', style.indicator)} />

        {/* Header - Compact */}
        <div className="flex items-center gap-3 mb-4 pt-2">
          <span className="text-2xl">{machineTypeIcons[machine.type]}</span>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base truncate">{machine.name}</h3>
            <span className={cn('text-xs font-medium', style.text)}>{t(machine.status)}</span>
          </div>
          {hasConsumption && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={cn(
                    'p-1.5 rounded-lg',
                    isStartDisabled ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
                  )}>
                    {isStartDisabled ? <AlertTriangle className="h-4 w-4" /> : <Package className="h-4 w-4" />}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-xs">
                  <ConsumptionInfo />
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Large Touch Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {machine.status !== MachineStatus.RUNNING ? (
            <Button
              className={cn(
                "h-14 text-base font-semibold rounded-xl col-span-2 active:scale-95 transition-transform",
                isStartDisabled 
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-[hsl(var(--success))] hover:bg-[hsl(var(--success))]/90"
              )}
              onClick={() => handleStatusChange(MachineStatus.RUNNING)}
              disabled={isStartDisabled}
            >
              <Play className="h-6 w-6 mr-2" />
              {t('start')}
            </Button>
          ) : (
            <Button
              className="h-14 text-base font-semibold rounded-xl col-span-2 active:scale-95 transition-transform"
              variant="destructive"
              onClick={() => handleStatusChange(MachineStatus.STOPPED)}
            >
              <Square className="h-6 w-6 mr-2" />
              {t('stop')}
            </Button>
          )}
        </div>

        {machine.status !== MachineStatus.MAINTENANCE && (
          <Button
            variant="outline"
            className="w-full h-12 mt-2 rounded-xl active:scale-95 transition-transform"
            onClick={() => handleStatusChange(MachineStatus.MAINTENANCE)}
          >
            <Wrench className="h-5 w-5 mr-2" />
            {t('maintenance')}
          </Button>
        )}
      </div>
    );
  }

  // Standard mode
  return (
    <div className={cn(
      'glass-card p-4 md:p-5 card-hover group relative overflow-hidden',
      machine.status === MachineStatus.RUNNING && 'ring-1 ring-[hsl(var(--success))]/30'
    )}>
      {/* Status Indicator */}
      <div className={cn('absolute top-0 left-0 right-0 h-1', style.indicator)} />

      {/* Header */}
      <div className="flex items-start justify-between mb-4 md:mb-5 pt-2">
        <div className="flex items-center gap-2 md:gap-3">
          <span className="text-2xl md:text-3xl">{machineTypeIcons[machine.type]}</span>
          <div>
            <h3 className="font-bold text-base md:text-lg">{machine.name}</h3>
            <p className="text-xs md:text-sm text-muted-foreground">{t(machine.type)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasConsumption && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={cn(
                    'p-1.5 rounded-lg cursor-help',
                    isStartDisabled ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
                  )}>
                    {isStartDisabled ? <AlertTriangle className="h-3.5 w-3.5" /> : <Package className="h-3.5 w-3.5" />}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-xs">
                  <ConsumptionInfo />
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <span className={cn('status-pill text-[10px] md:text-xs', style.bg, style.text)}>
            <span className={cn('h-1.5 w-1.5 md:h-2 md:w-2 rounded-full animate-pulse', style.indicator)} />
            {t(machine.status)}
          </span>
        </div>
      </div>

      {/* Consumption Badge */}
      {hasConsumption && machine.status !== MachineStatus.RUNNING && (
        <div className="mb-3 flex items-center gap-1.5 text-[10px] md:text-xs text-muted-foreground bg-muted/50 rounded-lg px-2 py-1.5">
          <Package className="h-3 w-3" />
          <span>{t('consumesInventory')}: {consumptionRates.map(r => t(r.materialKey as any)).join(', ')}</span>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-2 md:gap-4 mb-4 md:mb-5">
        <div className="bg-muted/30 rounded-lg md:rounded-xl p-2 md:p-3">
          <div className="flex items-center gap-1.5 md:gap-2 text-muted-foreground mb-0.5 md:mb-1">
            <Gauge className="h-3 w-3 md:h-4 md:w-4" />
            <span className="text-[10px] md:text-xs font-medium">{t('efficiency')}</span>
          </div>
          <p className="text-lg md:text-xl font-bold">
            {machine.status === MachineStatus.RUNNING ? `${machine.efficiency}%` : '—'}
          </p>
        </div>
        <div className="bg-muted/30 rounded-lg md:rounded-xl p-2 md:p-3">
          <div className="flex items-center gap-1.5 md:gap-2 text-muted-foreground mb-0.5 md:mb-1">
            <Thermometer className="h-3 w-3 md:h-4 md:w-4" />
            <span className="text-[10px] md:text-xs font-medium">{t('temperature')}</span>
          </div>
          <p className="text-lg md:text-xl font-bold">{machine.temperature}°C</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        {machine.status !== MachineStatus.RUNNING && (
          <Button
            size="sm"
            className={cn(
              "flex-1 rounded-xl h-9 md:h-auto",
              isStartDisabled 
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-[hsl(var(--success))] hover:bg-[hsl(var(--success))]/90 shadow-lg shadow-[hsl(var(--success))]/20"
            )}
            onClick={() => handleStatusChange(MachineStatus.RUNNING)}
            disabled={isStartDisabled}
          >
            <Play className="h-4 w-4 mr-1.5" />
            {t('start')}
          </Button>
        )}
        {machine.status === MachineStatus.RUNNING && (
          <Button
            size="sm"
            variant="outline"
            className="flex-1 rounded-xl h-9 md:h-auto"
            onClick={() => handleStatusChange(MachineStatus.STOPPED)}
          >
            <Square className="h-4 w-4 mr-1.5" />
            {t('stop')}
          </Button>
        )}
        {machine.status !== MachineStatus.MAINTENANCE && (
          <Button
            size="sm"
            variant="outline"
            className="rounded-xl px-3 h-9 md:h-auto"
            onClick={() => handleStatusChange(MachineStatus.MAINTENANCE)}
          >
            <Wrench className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
