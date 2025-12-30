import { useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// Professional muted color palette
const COLORS = [
  'hsl(217, 91%, 60%)',
  'hsl(142, 71%, 45%)',
  'hsl(45, 93%, 47%)',
  'hsl(280, 65%, 60%)',
  'hsl(0, 84%, 60%)',
  'hsl(190, 90%, 50%)',
];

interface ChartData {
  name: string;
  value: number;
  fill?: string;
}

interface MiniAnalyticsChartProps {
  data: ChartData[];
  title: string;
  type?: 'pie' | 'donut';
  height?: number;
}

export function MiniAnalyticsChart({ data, title, type = 'donut', height = 140 }: MiniAnalyticsChartProps) {
  const total = useMemo(() => data.reduce((sum, d) => sum + d.value, 0), [data]);

  if (data.length === 0 || total === 0) {
    return (
      <div className="glass-card p-4">
        <h4 className="text-sm font-medium text-muted-foreground mb-2">{title}</h4>
        <div className="h-[100px] flex items-center justify-center text-muted-foreground text-xs">
          No data
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-4">
      <h4 className="text-sm font-medium text-muted-foreground mb-2">{title}</h4>
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0" style={{ width: height, height }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={type === 'donut' ? height * 0.25 : 0}
                outerRadius={height * 0.4}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.fill || COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '11px',
                  padding: '6px 10px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-1.5">
          {data.slice(0, 4).map((item, index) => (
            <div key={item.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.fill || COLORS[index % COLORS.length] }}
                />
                <span className="text-muted-foreground truncate max-w-[80px]">{item.name}</span>
              </div>
              <span className="font-medium tabular-nums">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Revenue vs Expenses mini chart for Dashboard
interface RevenueExpensesMiniProps {
  revenue: number;
  expenses: number;
}

export function RevenueExpensesMini({ revenue, expenses }: RevenueExpensesMiniProps) {
  const { t } = useLanguage();

  const data = [
    { name: t('revenue'), value: revenue, fill: 'hsl(142, 71%, 45%)' },
    { name: t('expenses'), value: expenses, fill: 'hsl(0, 84%, 60%)' },
  ];

  const formatCurrency = (value: number) => {
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
    return `₹${value}`;
  };

  return (
    <MiniAnalyticsChart
      data={data}
      title={`${t('revenue')} vs ${t('expenses')}`}
      type="donut"
    />
  );
}
