import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useERP } from '@/contexts/ERPContext';
import { AttendanceStatus, Department, EmployeeRole, Shift } from '@/types/erp';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AddEmployeeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddEmployeeModal({ open, onOpenChange }: AddEmployeeModalProps) {
  const { t } = useLanguage();
  const { addEmployee } = useERP();
  
  const [formData, setFormData] = useState({
    name: '',
    employeeId: '',
    role: EmployeeRole.OPERATOR,
    department: Department.PRODUCTION,
    shift: Shift.MORNING,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addEmployee({
      ...formData,
      attendance: AttendanceStatus.PRESENT,
    });

    setFormData({
      name: '',
      employeeId: '',
      role: EmployeeRole.OPERATOR,
      department: Department.PRODUCTION,
      shift: Shift.MORNING,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] glass-card border-border/50 animate-scale-in">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{t('addEmployee')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">{t('employeeName')}</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="rounded-xl bg-background/50 border-border/50 focus:bg-background transition-smooth"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="employeeId" className="text-sm font-medium">{t('employeeId')}</Label>
            <Input
              id="employeeId"
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              placeholder="EMP###"
              className="rounded-xl bg-background/50 border-border/50 focus:bg-background transition-smooth"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm font-medium">{t('role')}</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData({ ...formData, role: value as EmployeeRole })}
            >
              <SelectTrigger className="rounded-xl bg-background/50 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-card border-border/50">
                <SelectItem value={EmployeeRole.SUPERVISOR}>{t('supervisor')}</SelectItem>
                <SelectItem value={EmployeeRole.OPERATOR}>{t('operatorRole')}</SelectItem>
                <SelectItem value={EmployeeRole.TECHNICIAN}>{t('technician')}</SelectItem>
                <SelectItem value={EmployeeRole.HELPER}>{t('helper')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department" className="text-sm font-medium">{t('department')}</Label>
            <Select
              value={formData.department}
              onValueChange={(value) => setFormData({ ...formData, department: value as Department })}
            >
              <SelectTrigger className="rounded-xl bg-background/50 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-card border-border/50">
                <SelectItem value={Department.PRODUCTION}>{t('productionDept')}</SelectItem>
                <SelectItem value={Department.PACKAGING}>{t('packagingDept')}</SelectItem>
                <SelectItem value={Department.MAINTENANCE}>{t('maintenanceDept')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shift" className="text-sm font-medium">{t('shift')}</Label>
            <Select
              value={formData.shift}
              onValueChange={(value) => setFormData({ ...formData, shift: value as Shift })}
            >
              <SelectTrigger className="rounded-xl bg-background/50 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-card border-border/50">
                <SelectItem value={Shift.MORNING}>{t('morningShift')}</SelectItem>
                <SelectItem value={Shift.EVENING}>{t('eveningShift')}</SelectItem>
                <SelectItem value={Shift.NIGHT}>{t('nightShift')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="rounded-xl"
            >
              {t('cancel')}
            </Button>
            <Button type="submit" className="rounded-xl shadow-lg shadow-primary/20">
              {t('save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
