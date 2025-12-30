import { useState } from 'react';
import { Plus, Users, UserCheck, UserX } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useERP } from '@/contexts/ERPContext';
import { useRole } from '@/contexts/RoleContext';
import { AttendanceStatus } from '@/types/erp';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AddEmployeeModal } from '@/components/workforce/AddEmployeeModal';
import { AttendanceTracker } from '@/components/workforce/AttendanceTracker';
import { ExportButton } from '@/components/common/ExportButton';
import { exportToCSV, exportToExcel, ExportFormat } from '@/utils/exportUtils';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const attendanceStyles: Record<AttendanceStatus, string> = {
  [AttendanceStatus.PRESENT]: 'status-success',
  [AttendanceStatus.HALF_DAY]: 'status-warning',
  [AttendanceStatus.ABSENT]: 'status-error',
  [AttendanceStatus.LATE]: 'bg-orange-500/10 text-orange-500',
  [AttendanceStatus.ON_LEAVE]: 'bg-blue-500/10 text-blue-500',
};

export default function Workforce() {
  const { t } = useLanguage();
  const { employees, updateEmployeeAttendance } = useERP();
  const { hasPermission } = useRole();
  const { toast } = useToast();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const totalEmployees = employees.length;
  const presentToday = employees.filter(e => e.attendance === AttendanceStatus.PRESENT || e.attendance === AttendanceStatus.LATE).length;
  const onLeave = employees.filter(e => e.attendance === AttendanceStatus.ABSENT || e.attendance === AttendanceStatus.ON_LEAVE).length;

  // Export handler
  const handleExport = (format: ExportFormat) => {
    const exportData = employees.map(emp => ({
      employeeId: emp.employeeId,
      name: emp.name,
      role: t(emp.role as any),
      department: t(emp.department as any),
      shift: t(emp.shift as any),
      attendance: t(emp.attendance as any),
    }));

    const columns = [
      { key: 'employeeId', label: t('employeeId') },
      { key: 'name', label: t('employeeName') },
      { key: 'role', label: t('role') },
      { key: 'department', label: t('department') },
      { key: 'shift', label: t('shift') },
      { key: 'attendance', label: t('attendance') },
    ];

    const filename = `attendance_report_${new Date().toISOString().split('T')[0]}`;

    if (format === 'csv') {
      exportToCSV(exportData, columns, filename);
    } else {
      exportToExcel(exportData, columns, filename);
    }

    toast({
      title: t('exportSuccess' as any),
      description: t('attendanceReport' as any),
    });
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('workforce')}</h1>
          <p className="text-muted-foreground mt-1">{t('companyName')}</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton onExport={handleExport} />
          {hasPermission('workforceAddEmployee') && (
            <Button onClick={() => setIsAddModalOpen(true)} className="rounded-xl shadow-lg shadow-primary/20">
              <Plus className="h-4 w-4 mr-2" />
              {t('addEmployee')}
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-card p-5 flex items-center gap-4 card-hover">
          <div className="icon-container h-14 w-14 rounded-2xl bg-primary/10 text-primary">
            <Users className="h-7 w-7" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">{t('totalEmployees')}</p>
            <p className="text-3xl font-bold">{totalEmployees}</p>
          </div>
        </div>

        <div className="glass-card p-5 flex items-center gap-4 card-hover">
          <div className="icon-container h-14 w-14 rounded-2xl bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]">
            <UserCheck className="h-7 w-7" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">{t('presentToday')}</p>
            <p className="text-3xl font-bold">{presentToday}</p>
          </div>
        </div>

        <div className="glass-card p-5 flex items-center gap-4 card-hover">
          <div className="icon-container h-14 w-14 rounded-2xl bg-destructive/10 text-destructive">
            <UserX className="h-7 w-7" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">{t('onLeaveToday')}</p>
            <p className="text-3xl font-bold">{onLeave}</p>
          </div>
        </div>
      </div>

      {/* Tabs for Employee Management and Attendance Tracker */}
      <Tabs defaultValue="employees" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="employees">{t('employeeManagement')}</TabsTrigger>
          <TabsTrigger value="attendance">{t('attendanceTracker')}</TabsTrigger>
        </TabsList>

        <TabsContent value="employees">
          <div className="glass-card p-6">
            <h3 className="text-xl font-semibold mb-5">{t('employeeManagement')}</h3>
            <div className="overflow-hidden rounded-xl border border-border/50">
              <Table className="premium-table">
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="font-semibold">{t('employeeId')}</TableHead>
                    <TableHead className="font-semibold">{t('employeeName')}</TableHead>
                    <TableHead className="font-semibold">{t('role')}</TableHead>
                    <TableHead className="font-semibold">{t('department')}</TableHead>
                    <TableHead className="font-semibold">{t('shift')}</TableHead>
                    <TableHead className="font-semibold">{t('attendance')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee, index) => (
                    <TableRow 
                      key={employee.id}
                      className="group animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <TableCell className="font-mono font-semibold text-primary">{employee.employeeId}</TableCell>
                      <TableCell className="font-medium">{employee.name}</TableCell>
                      <TableCell>{t(employee.role as any)}</TableCell>
                      <TableCell>{t(employee.department as any)}</TableCell>
                      <TableCell>{t(employee.shift as any)}</TableCell>
                      <TableCell>
                        <Select
                          value={employee.attendance}
                          onValueChange={(value) => updateEmployeeAttendance(employee.id, value as AttendanceStatus)}
                        >
                          <SelectTrigger className="w-[130px] h-8 rounded-full border-0 bg-transparent p-0 hover:bg-transparent focus:ring-0">
                            <span className={cn('status-pill w-full justify-center', attendanceStyles[employee.attendance])}>
                              <span className="h-1.5 w-1.5 rounded-full bg-current" />
                              {t(employee.attendance as any)}
                            </span>
                          </SelectTrigger>
                          <SelectContent className="glass-card border-border/50 min-w-[150px]">
                            {Object.values(AttendanceStatus).map(status => (
                              <SelectItem key={status} value={status}>
                                <span className="flex items-center gap-2">
                                  <span className={cn('h-2 w-2 rounded-full', 
                                    status === AttendanceStatus.PRESENT ? 'bg-[hsl(var(--success))]' :
                                    status === AttendanceStatus.HALF_DAY ? 'bg-[hsl(var(--warning))]' :
                                    status === AttendanceStatus.LATE ? 'bg-orange-500' :
                                    status === AttendanceStatus.ON_LEAVE ? 'bg-blue-500' :
                                    'bg-destructive'
                                  )} />
                                  {t(status as any)}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="attendance">
          <AttendanceTracker />
        </TabsContent>
      </Tabs>

      <AddEmployeeModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
    </div>
  );
}
