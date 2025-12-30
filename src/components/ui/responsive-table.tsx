import { ReactNode } from 'react';
import { useResponsive } from '@/hooks/useResponsive';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export interface Column<T> {
  key: string;
  header: string;
  render: (item: T, index: number) => ReactNode;
  mobileRender?: (item: T, index: number) => ReactNode;
  hideOnMobile?: boolean;
  className?: string;
}

interface ResponsiveTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  mobileCardRender?: (item: T, index: number) => ReactNode;
  emptyMessage?: string;
}

export function ResponsiveTable<T>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  mobileCardRender,
  emptyMessage = 'No data available',
}: ResponsiveTableProps<T>) {
  const { isMobile } = useResponsive();

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  // Mobile card view
  if (isMobile) {
    return (
      <div className="space-y-3">
        {data.map((item, index) => {
          if (mobileCardRender) {
            return (
              <div key={keyExtractor(item)} onClick={() => onRowClick?.(item)}>
                {mobileCardRender(item, index)}
              </div>
            );
          }

          // Default mobile card
          const visibleColumns = columns.filter(col => !col.hideOnMobile);
          return (
            <div
              key={keyExtractor(item)}
              onClick={() => onRowClick?.(item)}
              className={cn(
                'glass-card p-4 space-y-3 animate-fade-in',
                onRowClick && 'active:scale-[0.98] transition-transform cursor-pointer'
              )}
              style={{ animationDelay: `${index * 30}ms` }}
            >
              {visibleColumns.map((col) => (
                <div key={col.key} className="flex justify-between items-center gap-2">
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    {col.header}
                  </span>
                  <span className="font-medium text-sm text-right">
                    {col.mobileRender ? col.mobileRender(item, index) : col.render(item, index)}
                  </span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    );
  }

  // Desktop table view
  return (
    <div className="overflow-hidden rounded-xl border border-border/50">
      <Table className="premium-table">
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            {columns.map((col) => (
              <TableHead key={col.key} className={cn('font-semibold', col.className)}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow
              key={keyExtractor(item)}
              className={cn(
                'group animate-fade-in',
                onRowClick && 'cursor-pointer'
              )}
              style={{ animationDelay: `${index * 30}ms` }}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((col) => (
                <TableCell key={col.key} className={col.className}>
                  {col.render(item, index)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
