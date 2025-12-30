// Export utilities for generating CSV and Excel-ready data
// Backend integration can be added here later

export interface ExportColumn {
  key: string;
  label: string;
}

export type ExportFormat = 'csv' | 'excel';

export function generateCSV(data: Record<string, any>[], columns: ExportColumn[]): string {
  // Header row
  const header = columns.map(col => `"${col.label}"`).join(',');
  
  // Data rows
  const rows = data.map(row => 
    columns.map(col => {
      const value = row[col.key];
      // Escape quotes and wrap in quotes
      const escaped = String(value ?? '').replace(/"/g, '""');
      return `"${escaped}"`;
    }).join(',')
  );
  
  return [header, ...rows].join('\n');
}

export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

export function exportToCSV(
  data: Record<string, any>[],
  columns: ExportColumn[],
  filename: string
): void {
  const csvContent = generateCSV(data, columns);
  downloadCSV(csvContent, filename);
}

// Excel export placeholder - will trigger CSV download for now
// Can be replaced with actual xlsx library integration later
export function exportToExcel(
  data: Record<string, any>[],
  columns: ExportColumn[],
  filename: string
): void {
  // For now, export as CSV which Excel can open
  // TODO: Add xlsx library for native Excel export
  const csvContent = generateCSV(data, columns);
  downloadCSV(csvContent, `${filename}`);
}

export function formatDateForExport(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatCurrencyForExport(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}
