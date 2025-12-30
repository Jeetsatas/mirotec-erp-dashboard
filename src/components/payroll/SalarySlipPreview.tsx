import { useLanguage } from '@/contexts/LanguageContext';
import { useCompany } from '@/contexts/CompanyContext';
import { PayrollRecord } from '@/types/payroll';
import { Employee } from '@/types/erp';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FileText, Printer } from 'lucide-react';

interface SalarySlipPreviewProps {
  open: boolean;
  onClose: () => void;
  employee: Employee;
  payrollRecord: PayrollRecord;
}

export function SalarySlipPreview({ 
  open, 
  onClose, 
  employee, 
  payrollRecord 
}: SalarySlipPreviewProps) {
  const { t } = useLanguage();
  const { company } = useCompany();

  const monthDate = new Date(payrollRecord.month + '-01');
  const monthName = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t('salarySlip')} - {monthName}
          </DialogTitle>
        </DialogHeader>

        {/* Salary Slip Document */}
        <div className="bg-background border rounded-lg p-6 space-y-6 print:border-0">
          {/* Header */}
          <div className="text-center border-b pb-4">
            <h2 className="text-xl font-bold text-foreground">{company.name || t('companyName')}</h2>
            <p className="text-sm text-muted-foreground">{company.address || t('companyAddress')}</p>
            <p className="text-sm text-muted-foreground">GSTIN: {company.gstin || t('companyGSTIN')}</p>
            <div className="mt-3 bg-primary/10 text-primary font-semibold py-1 px-3 rounded inline-block">
              {t('salarySlip')} - {monthName}
            </div>
          </div>

          {/* Employee Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">{t('employeeName')}</div>
              <div className="font-medium">{employee.name}</div>
            </div>
            <div>
              <div className="text-muted-foreground">{t('employeeId')}</div>
              <div className="font-medium">{employee.employeeId}</div>
            </div>
            <div>
              <div className="text-muted-foreground">{t('department')}</div>
              <div className="font-medium">{t(employee.department)}</div>
            </div>
            <div>
              <div className="text-muted-foreground">{t('role')}</div>
              <div className="font-medium">{t(employee.role)}</div>
            </div>
          </div>

          <Separator />

          {/* Attendance Summary */}
          <div>
            <h3 className="font-semibold mb-3">{t('attendanceSummary')}</h3>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="bg-muted/30 rounded p-2">
                <div className="text-muted-foreground">{t('totalWorkingDays')}</div>
                <div className="font-semibold">{payrollRecord.workingDays}</div>
              </div>
              <div className="bg-green-500/10 rounded p-2">
                <div className="text-muted-foreground">{t('presentDays')}</div>
                <div className="font-semibold text-green-600">{payrollRecord.presentDays}</div>
              </div>
              <div className="bg-yellow-500/10 rounded p-2">
                <div className="text-muted-foreground">{t('halfDays')}</div>
                <div className="font-semibold text-yellow-600">{payrollRecord.halfDays}</div>
              </div>
              <div className="bg-red-500/10 rounded p-2">
                <div className="text-muted-foreground">{t('absentDays')}</div>
                <div className="font-semibold text-red-600">{payrollRecord.absentDays}</div>
              </div>
              <div className="bg-orange-500/10 rounded p-2">
                <div className="text-muted-foreground">{t('leaveDays')}</div>
                <div className="font-semibold text-orange-600">{payrollRecord.leaveDays}</div>
              </div>
              <div className="bg-blue-500/10 rounded p-2">
                <div className="text-muted-foreground">{t('overtimeHours')}</div>
                <div className="font-semibold text-blue-600">{payrollRecord.overtimeHours} {t('hrs')}</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Earnings & Deductions */}
          <div className="grid grid-cols-2 gap-6">
            {/* Earnings */}
            <div>
              <h3 className="font-semibold mb-3 text-green-600">{t('earnings')}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>{t('basicSalary')}</span>
                  <span className="font-medium">{formatCurrency(payrollRecord.basicSalary)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('overtimePay')}</span>
                  <span className="font-medium">{formatCurrency(payrollRecord.overtimePay)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('allowances')}</span>
                  <span className="font-medium">{formatCurrency(payrollRecord.allowances)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-semibold">
                  <span>{t('grossSalary')}</span>
                  <span className="text-green-600">{formatCurrency(payrollRecord.grossSalary)}</span>
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div>
              <h3 className="font-semibold mb-3 text-red-600">{t('deductions')}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>{t('pfDeduction')}</span>
                  <span className="font-medium">{formatCurrency(payrollRecord.pfDeduction)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('esiDeduction')}</span>
                  <span className="font-medium">{formatCurrency(payrollRecord.esiDeduction)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('otherDeductions')}</span>
                  <span className="font-medium">{formatCurrency(payrollRecord.otherDeductions)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-semibold">
                  <span>{t('totalDeductions')}</span>
                  <span className="text-red-600">{formatCurrency(payrollRecord.totalDeductions)}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Net Payable */}
          <div className="bg-primary/10 rounded-lg p-4 text-center">
            <div className="text-sm text-muted-foreground">{t('netPayableSalary')}</div>
            <div className="text-3xl font-bold text-primary">
              {formatCurrency(payrollRecord.netSalary)}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between pt-6 border-t text-sm">
            <div>
              <div className="text-muted-foreground">{t('generatedOn')}</div>
              <div>{new Date().toLocaleDateString('en-IN')}</div>
            </div>
            <div className="text-right">
              <div className="h-12 border-b border-dashed border-muted-foreground/50 w-40 mb-1"></div>
              <div className="text-muted-foreground">{t('authorizedSignatory')}</div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            {t('close')}
          </Button>
          <Button onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" />
            {t('print')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
