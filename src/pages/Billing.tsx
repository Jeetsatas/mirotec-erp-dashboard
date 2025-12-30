import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useERP } from '@/contexts/ERPContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Receipt, Plus, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { InvoiceForm } from '@/components/billing/InvoiceForm';
import { InvoicePreview } from '@/components/billing/InvoicePreview';
import { InvoiceList } from '@/components/billing/InvoiceList';
import { ChallanForm } from '@/components/billing/ChallanForm';
import { ChallanList } from '@/components/billing/ChallanList';
import { Invoice, InvoiceStatus, ChallanStatus } from '@/types/erp';

export default function Billing() {
  const { t } = useLanguage();
  const { invoices, challans, totalGSTCollected } = useERP();
  
  const [invoiceFormOpen, setInvoiceFormOpen] = useState(false);
  const [challanFormOpen, setChallanFormOpen] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<Omit<Invoice, 'id'> | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalInvoiceValue = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
  const paidInvoices = invoices.filter(inv => inv.status === InvoiceStatus.PAID).length;
  const pendingChallans = challans.filter(ch => ch.status === ChallanStatus.PENDING).length;
  const totalChallanAmount = challans.reduce((sum, ch) => sum + ch.totalPayable, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('billing')}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            GST-compliant invoicing & tax management
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl card-hover">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('totalInvoices')}</p>
              <p className="text-xl font-bold text-foreground">{invoices.length}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {formatCurrency(totalInvoiceValue)} {t('total')}
          </p>
        </div>

        <div className="glass-card p-4 rounded-xl card-hover">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('paid')}</p>
              <p className="text-xl font-bold text-foreground">{paidInvoices}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {t('invoices')}
          </p>
        </div>

        <div className="glass-card p-4 rounded-xl card-hover">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('pendingChallans')}</p>
              <p className="text-xl font-bold text-foreground">{pendingChallans}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {formatCurrency(challans.filter(ch => ch.status === ChallanStatus.PENDING).reduce((sum, ch) => sum + ch.totalPayable, 0))}
          </p>
        </div>

        <div className="glass-card p-4 rounded-xl card-hover">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-indigo-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('totalTax')}</p>
              <p className="text-xl font-bold text-foreground">{formatCurrency(totalGSTCollected)}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {t('thisMonth')}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="invoices" className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <TabsList className="glass">
            <TabsTrigger value="invoices" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {t('invoices')}
            </TabsTrigger>
            <TabsTrigger value="challans" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              {t('gstChallans')}
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <Button onClick={() => setInvoiceFormOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              {t('createInvoice')}
            </Button>
            <Button onClick={() => setChallanFormOpen(true)} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              {t('createChallan')}
            </Button>
          </div>
        </div>

        <TabsContent value="invoices">
          <InvoiceList />
        </TabsContent>

        <TabsContent value="challans">
          <ChallanList />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <InvoiceForm 
        open={invoiceFormOpen}
        onClose={() => setInvoiceFormOpen(false)}
        onPreview={(invoice) => {
          setPreviewInvoice(invoice);
          setInvoiceFormOpen(false);
        }}
      />

      <InvoicePreview
        open={!!previewInvoice}
        onClose={() => setPreviewInvoice(null)}
        invoice={previewInvoice}
      />

      <ChallanForm
        open={challanFormOpen}
        onClose={() => setChallanFormOpen(false)}
      />
    </div>
  );
}