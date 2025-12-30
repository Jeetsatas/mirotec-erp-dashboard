import { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useERP } from '@/contexts/ERPContext';
import { useRole } from '@/contexts/RoleContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MonthlyPayrollTable } from '@/components/payroll/MonthlyPayrollTable';
import { SalaryConfigList } from '@/components/payroll/SalaryConfigList';
import { 
  IndianRupee, 
  Users, 
  Calendar, 
  FileText, 
  Settings, 
  TrendingUp,
  ArrowLeftRight 
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Payroll() {
  const { t } = useLanguage();
  const { 
    employees, 
    salaryConfigs, 
    updateSalaryConfig, 
    getPayrollForMonth, 
    processPayroll, 
    isMonthProcessed,
    getMonthlyPayrollSummary 
  } = useERP();
  const { canEdit } = useRole();
  
  // Month selector
  const currentDate = new Date();
  const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  
  // Generate month options (last 12 months)
  const monthOptions = useMemo(() => {
    const options: { value: string; label: string }[] = [];
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      options.push({ value, label });
    }
    return options;
  }, []);
  
  // Get payroll data for selected month
  const payrollRecords = getPayrollForMonth(selectedMonth);
  const isProcessed = isMonthProcessed(selectedMonth);
  const summary = getMonthlyPayrollSummary(selectedMonth);
  
  // Handle process payroll
  const handleProcessPayroll = () => {
    const success = processPayroll(selectedMonth);
    if (success) {
      toast({
        title: t('payrollProcessed'),
        description: t('payrollExpenseAdded'),
      });
    }
  };
  
  // Calculate overview stats
  const totalMonthlyBudget = salaryConfigs.reduce((sum, sc) => sum + sc.baseMonthlySalary + sc.allowances, 0);
  
  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <IndianRupee className="h-7 w-7" />
            {t('payroll')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {employees.length} {t('employees')} • {t('totalMonthlySalary')}: {formatCurrency(totalMonthlyBudget)}
          </p>
        </div>
        
        {/* Month Selector */}
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={t('selectMonth')} />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('totalEmployees')}</p>
                <p className="text-2xl font-bold">{employees.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <TrendingUp className="h-5 w-5 text-green-500" />
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
                <ArrowLeftRight className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('totalDeductions')}</p>
                <p className="text-2xl font-bold">{formatCurrency(summary.totalDeductions)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <IndianRupee className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('netPayable')}</p>
                <p className="text-2xl font-bold">{formatCurrency(summary.totalNetSalary)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Finance Integration Badge */}
      <Card className="bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-amber-500/10 border-amber-500/30">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <ArrowLeftRight className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="font-medium text-foreground">{t('payroll')} → {t('finance')}</p>
              <p className="text-sm text-muted-foreground">
                {t('payrollExpenseAdded')}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
            {t('linkedToRawMaterial')}
          </Badge>
        </CardContent>
      </Card>
      
      {/* Tabs */}
      <Tabs defaultValue="monthly" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="monthly" className="gap-2">
            <FileText className="h-4 w-4" />
            {t('monthlyPayroll')}
          </TabsTrigger>
          <TabsTrigger value="config" className="gap-2">
            <Settings className="h-4 w-4" />
            {t('salaryConfiguration')}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="monthly" className="space-y-6">
          <MonthlyPayrollTable
            month={selectedMonth}
            payrollRecords={payrollRecords}
            employees={employees}
            isProcessed={isProcessed}
            onProcess={canEdit ? handleProcessPayroll : () => {}}
            summary={summary}
          />
        </TabsContent>
        
        <TabsContent value="config" className="space-y-6">
          <SalaryConfigList
            employees={employees}
            salaryConfigs={salaryConfigs}
            onUpdateConfig={canEdit ? updateSalaryConfig : () => {}}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
