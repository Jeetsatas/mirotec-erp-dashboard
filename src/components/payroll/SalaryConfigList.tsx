import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { SalaryConfig } from '@/types/payroll';
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
import { SalaryConfigForm } from './SalaryConfigForm';
import { Settings, IndianRupee, Users } from 'lucide-react';

interface SalaryConfigListProps {
  employees: Employee[];
  salaryConfigs: SalaryConfig[];
  onUpdateConfig: (employeeId: string, updates: Partial<SalaryConfig>) => void;
}

export function SalaryConfigList({
  employees,
  salaryConfigs,
  onUpdateConfig,
}: SalaryConfigListProps) {
  const { t } = useLanguage();
  const [editingEmployee, setEditingEmployee] = useState<{
    employee: Employee;
    config: SalaryConfig;
  } | null>(null);

  const getConfig = (employeeId: string) => 
    salaryConfigs.find(sc => sc.employeeId === employeeId);

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

  const totalMonthlySalary = salaryConfigs.reduce((sum, sc) => sum + sc.baseMonthlySalary, 0);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t('salaryConfiguration')}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {employees.length} {t('employees')} • {t('totalMonthlySalary')}: {formatCurrency(totalMonthlySalary)}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>{t('employeeName')}</TableHead>
                  <TableHead>{t('role')}</TableHead>
                  <TableHead className="text-right">{t('baseSalary')}</TableHead>
                  <TableHead className="text-right">{t('perDaySalary')}</TableHead>
                  <TableHead className="text-right">{t('allowances')}</TableHead>
                  <TableHead className="text-center">{t('pfEsi')}</TableHead>
                  <TableHead className="text-center">{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => {
                  const config = getConfig(employee.id);
                  if (!config) return null;
                  
                  return (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{employee.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {employee.employeeId}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{t(employee.role)}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(config.baseMonthlySalary)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatCurrency(config.perDaySalary)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatCurrency(config.allowances)}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Badge variant="secondary" className="text-xs">
                            PF {config.pfDeduction}%
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            ESI {config.esiDeduction}%
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setEditingEmployee({ employee, config })}
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          {t('edit')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Form Modal */}
      {editingEmployee && (
        <SalaryConfigForm
          open={!!editingEmployee}
          onClose={() => setEditingEmployee(null)}
          employee={editingEmployee.employee}
          config={editingEmployee.config}
          onSave={(updates) => onUpdateConfig(editingEmployee.employee.id, updates)}
        />
      )}
    </>
  );
}
