import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { TransactionType, TransactionCategory, PaymentStatus } from '@/types/erp';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface AddTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (transaction: {
    type: TransactionType;
    amount: number;
    date: string;
    category: TransactionCategory;
    description: string;
    status: PaymentStatus;
  }) => void;
}

export function AddTransactionModal({ open, onOpenChange, onSubmit }: AddTransactionModalProps) {
  const { t } = useLanguage();
  const [type, setType] = useState<TransactionType>(TransactionType.CREDIT);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<TransactionCategory>(TransactionCategory.SALES);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<PaymentStatus>(PaymentStatus.PAID);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    onSubmit({
      type,
      amount: parseFloat(amount),
      date,
      category,
      description,
      status,
    });

    // Reset form
    setType(TransactionType.CREDIT);
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setCategory(TransactionCategory.SALES);
    setDescription('');
    setStatus(PaymentStatus.PAID);
    onOpenChange(false);
  };

  const categories = [
    { value: TransactionCategory.SALES, label: t('sales') },
    { value: TransactionCategory.PURCHASE, label: t('purchase') },
    { value: TransactionCategory.SALARY, label: t('salary') },
    { value: TransactionCategory.GST, label: 'GST' },
    { value: TransactionCategory.MAINTENANCE, label: t('maintenance') },
    { value: TransactionCategory.OTHER, label: t('other') },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] glass-card border-border/50">
        <DialogHeader>
          <DialogTitle className="text-xl">{t('addEntry')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Entry Type */}
          <div className="space-y-2">
            <Label>{t('type')}</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType(TransactionType.CREDIT)}
                className={`p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                  type === TransactionType.CREDIT
                    ? 'border-[hsl(var(--success))] bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]'
                    : 'border-border hover:border-border/80'
                }`}
              >
                <ArrowDownRight className="h-5 w-5" />
                <span className="font-medium">{t('credit')}</span>
              </button>
              <button
                type="button"
                onClick={() => setType(TransactionType.DEBIT)}
                className={`p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                  type === TransactionType.DEBIT
                    ? 'border-destructive bg-destructive/10 text-destructive'
                    : 'border-border hover:border-border/80'
                }`}
              >
                <ArrowUpRight className="h-5 w-5" />
                <span className="font-medium">{t('debit')}</span>
              </button>
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">{t('amount')} (₹)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="text-lg font-mono"
              min="0"
              step="0.01"
              required
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">{t('date')}</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>{t('category')}</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as TransactionCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>{t('status')}</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as PaymentStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PaymentStatus.PAID}>{t('paid')}</SelectItem>
                <SelectItem value={PaymentStatus.PENDING}>{t('pending')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">{t('description')}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('notes')}
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              {t('cancel')}
            </Button>
            <Button type="submit" className="flex-1">
              {t('save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
