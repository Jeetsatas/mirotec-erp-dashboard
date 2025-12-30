import { useLanguage } from '@/contexts/LanguageContext';
import { useERP } from '@/contexts/ERPContext';
import { OrderStatus } from '@/types/erp';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { ClipboardList, Clock, Truck, CheckCircle } from 'lucide-react';

const statusStyles: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'status-warning',
  [OrderStatus.PROCESSING]: 'status-info',
  [OrderStatus.SHIPPED]: 'status-pill bg-primary/10 text-primary border-primary/20',
  [OrderStatus.DELIVERED]: 'status-success',
};

const statusIcons: Record<OrderStatus, any> = {
  [OrderStatus.PENDING]: Clock,
  [OrderStatus.PROCESSING]: ClipboardList,
  [OrderStatus.SHIPPED]: Truck,
  [OrderStatus.DELIVERED]: CheckCircle,
};

export default function Orders() {
  const { t } = useLanguage();
  const { orders } = useERP();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const pendingCount = orders.filter(o => o.status === OrderStatus.PENDING).length;
  const processingCount = orders.filter(o => o.status === OrderStatus.PROCESSING).length;
  const shippedCount = orders.filter(o => o.status === OrderStatus.SHIPPED).length;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('orders')}</h1>
        <p className="text-muted-foreground mt-1">{t('companyName')}</p>
      </div>

      {/* Order Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-card p-5 flex items-center gap-4 card-hover">
          <div className="icon-container h-12 w-12 rounded-xl bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t('pending')}</p>
            <p className="text-2xl font-bold">{pendingCount}</p>
          </div>
        </div>
        <div className="glass-card p-5 flex items-center gap-4 card-hover">
          <div className="icon-container h-12 w-12 rounded-xl bg-[hsl(var(--info))]/10 text-[hsl(var(--info))]">
            <ClipboardList className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t('processing')}</p>
            <p className="text-2xl font-bold">{processingCount}</p>
          </div>
        </div>
        <div className="glass-card p-5 flex items-center gap-4 card-hover">
          <div className="icon-container h-12 w-12 rounded-xl bg-primary/10 text-primary">
            <Truck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t('shipped')}</p>
            <p className="text-2xl font-bold">{shippedCount}</p>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="glass-card p-6">
        <h3 className="text-xl font-semibold mb-5">{t('orders')}</h3>
        <div className="overflow-hidden rounded-xl border border-border/50">
          <Table className="premium-table">
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="font-semibold">{t('orderId')}</TableHead>
                <TableHead className="font-semibold">{t('client')}</TableHead>
                <TableHead className="font-semibold">{t('product')}</TableHead>
                <TableHead className="text-right font-semibold">{t('quantity')}</TableHead>
                <TableHead className="text-right font-semibold">{t('amount')}</TableHead>
                <TableHead className="font-semibold">{t('date')}</TableHead>
                <TableHead className="font-semibold">{t('status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order, index) => {
                const StatusIcon = statusIcons[order.status];
                return (
                  <TableRow 
                    key={order.id}
                    className="group animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <TableCell className="font-mono font-semibold text-primary">{order.id}</TableCell>
                    <TableCell className="font-medium">{order.clientName}</TableCell>
                    <TableCell>{t(order.productKey as any)}</TableCell>
                    <TableCell className="text-right font-mono">{order.quantity} kg</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(order.amount)}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(order.date)}</TableCell>
                    <TableCell>
                      <span className={cn('status-pill', statusStyles[order.status])}>
                        <StatusIcon className="h-3.5 w-3.5" />
                        {t(order.status)}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
