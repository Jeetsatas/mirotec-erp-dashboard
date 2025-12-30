import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { PayrollRecord, PayrollStatus } from '@/types/payroll';
import { Employee } from '@/types/erp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SalarySlipPreview } from './SalarySlipPreview';
import { FileText, CheckCircle, AlertCircle, Users, IndianRupee, TrendingDown } from 'lucide-react';

interface MonthlyPayrollTableProps {
  month: string;
  payrollRecords: PayrollRecord[];
  employees: Employee[];
  isProcessed: boolean;
  onProcess: () => void;
  summary: {
    totalEmployees: number;
    totalGrossSalary: number;
    totalDeductions: number;
    totalNetSalary: number;
  };
}

export function MonthlyPayrollTable({
  month,
  payrollRecords,
  employees,
  isProcessed,
  onProcess,
  summary,
}: MonthlyPayrollTableProps) {
  const { t } = useLanguage();
  const [selectedRecord, setSelectedRecord] = useState<{
    employee: Employee;
    record: PayrollRecord;
  } | null>(null);

  const getEmployee = (employeeId: string) => 
    employees.find(e => e.id === employeeId);

  const monthDate = new Date(month + '-01');
  const monthName = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

  return (
    <>
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('totalEmployees')}</p>
                <p className="text-2xl font-bold">{summary.totalEmployees}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <IndianRupee className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('grossSalary')}</p>
                <p className="text-2xl font-bold">{formatCurrency(summary.totalGrossSalary)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/20">
                <TrendingDown className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('totalDeductions')}</p>
                <p className="text-2xl font-bold">{formatCurrency(summary.totalDeductions)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <IndianRupee className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('netPayable')}</p>
                <p className="text-2xl font-bold">{formatCurrency(summary.totalNetSalary)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payroll Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t('monthlyPayroll')} - {monthName}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {isProcessed ? (
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  {t('payrollProcessed')}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-yellow-600">
                  <AlertCircle className="h-4 w-4" />
                  {t('payrollDraft')}
                </span>
              )}
            </p>
          </div>
          {!isProcessed && (
            <Button onClick={onProcess} className="gap-2">
              <CheckCircle className="h-4 w-4" />
              {t('processPayroll')}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>{t('employeeName')}</TableHead>
                  <TableHead className="text-center">{t('presentDays')}</TableHead>
                  <TableHead className="text-center">{t('halfDays')}</TableHead>
                  <TableHead className="text-center">{t('absentDays')}</TableHead>
                  <TableHead className="text-right">{t('grossSalary')}</TableHead>
                  <TableHead className="text-right">{t('deductions')}</TableHead>
                  <TableHead className="text-right">{t('netSalary')}</TableHead>
                  <TableHead className="text-center">{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrollRecords.map((record) => {
                  const employee = getEmployee(record.employeeId);
                  if (!employee) return null;
                  
                  return (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{employee.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {employee.employeeId} • {t(employee.role)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                          {record.presentDays}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
                          {record.halfDays}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30">
                          {record.absentDays}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(record.grossSalary)}
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        -{formatCurrency(record.totalDeductions)}
                      </TableCell>
                      <TableCell className="text-right font-bold text-primary">
                        {formatCurrency(record.netSalary)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedRecord({ employee, record })}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          {t('viewSlip')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Totals Row */}
          <div className="mt-4 bg-muted/50 rounded-lg p-4 flex justify-between items-center">
            <span className="font-semibold">{t('total')}</span>
            <div className="flex gap-8">
              <div className="text-right">
                <div className="text-xs text-muted-foreground">{t('grossSalary')}</div>
                <div className="font-bold">{formatCurrency(summary.totalGrossSalary)}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">{t('deductions')}</div>
                <div className="font-bold text-red-600">-{formatCurrency(summary.totalDeductions)}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">{t('netPayable')}</div>
                <div className="font-bold text-primary text-lg">{formatCurrency(summary.totalNetSalary)}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Salary Slip Preview Modal */}
      {selectedRecord && (
        <SalarySlipPreview
          open={!!selectedRecord}
          onClose={() => setSelectedRecord(null)}
          employee={selectedRecord.employee}
          payrollRecord={selectedRecord.record}
        />
      )}
    </>
  );
}
