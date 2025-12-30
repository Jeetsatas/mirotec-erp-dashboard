import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import { useERP } from '@/contexts/ERPContext';
import { ClientSummary } from '@/types/client';
import { OrderStatus, InvoiceStatus } from '@/types/erp';
import { 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  FileText, 
  AlertTriangle,
  TrendingUp,
  IndianRupee,
  Clock,
  CheckCircle,
  Truck
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClientDetailsModalProps {
  open: boolean;
  onClose: () => void;
  clientSummary: ClientSummary | null;
  onEdit: () => void;
}

const orderStatusStyles: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'status-warning',
  [OrderStatus.PROCESSING]: 'status-info',
  [OrderStatus.SHIPPED]: 'bg-primary/10 text-primary border-primary/20',
  [OrderStatus.DELIVERED]: 'status-success',
};

const orderStatusIcons: Record<OrderStatus, any> = {
  [OrderStatus.PENDING]: Clock,
  [OrderStatus.PROCESSING]: FileText,
  [OrderStatus.SHIPPED]: Truck,
  [OrderStatus.DELIVERED]: CheckCircle,
};

export function ClientDetailsModal({ open, onClose, clientSummary, onEdit }: ClientDetailsModalProps) {
  const { t } = useLanguage();
  const { orders, invoices } = useERP();

  if (!clientSummary) return null;

  const { client } = clientSummary;

  const clientOrders = orders.filter(o => o.clientId === client.id);
  const clientInvoices = invoices.filter(inv => inv.clientId === client.id);

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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl">{client.clientName}</DialogTitle>
              {client.companyName && (
                <p className="text-muted-foreground text-sm mt-1">{client.companyName}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {clientSummary.isOverCreditLimit && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {t('overCreditLimit')}
                </Badge>
              )}
              <Button variant="outline" size="sm" onClick={onEdit}>
                {t('edit')}
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <FileText className="h-4 w-4" />
                {t('totalOrders')}
              </div>
              <p className="text-2xl font-bold">{clientSummary.totalOrders}</p>
            </div>
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <TrendingUp className="h-4 w-4" />
                {t('totalSales')}
              </div>
              <p className="text-xl font-bold">{formatCurrency(clientSummary.totalSalesValue)}</p>
            </div>
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <IndianRupee className="h-4 w-4" />
                {t('outstandingBalance')}
              </div>
              <p className={cn(
                "text-xl font-bold",
                clientSummary.outstandingBalance > 0 ? "text-[hsl(var(--warning))]" : "text-[hsl(var(--success))]"
              )}>
                {formatCurrency(clientSummary.outstandingBalance)}
              </p>
            </div>
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <AlertTriangle className="h-4 w-4" />
                {t('creditLimit')}
              </div>
              <p className="text-xl font-bold">{formatCurrency(client.creditLimit)}</p>
            </div>
          </div>

          <Separator />

          {/* Contact Details */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                {t('contactDetails')}
              </h4>
              <div className="space-y-2">
                {client.contactPerson && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{client.contactPerson}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{client.phone}</span>
                </div>
                {client.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{client.email}</span>
                  </div>
                )}
                {client.gstin && (
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono">{client.gstin}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                {t('addresses')}
              </h4>
              <div className="space-y-3">
                {client.billingAddress && (
                  <div className="flex gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs text-muted-foreground block">{t('billingAddress')}</span>
                      <span>{client.billingAddress}</span>
                    </div>
                  </div>
                )}
                {client.shippingAddress && client.shippingAddress !== client.billingAddress && (
                  <div className="flex gap-2 text-sm">
                    <Truck className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs text-muted-foreground block">{t('shippingAddress')}</span>
                      <span>{client.shippingAddress}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Order History */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              {t('orderHistory')} ({clientOrders.length})
            </h4>
            {clientOrders.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {clientOrders.map(order => {
                  const StatusIcon = orderStatusIcons[order.status];
                  return (
                    <div 
                      key={order.id} 
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-semibold text-primary">{order.id}</span>
                        <span className="text-sm">{t(order.productKey as any)}</span>
                        <span className="text-sm text-muted-foreground">{order.quantity} kg</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">{formatCurrency(order.amount)}</span>
                        <span className="text-xs text-muted-foreground">{formatDate(order.date)}</span>
                        <Badge variant="outline" className={cn('gap-1', orderStatusStyles[order.status])}>
                          <StatusIcon className="h-3 w-3" />
                          {t(order.status)}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">{t('noRecords')}</p>
            )}
          </div>

          {/* Invoice History */}
          {clientInvoices.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  {t('invoices')} ({clientInvoices.length})
                </h4>
                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {clientInvoices.map(inv => (
                    <div 
                      key={inv.id} 
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-semibold">{inv.invoiceNumber}</span>
                        <span className="text-xs text-muted-foreground">{formatDate(inv.invoiceDate)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">{formatCurrency(inv.grandTotal)}</span>
                        <Badge variant={inv.status === InvoiceStatus.PAID ? 'default' : 'outline'}>
                          {t(inv.status)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            {t('close')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
