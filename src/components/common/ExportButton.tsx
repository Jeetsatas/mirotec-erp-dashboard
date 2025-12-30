import { useState } from 'react';
import { Download, FileSpreadsheet, FileText, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { ExportFormat } from '@/utils/exportUtils';

interface ExportButtonProps {
  onExport: (format: ExportFormat) => void;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  disabled?: boolean;
}

export function ExportButton({ 
  onExport, 
  className,
  variant = 'outline',
  size = 'default',
  disabled = false,
}: ExportButtonProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  const handleExport = (format: ExportFormat) => {
    onExport(format);
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          disabled={disabled}
          className={cn(
            'rounded-xl gap-2 border-border/50 hover:bg-muted/80',
            className
          )}
        >
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">{t('export' as any)}</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass-card min-w-[180px]">
        <DropdownMenuItem 
          onClick={() => handleExport('csv')}
          className="cursor-pointer rounded-lg py-2.5 gap-3"
        >
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span>{t('exportAsCSV' as any)}</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleExport('excel')}
          className="cursor-pointer rounded-lg py-2.5 gap-3"
        >
          <FileSpreadsheet className="h-4 w-4 text-[hsl(var(--success))]" />
          <span>{t('exportAsExcel' as any)}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
