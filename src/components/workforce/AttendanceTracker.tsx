import { useState, useMemo } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, addDays, subDays, addWeeks, subWeeks, addMonths, subMonths, eachDayOfInterval, isSameMonth, isToday, getQuarter, setMonth, getMonth } from 'date-fns';
import { Calendar, ChevronLeft, ChevronRight, Clock, UserCheck, UserX, AlertCircle, Coffee } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useERP } from '@/contexts/ERPContext';
import { AttendanceStatus, AttendanceViewMode } from '@/types/erp';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const attendanceStyles: Record<AttendanceStatus, { bg: string; text: string; icon: typeof UserCheck }> = {
  [AttendanceStatus.PRESENT]: { bg: 'bg-[hsl(var(--success))]/10', text: 'text-[hsl(var(--success))]', icon: UserCheck },
  [AttendanceStatus.HALF_DAY]: { bg: 'bg-[hsl(var(--warning))]/10', text: 'text-[hsl(var(--warning))]', icon: Coffee },
  [AttendanceStatus.ABSENT]: { bg: 'bg-destructive/10', text: 'text-destructive', icon: UserX },
  [AttendanceStatus.LATE]: { bg: 'bg-orange-500/10', text: 'text-orange-500', icon: Clock },
  [AttendanceStatus.ON_LEAVE]: { bg: 'bg-blue-500/10', text: 'text-blue-500', icon: AlertCircle },
};

const monthKeys = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'] as const;

export function AttendanceTracker() {
  const { t } = useLanguage();
  const { employees, attendanceRecords, addAttendanceRecord, getAttendanceStats } = useERP();
  
  const [viewMode, setViewMode] = useState<AttendanceViewMode>(AttendanceViewMode.DAY);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [markDialogOpen, setMarkDialogOpen] = useState(false);
  const [markingEmployee, setMarkingEmployee] = useState<string | null>(null);
  const [markingDate, setMarkingDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [markingStatus, setMarkingStatus] = useState<AttendanceStatus>(AttendanceStatus.PRESENT);
  const [markingCheckIn, setMarkingCheckIn] = useState('09:00');
  const [markingCheckOut, setMarkingCheckOut] = useState('18:00');
  const [markingNotes, setMarkingNotes] = useState('');
  const [markingOvertime, setMarkingOvertime] = useState(0);

  const getDateRange = useMemo(() => {
    switch (viewMode) {
      case AttendanceViewMode.DAY:
        return { start: currentDate, end: currentDate };
      case AttendanceViewMode.WEEK:
        return { start: startOfWeek(currentDate, { weekStartsOn: 1 }), end: endOfWeek(currentDate, { weekStartsOn: 1 }) };
      case AttendanceViewMode.MONTH:
        return { start: startOfMonth(currentDate), end: endOfMonth(currentDate) };
      case AttendanceViewMode.QUARTER: {
        const q = getQuarter(currentDate);
        const startMonth = (q - 1) * 3;
        const quarterStart = setMonth(startOfYear(currentDate), startMonth);
        const quarterEnd = endOfMonth(setMonth(quarterStart, startMonth + 2));
        return { start: quarterStart, end: quarterEnd };
      }
      case AttendanceViewMode.ANNUAL:
        return { start: startOfYear(currentDate), end: endOfYear(currentDate) };
      default:
        return { start: currentDate, end: currentDate };
    }
  }, [viewMode, currentDate]);

  const navigate = (direction: 'prev' | 'next') => {
    const modifier = direction === 'prev' ? -1 : 1;
    switch (viewMode) {
      case AttendanceViewMode.DAY:
        setCurrentDate(d => direction === 'prev' ? subDays(d, 1) : addDays(d, 1));
        break;
      case AttendanceViewMode.WEEK:
        setCurrentDate(d => direction === 'prev' ? subWeeks(d, 1) : addWeeks(d, 1));
        break;
      case AttendanceViewMode.MONTH:
      case AttendanceViewMode.QUARTER:
        setCurrentDate(d => direction === 'prev' ? subMonths(d, viewMode === AttendanceViewMode.QUARTER ? 3 : 1) : addMonths(d, viewMode === AttendanceViewMode.QUARTER ? 3 : 1));
        break;
      case AttendanceViewMode.ANNUAL:
        setCurrentDate(d => new Date(d.getFullYear() + modifier, 0, 1));
        break;
    }
  };

  const filteredRecords = useMemo(() => {
    const startStr = format(getDateRange.start, 'yyyy-MM-dd');
    const endStr = format(getDateRange.end, 'yyyy-MM-dd');
    
    return attendanceRecords.filter(r => {
      if (r.date < startStr || r.date > endStr) return false;
      if (selectedEmployee !== 'all' && r.employeeId !== selectedEmployee) return false;
      return true;
    });
  }, [attendanceRecords, getDateRange, selectedEmployee]);

  const summaryStats = useMemo(() => {
    const startStr = format(getDateRange.start, 'yyyy-MM-dd');
    const endStr = format(getDateRange.end, 'yyyy-MM-dd');
    
    if (selectedEmployee !== 'all') {
      return getAttendanceStats(selectedEmployee, startStr, endStr);
    }
    
    // Aggregate stats for all employees
    const stats = { total: 0, present: 0, absent: 0, halfDay: 0, late: 0, onLeave: 0, totalOvertimeHours: 0 };
    employees.forEach(emp => {
      const empStats = getAttendanceStats(emp.id, startStr, endStr);
      stats.total += empStats.total;
      stats.present += empStats.present;
      stats.absent += empStats.absent;
      stats.halfDay += empStats.halfDay;
      stats.late += empStats.late;
      stats.onLeave += empStats.onLeave;
      stats.totalOvertimeHours += empStats.totalOvertimeHours;
    });
    return stats;
  }, [getDateRange, selectedEmployee, employees, getAttendanceStats]);

  const openMarkDialog = (employeeId: string, date: string) => {
    setMarkingEmployee(employeeId);
    setMarkingDate(date);
    const existingRecord = attendanceRecords.find(r => r.employeeId === employeeId && r.date === date);
    if (existingRecord) {
      setMarkingStatus(existingRecord.status);
      setMarkingCheckIn(existingRecord.checkInTime || '09:00');
      setMarkingCheckOut(existingRecord.checkOutTime || '18:00');
      setMarkingNotes(existingRecord.notes || '');
      setMarkingOvertime(existingRecord.overtimeHours || 0);
    } else {
      setMarkingStatus(AttendanceStatus.PRESENT);
      setMarkingCheckIn('09:00');
      setMarkingCheckOut('18:00');
      setMarkingNotes('');
      setMarkingOvertime(0);
    }
    setMarkDialogOpen(true);
  };

  const handleMarkAttendance = () => {
    if (!markingEmployee) return;
    addAttendanceRecord({
      employeeId: markingEmployee,
      date: markingDate,
      status: markingStatus,
      checkInTime: markingStatus === AttendanceStatus.ABSENT || markingStatus === AttendanceStatus.ON_LEAVE ? undefined : markingCheckIn,
      checkOutTime: markingStatus === AttendanceStatus.ABSENT || markingStatus === AttendanceStatus.ON_LEAVE ? undefined : markingCheckOut,
      notes: markingNotes || undefined,
      overtimeHours: markingOvertime > 0 ? markingOvertime : undefined,
    });
    setMarkDialogOpen(false);
  };

  const getQuarterLabel = () => {
    const q = getQuarter(currentDate);
    return t(`q${q}` as any);
  };

  const renderDayView = () => {
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const dayRecords = filteredRecords.filter(r => r.date === dateStr);
    
    const displayEmployees = selectedEmployee === 'all' 
      ? employees 
      : employees.filter(e => e.id === selectedEmployee);

    return (
      <div className="space-y-3">
        {displayEmployees.map(emp => {
          const record = dayRecords.find(r => r.employeeId === emp.id);
          const style = record ? attendanceStyles[record.status] : null;
          const StatusIcon = style?.icon || UserX;

          return (
            <div 
              key={emp.id} 
              className="glass-card p-4 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => openMarkDialog(emp.id, dateStr)}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  'h-10 w-10 rounded-full flex items-center justify-center',
                  style?.bg || 'bg-muted'
                )}>
                  <StatusIcon className={cn('h-5 w-5', style?.text || 'text-muted-foreground')} />
                </div>
                <div>
                  <p className="font-medium">{emp.name}</p>
                  <p className="text-sm text-muted-foreground">{emp.employeeId}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {record && (
                  <>
                    {record.checkInTime && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">{t('checkIn')}:</span>{' '}
                        <span className="font-medium">{record.checkInTime}</span>
                      </div>
                    )}
                    {record.checkOutTime && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">{t('checkOut')}:</span>{' '}
                        <span className="font-medium">{record.checkOutTime}</span>
                      </div>
                    )}
                  </>
                )}
                <Badge className={cn('rounded-full', style?.bg, style?.text)} variant="secondary">
                  {record ? t(record.status as any) : t('noRecords')}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderCalendarView = () => {
    const days = eachDayOfInterval({ start: getDateRange.start, end: getDateRange.end });
    const displayEmployees = selectedEmployee === 'all' 
      ? employees 
      : employees.filter(e => e.id === selectedEmployee);

    if (viewMode === AttendanceViewMode.MONTH) {
      // Calendar grid for month view
      const startDay = startOfMonth(currentDate);
      const endDay = endOfMonth(currentDate);
      const calendarDays = eachDayOfInterval({ start: startOfWeek(startDay, { weekStartsOn: 1 }), end: endOfWeek(endDay, { weekStartsOn: 1 }) });

      return (
        <div className="space-y-4">
          {displayEmployees.map(emp => (
            <div key={emp.id} className="glass-card p-4">
              <h4 className="font-semibold mb-3">{emp.name} ({emp.employeeId})</h4>
              <div className="grid grid-cols-7 gap-1">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                  <div key={d} className="text-center text-xs font-medium text-muted-foreground p-2">{d}</div>
                ))}
                {calendarDays.map(day => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const record = attendanceRecords.find(r => r.employeeId === emp.id && r.date === dateStr);
                  const style = record ? attendanceStyles[record.status] : null;
                  const isCurrentMonth = isSameMonth(day, currentDate);

                  return (
                    <div
                      key={dateStr}
                      onClick={() => isCurrentMonth && openMarkDialog(emp.id, dateStr)}
                      className={cn(
                        'aspect-square p-1 text-center text-sm rounded-lg cursor-pointer transition-colors',
                        !isCurrentMonth && 'opacity-30',
                        isCurrentMonth && 'hover:bg-muted/50',
                        isToday(day) && 'ring-2 ring-primary',
                        style?.bg
                      )}
                    >
                      <span className={cn('block', style?.text)}>{format(day, 'd')}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      );
    }

    // List view for week/quarter/annual
    return (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left p-3 font-semibold">{t('employeeName')}</th>
              {viewMode === AttendanceViewMode.ANNUAL ? (
                monthKeys.map(month => (
                  <th key={month} className="text-center p-2 text-sm font-medium">{t(month as any).slice(0, 3)}</th>
                ))
              ) : (
                days.slice(0, viewMode === AttendanceViewMode.QUARTER ? 92 : 7).map(day => (
                  <th key={day.toISOString()} className="text-center p-2 text-sm font-medium">
                    {format(day, viewMode === AttendanceViewMode.WEEK ? 'EEE d' : 'd')}
                  </th>
                ))
              )}
            </tr>
          </thead>
          <tbody>
            {displayEmployees.map(emp => (
              <tr key={emp.id} className="border-b border-border/30 hover:bg-muted/20">
                <td className="p-3">
                  <p className="font-medium">{emp.name}</p>
                  <p className="text-xs text-muted-foreground">{emp.employeeId}</p>
                </td>
                {viewMode === AttendanceViewMode.ANNUAL ? (
                  monthKeys.map((_, monthIndex) => {
                    const monthStart = format(setMonth(startOfYear(currentDate), monthIndex), 'yyyy-MM-dd');
                    const monthEnd = format(endOfMonth(setMonth(startOfYear(currentDate), monthIndex)), 'yyyy-MM-dd');
                    const stats = getAttendanceStats(emp.id, monthStart, monthEnd);
                    const percentage = stats.total > 0 ? Math.round((stats.present + stats.late + stats.halfDay * 0.5) / stats.total * 100) : 0;

                    return (
                      <td key={monthIndex} className="text-center p-2">
                        <span className={cn(
                          'inline-block px-2 py-1 rounded text-xs font-medium',
                          percentage >= 90 ? 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]' :
                          percentage >= 75 ? 'bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]' :
                          'bg-destructive/10 text-destructive'
                        )}>
                          {percentage}%
                        </span>
                      </td>
                    );
                  })
                ) : (
                  days.slice(0, viewMode === AttendanceViewMode.QUARTER ? 92 : 7).map(day => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const record = attendanceRecords.find(r => r.employeeId === emp.id && r.date === dateStr);
                    const style = record ? attendanceStyles[record.status] : null;

                    return (
                      <td 
                        key={dateStr} 
                        className="text-center p-1"
                        onClick={() => openMarkDialog(emp.id, dateStr)}
                      >
                        <div className={cn(
                          'w-8 h-8 mx-auto rounded-full flex items-center justify-center cursor-pointer transition-colors hover:ring-2 hover:ring-primary/50',
                          style?.bg || 'bg-muted/30',
                          isToday(day) && 'ring-2 ring-primary'
                        )}>
                          <span className={cn('text-xs font-medium', style?.text || 'text-muted-foreground')}>
                            {record ? record.status.charAt(0).toUpperCase() : '-'}
                          </span>
                        </div>
                      </td>
                    );
                  })
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-lg font-semibold min-w-[200px] text-center">
            {viewMode === AttendanceViewMode.DAY && format(currentDate, 'EEEE, MMMM d, yyyy')}
            {viewMode === AttendanceViewMode.WEEK && `${format(getDateRange.start, 'MMM d')} - ${format(getDateRange.end, 'MMM d, yyyy')}`}
            {viewMode === AttendanceViewMode.MONTH && format(currentDate, 'MMMM yyyy')}
            {viewMode === AttendanceViewMode.QUARTER && `${getQuarterLabel()} ${format(currentDate, 'yyyy')}`}
            {viewMode === AttendanceViewMode.ANNUAL && format(currentDate, 'yyyy')}
          </div>
          <Button variant="outline" size="icon" onClick={() => navigate('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
            {t('today')}
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('selectEmployee')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('totalEmployees')}</SelectItem>
              {employees.map(emp => (
                <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* View Mode Tabs */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as AttendanceViewMode)}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value={AttendanceViewMode.DAY}>{t('dayView')}</TabsTrigger>
          <TabsTrigger value={AttendanceViewMode.WEEK}>{t('weekView')}</TabsTrigger>
          <TabsTrigger value={AttendanceViewMode.MONTH}>{t('monthView')}</TabsTrigger>
          <TabsTrigger value={AttendanceViewMode.QUARTER}>{t('quarterView')}</TabsTrigger>
          <TabsTrigger value={AttendanceViewMode.ANNUAL}>{t('annualView')}</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-[hsl(var(--success))]">{summaryStats.present}</p>
          <p className="text-xs text-muted-foreground">{t('presentDays')}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-destructive">{summaryStats.absent}</p>
          <p className="text-xs text-muted-foreground">{t('absentDays')}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-[hsl(var(--warning))]">{summaryStats.halfDay}</p>
          <p className="text-xs text-muted-foreground">{t('halfDays')}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-orange-500">{summaryStats.late}</p>
          <p className="text-xs text-muted-foreground">{t('lateDays')}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-blue-500">{summaryStats.onLeave}</p>
          <p className="text-xs text-muted-foreground">{t('leaveDays')}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-primary">{summaryStats.totalOvertimeHours}</p>
          <p className="text-xs text-muted-foreground">{t('overtimeHours')}</p>
        </Card>
      </div>

      {/* Attendance Data */}
      <div className="glass-card p-4">
        {viewMode === AttendanceViewMode.DAY ? renderDayView() : renderCalendarView()}
      </div>

      {/* Mark Attendance Dialog */}
      <Dialog open={markDialogOpen} onOpenChange={setMarkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('markAttendance')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t('employeeName')}</Label>
              <Input value={employees.find(e => e.id === markingEmployee)?.name || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>{t('date')}</Label>
              <Input type="date" value={markingDate} onChange={(e) => setMarkingDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t('status')}</Label>
              <Select value={markingStatus} onValueChange={(v) => setMarkingStatus(v as AttendanceStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(AttendanceStatus).map(status => (
                    <SelectItem key={status} value={status}>
                      <span className="flex items-center gap-2">
                        <span className={cn('h-2 w-2 rounded-full', attendanceStyles[status].bg.replace('/10', ''))} />
                        {t(status as any)}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {markingStatus !== AttendanceStatus.ABSENT && markingStatus !== AttendanceStatus.ON_LEAVE && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('checkInTime')}</Label>
                    <Input type="time" value={markingCheckIn} onChange={(e) => setMarkingCheckIn(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('checkOutTime')}</Label>
                    <Input type="time" value={markingCheckOut} onChange={(e) => setMarkingCheckOut(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t('overtimeHours')}</Label>
                  <Input 
                    type="number" 
                    min="0" 
                    max="8" 
                    value={markingOvertime} 
                    onChange={(e) => setMarkingOvertime(parseInt(e.target.value) || 0)} 
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label>{t('notes')}</Label>
              <Textarea 
                value={markingNotes} 
                onChange={(e) => setMarkingNotes(e.target.value)} 
                placeholder={t('notes')}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMarkDialogOpen(false)}>{t('cancel')}</Button>
            <Button onClick={handleMarkAttendance}>{t('save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
