import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useERP } from '@/contexts/ERPContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Receipt } from 'lucide-react';
import { ChallanStatus, PaymentMode, GSTChallan } from '@/types/erp';

interface ChallanFormProps {
  open: boolean;
  onClose: () => void;
}

export function ChallanForm({ open, onClose }: ChallanFormProps) {
  const { t } = useLanguage();
  const { addChallan, invoices } = useERP();

  const [challanNumber, setChallanNumber] = useState('');
  const [taxPeriod, setTaxPeriod] = useState('');
  const [gstin, setGstin] = useState('24AABCS1234D1ZA');
  const [cgstAmount, setCgstAmount] = useState(0);
  const [sgstAmount, setSgstAmount] = useState(0);
  const [igstAmount, setIgstAmount] = useState(0);
  const [interestAmount, setInterestAmount] = useState(0);
  const [penaltyAmount, setPenaltyAmount] = useState(0);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>(PaymentMode.NET_BANKING);

  // Generate challan number and set default tax period
  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const num = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    setChallanNumber(`GST-${year}-${month}-${num}`);
    setTaxPeriod(`${year}-${month}`);
  }, [open]);

  // Auto-calculate from invoices for current period
  useEffect(() => {
    if (taxPeriod) {
      const [year, month] = taxPeriod.split('-');
      const periodInvoices = invoices.filter(inv => {
        const invDate = new Date(inv.invoiceDate);
        return invDate.getFullYear() === parseInt(year) && 
               invDate.getMonth() + 1 === parseInt(month);
      });

      const totalCGST = periodInvoices.reduce((sum, inv) => sum + inv.cgstAmount, 0);
      const totalSGST = periodInvoices.reduce((sum, inv) => sum + inv.sgstAmount, 0);
      const totalIGST = periodInvoices.reduce((sum, inv) => sum + inv.igstAmount, 0);

      setCgstAmount(totalCGST);
      setSgstAmount(totalSGST);
      setIgstAmount(totalIGST);
    }
  }, [taxPeriod, invoices]);

  const totalPayable = cgstAmount + sgstAmount + igstAmount + interestAmount + penaltyAmount;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSave = () => {
    const challan: Omit<GSTChallan, 'id'> = {
      challanNumber,
      taxPeriod,
      gstin,
      cgstAmount,
      sgstAmount,
      igstAmount,
      interestAmount,
      penaltyAmount,
      totalPayable,
      paymentMode,
      status: ChallanStatus.PENDING,
      createdDate: new Date().toISOString().split('T')[0],
    };
    addChallan(challan);
    onClose();
  };

  const getTaxPeriodOptions = () => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
      options.push({ value, label });
    }
    return options;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl glass-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Receipt className="h-5 w-5 text-primary" />
            {t('createChallan')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('challanNumber')}</Label>
              <Input 
                value={challanNumber} 
                onChange={e => setChallanNumber(e.target.value)}
                className="bg-background/50 font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('taxPeriod')}</Label>
              <Select value={taxPeriod} onValueChange={setTaxPeriod}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getTaxPeriodOptions().map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('gstin')}</Label>
            <Input 
              value={gstin} 
              onChange={e => setGstin(e.target.value.toUpperCase())}
              className="bg-background/50 font-mono"
            />
          </div>

          {/* Tax Breakup */}
          <div className="glass p-4 rounded-lg space-y-4">
            <h3 className="font-semibold text-foreground">{t('taxBreakup')}</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{t('cgst')}</Label>
                <Input 
                  type="number"
                  value={cgstAmount} 
                  onChange={e => setCgstAmount(Number(e.target.value))}
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('sgst')}</Label>
                <Input 
                  type="number"
                  value={sgstAmount} 
                  onChange={e => setSgstAmount(Number(e.target.value))}
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label>IGST</Label>
                <Input 
                  type="number"
                  value={igstAmount} 
                  onChange={e => setIgstAmount(Number(e.target.value))}
                  className="bg-background/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('interest')}</Label>
                <Input 
                  type="number"
                  value={interestAmount} 
                  onChange={e => setInterestAmount(Number(e.target.value))}
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('penalty')}</Label>
                <Input 
                  type="number"
                  value={penaltyAmount} 
                  onChange={e => setPenaltyAmount(Number(e.target.value))}
                  className="bg-background/50"
                />
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="glass p-4 rounded-lg space-y-4">
            <div className="space-y-2">
              <Label>{t('paymentMode')}</Label>
              <Select value={paymentMode} onValueChange={(v: PaymentMode) => setPaymentMode(v)}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PaymentMode.NET_BANKING}>{t('netBanking')}</SelectItem>
                  <SelectItem value={PaymentMode.CASH}>{t('cash')}</SelectItem>
                  <SelectItem value={PaymentMode.UPI}>{t('upi')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between py-3 bg-primary/10 rounded-lg px-4">
              <span className="font-semibold text-foreground">{t('totalPayable')}</span>
              <span className="font-bold text-xl text-primary">{formatCurrency(totalPayable)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              {t('cancel')}
            </Button>
            <Button onClick={handleSave} disabled={totalPayable <= 0}>
              {t('save')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}