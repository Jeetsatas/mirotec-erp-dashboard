import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { SalaryConfig } from '@/types/payroll';
import { Employee } from '@/types/erp';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { IndianRupee, Percent, Save } from 'lucide-react';

interface SalaryConfigFormProps {
  open: boolean;
  onClose: () => void;
  employee: Employee;
  config: SalaryConfig;
  onSave: (updates: Partial<SalaryConfig>) => void;
}

export function SalaryConfigForm({ 
  open, 
  onClose, 
  employee, 
  config, 
  onSave 
}: SalaryConfigFormProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    baseMonthlySalary: config.baseMonthlySalary,
    allowances: config.allowances,
    pfDeduction: config.pfDeduction,
    esiDeduction: config.esiDeduction,
    otherDeductions: config.otherDeductions,
  });

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const perDaySalary = Math.round(formData.baseMonthlySalary / 26);
  const overtimeRate = Math.round(perDaySalary / 8 * 1.5);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IndianRupee className="h-5 w-5" />
            {t('salaryConfiguration')} - {employee.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Employee Info */}
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="text-sm text-muted-foreground">{t('employeeId')}: {employee.employeeId}</div>
            <div className="text-sm text-muted-foreground">{t('role')}: {t(employee.role)}</div>
            <div className="text-sm text-muted-foreground">{t('department')}: {t(employee.department)}</div>
          </div>

          {/* Base Salary */}
          <div className="space-y-2">
            <Label>{t('baseMonthlySalary')}</Label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                value={formData.baseMonthlySalary}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  baseMonthlySalary: parseInt(e.target.value) || 0 
                }))}
                className="pl-9"
              />
            </div>
          </div>

          {/* Derived Values (Read-only) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/30 rounded-lg p-3">
              <div className="text-xs text-muted-foreground">{t('perDaySalary')}</div>
              <div className="text-lg font-semibold">₹{perDaySalary.toLocaleString('en-IN')}</div>
            </div>
            <div className="bg-muted/30 rounded-lg p-3">
              <div className="text-xs text-muted-foreground">{t('overtimeRate')}/hr</div>
              <div className="text-lg font-semibold">₹{overtimeRate.toLocaleString('en-IN')}</div>
            </div>
          </div>

          {/* Allowances */}
          <div className="space-y-2">
            <Label>{t('allowances')}</Label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                value={formData.allowances}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  allowances: parseInt(e.target.value) || 0 
                }))}
                className="pl-9"
              />
            </div>
          </div>

          {/* Deductions */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">{t('deductions')}</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>{t('pfDeduction')} (%)</Label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.pfDeduction}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      pfDeduction: parseFloat(e.target.value) || 0 
                    }))}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('esiDeduction')} (%)</Label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.esiDeduction}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      esiDeduction: parseFloat(e.target.value) || 0 
                    }))}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 mt-3">
              <Label>{t('otherDeductions')}</Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  value={formData.otherDeductions}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    otherDeductions: parseInt(e.target.value) || 0 
                  }))}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            {t('save')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
