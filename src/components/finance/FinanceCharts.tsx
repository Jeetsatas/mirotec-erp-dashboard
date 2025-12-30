import { useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Transaction, TransactionType, TransactionCategory, PaymentStatus } from '@/types/erp';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

interface FinanceChartsProps {
  transactions: Transaction[];
}

// Professional muted color palette
const COLORS = {
  revenue: 'hsl(142, 71%, 45%)',
  expenses: 'hsl(0, 84%, 60%)',
  profit: 'hsl(217, 91%, 60%)',
  categories: [
    'hsl(217, 91%, 60%)',
    'hsl(142, 71%, 45%)',
    'hsl(45, 93%, 47%)',
    'hsl(280, 65%, 60%)',
    'hsl(0, 84%, 60%)',
    'hsl(190, 90%, 50%)',
  ],
};

export function ExpensePieChart({ transactions }: FinanceChartsProps) {
  const { t } = useLanguage();

  const data = useMemo(() => {
    const expenses = transactions.filter(
      (tx) => tx.type === TransactionType.DEBIT && tx.status === PaymentStatus.PAID
    );

    const categoryMap = new Map<string, number>();
    expenses.forEach((tx) => {
      const cat = tx.category || TransactionCategory.OTHER;
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + tx.amount);
    });

    return Array.from(categoryMap.entries()).map(([name, value]) => ({
      name: t(name as any),
      value,
    }));
  }, [transactions, t]);

  if (data.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
        {t('noRecords')}
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={0}
          outerRadius={70}
          paddingAngle={2}
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS.categories[index % COLORS.categories.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) =>
            new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)
          }
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function RevenueExpenseDonut({ transactions }: FinanceChartsProps) {
  const { t } = useLanguage();

  const data = useMemo(() => {
    const revenue = transactions
      .filter((tx) => tx.type === TransactionType.CREDIT && tx.status === PaymentStatus.PAID)
      .reduce((sum, tx) => sum + tx.amount, 0);
    const expenses = transactions
      .filter((tx) => tx.type === TransactionType.DEBIT && tx.status === PaymentStatus.PAID)
      .reduce((sum, tx) => sum + tx.amount, 0);

    return [
      { name: t('revenue'), value: revenue, fill: COLORS.revenue },
      { name: t('expenses'), value: expenses, fill: COLORS.expenses },
    ];
  }, [transactions, t]);

  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
        {t('noRecords')}
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={70}
          paddingAngle={4}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) =>
            new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)
          }
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
          }}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value) => <span className="text-xs text-foreground">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

interface TrendChartProps {
  transactions: Transaction[];
  days?: number;
}

export function RevenueTrendChart({ transactions, days = 7 }: TrendChartProps) {
  const { t } = useLanguage();

  const data = useMemo(() => {
    const now = new Date();
    const result = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayLabel = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

      const dayTxns = transactions.filter((tx) => tx.date === dateStr && tx.status === PaymentStatus.PAID);
      const revenue = dayTxns
        .filter((tx) => tx.type === TransactionType.CREDIT)
        .reduce((sum, tx) => sum + tx.amount, 0);
      const expenses = dayTxns
        .filter((tx) => tx.type === TransactionType.DEBIT)
        .reduce((sum, tx) => sum + tx.amount, 0);

      result.push({
        date: dayLabel,
        [t('revenue')]: revenue,
        [t('expenses')]: expenses,
      });
    }

    return result;
  }, [transactions, days, t]);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip
          formatter={(value: number) =>
            new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)
          }
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            fontSize: '12px',
          }}
        />
        <Bar dataKey={t('revenue')} fill={COLORS.revenue} radius={[4, 4, 0, 0]} />
        <Bar dataKey={t('expenses')} fill={COLORS.expenses} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Simple mini chart for other tabs
interface MiniChartProps {
  data: { name: string; value: number; fill?: string }[];
  type?: 'pie' | 'donut';
}

export function MiniPieChart({ data, type = 'pie' }: MiniChartProps) {
  if (data.length === 0 || data.every((d) => d.value === 0)) {
    return (
      <div className="h-[120px] flex items-center justify-center text-muted-foreground text-xs">
        No data
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={120}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={type === 'donut' ? 25 : 0}
          outerRadius={45}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill || COLORS.categories[index % COLORS.categories.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            fontSize: '11px',
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
