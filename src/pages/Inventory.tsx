import { useState } from 'react';
import { Plus, Package } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useERP } from '@/contexts/ERPContext';
import { useResponsive } from '@/hooks/useResponsive';
import { useOperatorMode } from '@/contexts/OperatorModeContext';
import { useRole } from '@/contexts/RoleContext';
import { InventoryCategory, StockStatus } from '@/types/erp';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AddStockModal } from '@/components/inventory/AddStockModal';
import { ExportButton } from '@/components/common/ExportButton';
import { exportToCSV, exportToExcel, ExportFormat, formatCurrencyForExport } from '@/utils/exportUtils';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const stockStatusStyles: Record<StockStatus, string> = {
  [StockStatus.IN_STOCK]: 'status-success',
  [StockStatus.LOW_STOCK]: 'status-warning',
  [StockStatus.OUT_OF_STOCK]: 'status-error',
};

export default function Inventory() {
  const { t } = useLanguage();
  const { inventory } = useERP();
  const { isMobile } = useResponsive();
  const { isOperatorMode } = useOperatorMode();
  const { hasPermission } = useRole();
  const { toast } = useToast();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const rawMaterials = inventory.filter(item => item.category === InventoryCategory.RAW_MATERIAL);
  const finishedGoods = inventory.filter(item => item.category === InventoryCategory.FINISHED_GOODS);

  // Export handler
  const handleExport = (format: ExportFormat) => {
    const exportData = inventory.map(item => ({
      itemName: t(item.nameKey as any),
      category: item.category === InventoryCategory.RAW_MATERIAL ? t('rawMaterials') : t('finishedGoods'),
      quantity: item.quantity,
      unit: item.unit,
      stockStatus: t(item.stockStatus),
      estimatedValue: formatCurrencyForExport(item.estimatedValue),
    }));

    const columns = [
      { key: 'itemName', label: t('itemName') },
      { key: 'category', label: t('category') },
      { key: 'quantity', label: t('quantity') },
      { key: 'unit', label: t('unit') },
      { key: 'stockStatus', label: t('stockStatus') },
      { key: 'estimatedValue', label: t('estimatedValue') },
    ];

    const filename = `inventory_report_${new Date().toISOString().split('T')[0]}`;

    if (format === 'csv') {
      exportToCSV(exportData, columns, filename);
    } else {
      exportToExcel(exportData, columns, filename);
    }

    toast({
      title: t('exportSuccess' as any),
      description: t('inventoryReport' as any),
    });
  };

  // Mobile Card View
  const InventoryCard = ({ item, index }: { item: typeof inventory[0]; index: number }) => (
    <div 
      className="glass-card p-4 space-y-3 animate-fade-in"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-semibold text-sm">{t(item.nameKey as any)}</h4>
          <p className="text-xs text-muted-foreground">{item.unit}</p>
        </div>
        <span className={cn('status-pill text-[10px]', stockStatusStyles[item.stockStatus])}>
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {t(item.stockStatus)}
        </span>
      </div>
      <div className="flex justify-between items-end">
        <div>
          <p className="text-xs text-muted-foreground">{t('quantity')}</p>
          <p className="text-xl font-bold font-mono">{item.quantity}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">{t('estimatedValue')}</p>
          <p className="font-semibold">{formatCurrency(item.estimatedValue)}</p>
        </div>
      </div>
    </div>
  );

  // Desktop Table View
  const InventoryTable = ({ items }: { items: typeof inventory }) => (
    <div className="overflow-hidden rounded-xl border border-border/50">
      <table className="premium-table w-full">
        <thead>
          <tr className="bg-muted/30">
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('itemName')}</th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('quantity')}</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('unit')}</th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('estimatedValue')}</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('status')}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr 
              key={item.id} 
              className="border-b border-border/50 hover:bg-muted/30 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <td className="px-4 py-4 text-sm font-semibold">{t(item.nameKey as any)}</td>
              <td className="px-4 py-4 text-sm text-right font-mono text-lg">{item.quantity}</td>
              <td className="px-4 py-4 text-sm text-muted-foreground">{item.unit}</td>
              <td className="px-4 py-4 text-sm text-right font-semibold">{formatCurrency(item.estimatedValue)}</td>
              <td className="px-4 py-4 text-sm">
                <span className={cn('status-pill', stockStatusStyles[item.stockStatus])}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {t(item.stockStatus)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-4 md:space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl md:text-3xl font-bold tracking-tight">{t('inventory')}</h1>
          <p className="text-muted-foreground text-sm mt-0.5 md:mt-1">{t('companyName')}</p>
        </div>
        <div className="flex items-center gap-2">
          {!isOperatorMode && hasPermission('inventoryAddStock') && (
            <>
              <ExportButton onExport={handleExport} />
              <Button onClick={() => setIsAddModalOpen(true)} className="rounded-xl shadow-lg shadow-primary/20 h-9 md:h-10 text-sm">
                <Plus className="h-4 w-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">{t('addStock')}</span>
                <span className="sm:hidden">{t('add')}</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Inventory Stats */}
      <div className="grid grid-cols-3 gap-2 md:gap-5">
        <div className="glass-card p-3 md:p-5 flex flex-col md:flex-row items-center gap-2 md:gap-4">
          <div className="icon-container h-10 w-10 md:h-12 md:w-12 bg-primary/10 text-primary rounded-lg md:rounded-xl">
            <Package className="h-5 w-5 md:h-6 md:w-6" />
          </div>
          <div className="text-center md:text-left">
            <p className="text-[10px] md:text-sm text-muted-foreground">{t('rawMaterials')}</p>
            <p className="text-xl md:text-2xl font-bold">{rawMaterials.length}</p>
          </div>
        </div>
        <div className="glass-card p-3 md:p-5 flex flex-col md:flex-row items-center gap-2 md:gap-4">
          <div className="icon-container h-10 w-10 md:h-12 md:w-12 bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] rounded-lg md:rounded-xl">
            <Package className="h-5 w-5 md:h-6 md:w-6" />
          </div>
          <div className="text-center md:text-left">
            <p className="text-[10px] md:text-sm text-muted-foreground">{t('finishedGoods')}</p>
            <p className="text-xl md:text-2xl font-bold">{finishedGoods.length}</p>
          </div>
        </div>
        <div className="glass-card p-3 md:p-5 flex flex-col md:flex-row items-center gap-2 md:gap-4">
          <div className="icon-container h-10 w-10 md:h-12 md:w-12 bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] rounded-lg md:rounded-xl">
            <Package className="h-5 w-5 md:h-6 md:w-6" />
          </div>
          <div className="text-center md:text-left">
            <p className="text-[10px] md:text-sm text-muted-foreground">{t('lowStockStatus')}</p>
            <p className="text-xl md:text-2xl font-bold">
              {inventory.filter(i => i.stockStatus === StockStatus.LOW_STOCK).length}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="raw" className="space-y-4 md:space-y-5">
        <TabsList className="bg-muted/50 p-1 rounded-xl w-full md:w-auto">
          <TabsTrigger value="raw" className="rounded-lg data-[state=active]:shadow-sm flex-1 md:flex-none text-sm">{t('rawMaterials')}</TabsTrigger>
          <TabsTrigger value="finished" className="rounded-lg data-[state=active]:shadow-sm flex-1 md:flex-none text-sm">{t('finishedGoods')}</TabsTrigger>
        </TabsList>

        <TabsContent value="raw" className="animate-fade-in">
          <div className="glass-card p-4 md:p-6">
            <h3 className="text-base md:text-lg font-semibold mb-4 md:mb-5">{t('rawMaterials')}</h3>
            {isMobile ? (
              <div className="space-y-3">
                {rawMaterials.map((item, index) => (
                  <InventoryCard key={item.id} item={item} index={index} />
                ))}
              </div>
            ) : (
              <InventoryTable items={rawMaterials} />
            )}
          </div>
        </TabsContent>

        <TabsContent value="finished" className="animate-fade-in">
          <div className="glass-card p-4 md:p-6">
            <h3 className="text-base md:text-lg font-semibold mb-4 md:mb-5">{t('finishedGoods')}</h3>
            {isMobile ? (
              <div className="space-y-3">
                {finishedGoods.map((item, index) => (
                  <InventoryCard key={item.id} item={item} index={index} />
                ))}
              </div>
            ) : (
              <InventoryTable items={finishedGoods} />
            )}
          </div>
        </TabsContent>
      </Tabs>

      <AddStockModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
    </div>
  );
}
