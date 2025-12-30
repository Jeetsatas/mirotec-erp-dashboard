import { useLanguage } from '@/contexts/LanguageContext';
import { useERP } from '@/contexts/ERPContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Receipt, CheckCircle } from 'lucide-react';
import { ChallanStatus, PaymentMode, GSTChallan } from '@/types/erp';

export function ChallanList() {
  const { t } = useLanguage();
  const { challans, updateChallanStatus } = useERP();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTaxPeriod = (period: string) => {
    const [year, month] = period.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  };

  const getStatusBadge = (status: ChallanStatus) => {
    const styles: Record<ChallanStatus, string> = {
      [ChallanStatus.PENDING]: 'bg-amber-500/20 text-amber-600 dark:text-amber-400',
      [ChallanStatus.PAID]: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
      [ChallanStatus.FILED]: 'bg-primary/20 text-primary',
    };
    const labels: Record<ChallanStatus, string> = {
      [ChallanStatus.PENDING]: t('pending'),
      [ChallanStatus.PAID]: t('paid'),
      [ChallanStatus.FILED]: t('filed'),
    };
    return (
      <Badge className={styles[status]} variant="secondary">
        {labels[status]}
      </Badge>
    );
  };

  const getPaymentModeLabel = (mode: PaymentMode) => {
    const labels: Record<PaymentMode, string> = {
      [PaymentMode.CASH]: t('cash'),
      [PaymentMode.NET_BANKING]: t('netBanking'),
      [PaymentMode.UPI]: t('upi'),
    };
    return labels[mode];
  };

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full premium-table">
          <thead>
            <tr>
              <th className="text-left">{t('challanNumber')}</th>
              <th className="text-left">{t('taxPeriod')}</th>
              <th className="text-right">{t('cgst')}</th>
              <th className="text-right">{t('sgst')}</th>
              <th className="text-right">IGST</th>
              <th className="text-right">{t('totalPayable')}</th>
              <th className="text-center">{t('paymentMode')}</th>
              <th className="text-center">{t('status')}</th>
              <th className="text-center">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {challans.map(challan => (
              <tr key={challan.id} className="group">
                <td className="font-mono font-medium text-foreground">
                  <div className="flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-primary" />
                    {challan.challanNumber}
                  </div>
                </td>
                <td className="text-foreground">{formatTaxPeriod(challan.taxPeriod)}</td>
                <td className="text-right text-muted-foreground">{formatCurrency(challan.cgstAmount)}</td>
                <td className="text-right text-muted-foreground">{formatCurrency(challan.sgstAmount)}</td>
                <td className="text-right text-muted-foreground">{formatCurrency(challan.igstAmount)}</td>
                <td className="text-right font-semibold text-foreground">{formatCurrency(challan.totalPayable)}</td>
                <td className="text-center text-sm text-muted-foreground">{getPaymentModeLabel(challan.paymentMode)}</td>
                <td className="text-center">{getStatusBadge(challan.status)}</td>
                <td className="text-center">
                  <Select 
                    value={challan.status}
                    onValueChange={(v: ChallanStatus) => updateChallanStatus(challan.id, v)}
                  >
                    <SelectTrigger className="w-[100px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ChallanStatus.PENDING}>{t('pending')}</SelectItem>
                      <SelectItem value={ChallanStatus.PAID}>{t('paid')}</SelectItem>
                      <SelectItem value={ChallanStatus.FILED}>{t('filed')}</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {challans.length === 0 && (
        <div className="p-8 text-center text-muted-foreground">
          <Receipt className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>{t('createChallan')}</p>
        </div>
      )}
    </div>
  );
}