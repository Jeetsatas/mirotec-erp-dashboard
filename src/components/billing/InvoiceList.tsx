import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useERP } from '@/contexts/ERPContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, FileText } from 'lucide-react';
import { Invoice, InvoiceStatus } from '@/types/erp';
import { InvoicePreview } from './InvoicePreview';

export function InvoiceList() {
  const { t } = useLanguage();
  const { invoices, updateInvoiceStatus } = useERP();
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: InvoiceStatus) => {
    const styles: Record<InvoiceStatus, string> = {
      [InvoiceStatus.DRAFT]: 'bg-muted text-muted-foreground',
      [InvoiceStatus.ISSUED]: 'bg-primary/20 text-primary',
      [InvoiceStatus.PAID]: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
      [InvoiceStatus.CANCELLED]: 'bg-destructive/20 text-destructive',
    };
    const labels: Record<InvoiceStatus, string> = {
      [InvoiceStatus.DRAFT]: t('draft'),
      [InvoiceStatus.ISSUED]: t('issued'),
      [InvoiceStatus.PAID]: t('paid'),
      [InvoiceStatus.CANCELLED]: t('cancelled'),
    };
    return (
      <Badge className={styles[status]} variant="secondary">
        {labels[status]}
      </Badge>
    );
  };

  return (
    <>
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full premium-table">
            <thead>
              <tr>
                <th className="text-left">{t('invoiceNumber')}</th>
                <th className="text-left">{t('date')}</th>
                <th className="text-left">{t('client')}</th>
                <th className="text-right">{t('subtotal')}</th>
                <th className="text-right">{t('totalTax')}</th>
                <th className="text-right">{t('grandTotal')}</th>
                <th className="text-center">{t('status')}</th>
                <th className="text-center">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(invoice => (
                <tr key={invoice.id} className="group">
                  <td className="font-mono font-medium text-foreground">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      {invoice.invoiceNumber}
                    </div>
                  </td>
                  <td className="text-muted-foreground">
                    {new Date(invoice.invoiceDate).toLocaleDateString('en-IN')}
                  </td>
                  <td>
                    <div>
                      <p className="font-medium text-foreground">{invoice.clientName}</p>
                      <p className="text-xs text-muted-foreground">{invoice.clientGSTIN}</p>
                    </div>
                  </td>
                  <td className="text-right text-foreground">{formatCurrency(invoice.subtotal)}</td>
                  <td className="text-right text-muted-foreground">{formatCurrency(invoice.totalTax)}</td>
                  <td className="text-right font-semibold text-foreground">{formatCurrency(invoice.grandTotal)}</td>
                  <td className="text-center">{getStatusBadge(invoice.status)}</td>
                  <td className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setPreviewInvoice(invoice)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {invoice.status === InvoiceStatus.ISSUED && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateInvoiceStatus(invoice.id, InvoiceStatus.PAID)}
                          className="text-xs"
                        >
                          {t('paid')}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {invoices.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>{t('createInvoice')}</p>
          </div>
        )}
      </div>

      <InvoicePreview
        open={!!previewInvoice}
        onClose={() => setPreviewInvoice(null)}
        invoice={previewInvoice}
      />
    </>
  );
}