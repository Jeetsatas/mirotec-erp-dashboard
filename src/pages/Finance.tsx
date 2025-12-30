import { useState, useMemo } from 'react';
import { IndianRupee, TrendingUp, TrendingDown, AlertCircle, ArrowUpRight, ArrowDownRight, FileText, Receipt, Wallet, Plus, Calendar } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useERP } from '@/contexts/ERPContext';
import { useRole } from '@/contexts/RoleContext';
import { PaymentStatus, TransactionType, TransactionSource, FinanceViewMode } from '@/types/erp';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { AddTransactionModal } from '@/components/finance/AddTransactionModal';
import { ExpensePieChart, RevenueExpenseDonut, RevenueTrendChart } from '@/components/finance/FinanceCharts';
import { ExportButton } from '@/components/common/ExportButton';
import { exportToCSV, exportToExcel, ExportFormat, formatCurrencyForExport, formatDateForExport } from '@/utils/exportUtils';
import { useToast } from '@/hooks/use-toast';

const paymentStatusStyles: Record<PaymentStatus, string> = {
  [PaymentStatus.PAID]: 'status-success',
  [PaymentStatus.PENDING]: 'status-warning',
  [PaymentStatus.OVERDUE]: 'status-error',
};

const sourceIcons: Record<TransactionSource, React.ReactNode> = {
  [TransactionSource.MANUAL]: <Wallet className="h-3.5 w-3.5" />,
  [TransactionSource.INVOICE]: <FileText className="h-3.5 w-3.5" />,
  [TransactionSource.GST_CHALLAN]: <Receipt className="h-3.5 w-3.5" />,
};

const sourceStyles: Record<TransactionSource, string> = {
  [TransactionSource.MANUAL]: 'bg-muted text-muted-foreground',
  [TransactionSource.INVOICE]: 'bg-primary/20 text-primary',
  [TransactionSource.GST_CHALLAN]: 'bg-amber-500/20 text-amber-600 dark:text-amber-400',
};

export default function Finance() {
  const { t } = useLanguage();
  const { 
    transactions, 
    invoices,
    addManualTransaction,
  } = useERP();
  const { hasPermission } = useRole();
  const { toast } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<FinanceViewMode | 'all'>(FinanceViewMode.MONTH);

  // Get date range based on view mode
  const getDateRange = () => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (viewMode) {
      case FinanceViewMode.DAY:
        return { start: startOfDay, end: now };
      case FinanceViewMode.WEEK:
        const weekStart = new Date(startOfDay);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        return { start: weekStart, end: now };
      case FinanceViewMode.MONTH:
        return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: now };
      case FinanceViewMode.QUARTER:
        const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
        return { start: new Date(now.getFullYear(), quarterMonth, 1), end: now };
      case FinanceViewMode.YEAR:
        return { start: new Date(now.getFullYear(), 0, 1), end: now };
      default:
        return null; // All time
    }
  };

  // Filter transactions by date range
  const filteredTransactions = useMemo(() => {
    const range = getDateRange();
    if (!range) return transactions;
    
    return transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate >= range.start && txDate <= range.end;
    });
  }, [transactions, viewMode]);

  // Computed KPIs from filtered transactions
  const totalRevenue = useMemo(() => 
    filteredTransactions
      .filter(t => t.type === TransactionType.CREDIT && t.status === PaymentStatus.PAID)
      .reduce((sum, t) => sum + t.amount, 0),
    [filteredTransactions]
  );

  const totalExpenses = useMemo(() => 
    filteredTransactions
      .filter(t => t.type === TransactionType.DEBIT && t.status === PaymentStatus.PAID)
      .reduce((sum, t) => sum + t.amount, 0),
    [filteredTransactions]
  );

  const profit = totalRevenue - totalExpenses;

  // Outstanding from invoices (not time-filtered for accuracy)
  const outstandingReceivables = useMemo(() => 
    invoices
      .filter(inv => inv.status === 'issued')
      .reduce((sum, inv) => sum + inv.grandTotal, 0),
    [invoices]
  );

  const totalGSTPaid = useMemo(() => 
    filteredTransactions
      .filter(t => t.source === TransactionSource.GST_CHALLAN && t.status === PaymentStatus.PAID)
      .reduce((sum, t) => sum + t.amount, 0),
    [filteredTransactions]
  );

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

  // Sort transactions by date (newest first)
  const sortedTransactions = useMemo(() => 
    [...filteredTransactions].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ),
    [filteredTransactions]
  );

  const viewModeOptions = [
    { value: FinanceViewMode.DAY, label: t('dayView') },
    { value: FinanceViewMode.WEEK, label: t('weekView') },
    { value: FinanceViewMode.MONTH, label: t('monthView') },
    { value: FinanceViewMode.QUARTER, label: t('quarterView') },
    { value: FinanceViewMode.YEAR, label: t('annualView') },
    { value: 'all', label: t('allTime') },
  ];

  // Export handler
  const handleExport = (format: ExportFormat) => {
    // Export summary + transactions
    const summaryData = [
      { metric: t('revenue'), value: formatCurrencyForExport(totalRevenue) },
      { metric: t('expenses'), value: formatCurrencyForExport(totalExpenses) },
      { metric: t('profit'), value: formatCurrencyForExport(profit) },
      { metric: t('outstandingReceivables'), value: formatCurrencyForExport(outstandingReceivables) },
    ];

    const transactionData = filteredTransactions.map(tx => ({
      id: tx.id,
      description: tx.descriptionKey ? t(tx.descriptionKey as any) : tx.description,
      type: t(tx.type),
      source: t(tx.source),
      amount: formatCurrencyForExport(tx.amount),
      date: formatDateForExport(tx.date),
      status: t(tx.status),
    }));

    const columns = [
      { key: 'id', label: t('transactionId') },
      { key: 'description', label: t('description') },
      { key: 'type', label: t('type') },
      { key: 'source', label: t('source') },
      { key: 'amount', label: t('amount') },
      { key: 'date', label: t('date') },
      { key: 'status', label: t('status') },
    ];

    const filename = `finance_report_${viewMode}_${new Date().toISOString().split('T')[0]}`;

    if (format === 'csv') {
      exportToCSV(transactionData, columns, filename);
    } else {
      exportToExcel(transactionData, columns, filename);
    }

    toast({
      title: t('exportSuccess' as any),
      description: t('financeReport' as any),
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('finance')}</h1>
          <p className="text-muted-foreground mt-1">{t('companyName')}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select value={viewMode} onValueChange={(v) => setViewMode(v as FinanceViewMode | 'all')}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {viewModeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <ExportButton onExport={handleExport} />
          {hasPermission('financeManualEntry') && (
            <Button onClick={() => setIsAddModalOpen(true)} className="rounded-xl shadow-lg shadow-primary/20">
              <Plus className="h-4 w-4 mr-2" />
              {t('addEntry')}
            </Button>
          )}
        </div>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card p-6 card-hover">
          <div className="flex items-start justify-between mb-4">
            <div className="icon-container h-12 w-12 rounded-xl bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground font-medium">{t('revenue')}</p>
          <p className="text-2xl font-bold mt-1">{formatCurrency(totalRevenue)}</p>
          <p className="text-xs text-muted-foreground mt-2">{t('credit')} • {t('paid')}</p>
        </div>

        <div className="glass-card p-6 card-hover">
          <div className="flex items-start justify-between mb-4">
            <div className="icon-container h-12 w-12 rounded-xl bg-destructive/10 text-destructive">
              <TrendingDown className="h-6 w-6" />
            </div>
            <span className="text-xs text-muted-foreground">
              GST: {formatCurrency(totalGSTPaid)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground font-medium">{t('expenses')}</p>
          <p className="text-2xl font-bold mt-1">{formatCurrency(totalExpenses)}</p>
          <p className="text-xs text-muted-foreground mt-2">{t('debit')} • {t('paid')}</p>
        </div>

        <div className="glass-card p-6 card-hover">
          <div className="flex items-start justify-between mb-4">
            <div className="icon-container h-12 w-12 rounded-xl bg-primary/10 text-primary">
              <IndianRupee className="h-6 w-6" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground font-medium">{t('profit')}</p>
          <p className={cn(
            'text-2xl font-bold mt-1',
            profit < 0 ? 'text-destructive' : 'text-[hsl(var(--success))]'
          )}>
            {formatCurrency(profit)}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {t('revenue')} − {t('expenses')}
          </p>
        </div>

        <div className="glass-card p-6 card-hover">
          <div className="flex items-start justify-between mb-4">
            <div className="icon-container h-12 w-12 rounded-xl bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]">
              <AlertCircle className="h-6 w-6" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground font-medium">{t('outstandingReceivables')}</p>
          <p className="text-2xl font-bold mt-1">{formatCurrency(outstandingReceivables)}</p>
          <p className="text-xs text-muted-foreground mt-2">{t('issued')} {t('invoices')}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="glass-card p-5">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">{t('expenseBreakup')}</h4>
          <ExpensePieChart transactions={filteredTransactions} />
        </div>
        <div className="glass-card p-5">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">{t('revenueVsExpenses')}</h4>
          <RevenueExpenseDonut transactions={filteredTransactions} />
        </div>
        <div className="glass-card p-5">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">{t('financialTrend')}</h4>
          <RevenueTrendChart transactions={transactions} days={7} />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="glass-card p-6">
        <h3 className="text-xl font-semibold mb-5">{t('transactions')}</h3>
        <div className="overflow-hidden rounded-xl border border-border/50">
          <Table className="premium-table">
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="font-semibold">{t('transactionId')}</TableHead>
                <TableHead className="font-semibold">{t('description')}</TableHead>
                <TableHead className="font-semibold">{t('source')}</TableHead>
                <TableHead className="font-semibold">{t('type')}</TableHead>
                <TableHead className="text-right font-semibold">{t('amount')}</TableHead>
                <TableHead className="font-semibold">{t('date')}</TableHead>
                <TableHead className="font-semibold">{t('status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTransactions.map((transaction, index) => (
                <TableRow 
                  key={transaction.id}
                  className="group animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <TableCell className="font-mono font-semibold text-muted-foreground text-xs">
                    {transaction.id}
                  </TableCell>
                  <TableCell className="max-w-[280px]">
                    <div className="flex flex-col">
                      <span className="truncate block text-foreground">
                        {transaction.descriptionKey ? t(transaction.descriptionKey as any) : transaction.description}
                      </span>
                      {transaction.referenceNumber && (
                        <span className="text-xs text-muted-foreground font-mono">
                          {t('reference')}: {transaction.referenceNumber}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary" 
                      className={cn('gap-1', sourceStyles[transaction.source])}
                    >
                      {sourceIcons[transaction.source]}
                      {t(transaction.source)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      'status-pill',
                      transaction.type === TransactionType.CREDIT 
                        ? 'status-success'
                        : 'status-error'
                    )}>
                      {transaction.type === TransactionType.CREDIT ? (
                        <ArrowDownRight className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      )}
                      {t(transaction.type)}
                    </span>
                  </TableCell>
                  <TableCell className={cn(
                    'text-right font-bold font-mono',
                    transaction.type === TransactionType.CREDIT ? 'text-[hsl(var(--success))]' : 'text-destructive'
                  )}>
                    {transaction.type === TransactionType.CREDIT ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(transaction.date)}</TableCell>
                  <TableCell>
                    <span className={cn('status-pill', paymentStatusStyles[transaction.status])}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {t(transaction.status)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {sortedTransactions.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            <Wallet className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>{t('noRecords')}</p>
          </div>
        )}
      </div>

      {/* Add Transaction Modal */}
      <AddTransactionModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSubmit={addManualTransaction}
      />
    </div>
  );
}
