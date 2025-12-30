import { Factory, Users, ClipboardList, IndianRupee, Activity } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useERP } from '@/contexts/ERPContext';
import { useResponsive } from '@/hooks/useResponsive';
import { KPICard } from '@/components/dashboard/KPICard';
import { ProductionChart } from '@/components/dashboard/ProductionChart';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { RevenueExpensesMini } from '@/components/analytics/MiniAnalyticsChart';

export default function Dashboard() {
  const { t } = useLanguage();
  const { dailyProduction, activeWorkforce, pendingOrdersCount, inventoryValue, totalRevenue, totalExpenses } = useERP();
  const { isMobile } = useResponsive();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-4 md:space-y-8">
      {/* Page Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl md:text-3xl font-bold tracking-tight">{t('dashboard')}</h1>
          <p className="text-muted-foreground text-sm mt-0.5 md:mt-1">{t('companyName')}</p>
        </div>
        <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
          <Activity className="h-3 w-3 md:h-4 md:w-4 text-[hsl(var(--success))]" />
          <span>Live</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
        <KPICard
          title={t('dailyProduction')}
          value={dailyProduction}
          subtitle={t('kg')}
          icon={<Factory className="h-5 w-5 md:h-7 md:w-7" />}
          trend={{ value: 8.5, positive: true }}
          iconColor="primary"
          compact={isMobile}
        />
        <KPICard
          title={t('activeWorkforce')}
          value={activeWorkforce}
          subtitle={t('employees')}
          icon={<Users className="h-5 w-5 md:h-7 md:w-7" />}
          iconColor="success"
          compact={isMobile}
        />
        <KPICard
          title={t('pendingOrders')}
          value={pendingOrdersCount}
          icon={<ClipboardList className="h-5 w-5 md:h-7 md:w-7" />}
          iconColor="warning"
          compact={isMobile}
        />
        <KPICard
          title={t('inventoryValue')}
          value={formatCurrency(inventoryValue)}
          icon={<IndianRupee className="h-5 w-5 md:h-7 md:w-7" />}
          trend={{ value: 2.3, positive: true }}
          iconColor="info"
          compact={isMobile}
        />
      </div>

      {/* Charts & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <ProductionChart />
        <div className="space-y-4 md:space-y-6">
          {!isMobile && <RevenueExpensesMini revenue={totalRevenue} expenses={totalExpenses} />}
          <AlertsPanel />
        </div>
      </div>
    </div>
  );
}
