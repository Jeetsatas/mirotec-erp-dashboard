import { useState, useCallback, useMemo } from 'react';
import { SalaryConfig, PayrollRecord, PayrollStatus } from '@/types/payroll';
import { Employee, AttendanceStatus, AttendanceRecord, Transaction, TransactionType, TransactionSource, TransactionCategory, PaymentStatus } from '@/types/erp';

// Default salary configs based on role
const getRoleBaseSalary = (role: string): number => {
  switch (role) {
    case 'supervisor': return 35000;
    case 'operatorRole': return 22000;
    case 'technician': return 28000;
    case 'helper': return 15000;
    default: return 18000;
  }
};

// Generate initial salary configs for employees
const generateInitialSalaryConfigs = (employees: Employee[]): SalaryConfig[] => {
  return employees.map(emp => {
    const baseSalary = getRoleBaseSalary(emp.role);
    return {
      id: `sal-${emp.id}`,
      employeeId: emp.id,
      baseMonthlySalary: baseSalary,
      perDaySalary: Math.round(baseSalary / 26),
      overtimeRate: Math.round(baseSalary / 26 / 8 * 1.5), // 1.5x hourly rate
      allowances: Math.round(baseSalary * 0.1), // 10% allowances
      pfDeduction: 12, // 12% PF
      esiDeduction: 0.75, // 0.75% ESI
      otherDeductions: 0,
    };
  });
};

export function usePayrollState(
  employees: Employee[],
  attendanceRecords: AttendanceRecord[],
  addTransaction: (transaction: {
    type: TransactionType;
    amount: number;
    date: string;
    category: TransactionCategory;
    description: string;
    status: PaymentStatus;
  }) => Transaction
) {
  const [salaryConfigs, setSalaryConfigs] = useState<SalaryConfig[]>(() => 
    generateInitialSalaryConfigs(employees)
  );
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [processedMonths, setProcessedMonths] = useState<string[]>([]);

  // Get salary config for an employee
  const getSalaryConfig = useCallback((employeeId: string): SalaryConfig | undefined => {
    return salaryConfigs.find(sc => sc.employeeId === employeeId);
  }, [salaryConfigs]);

  // Update salary config
  const updateSalaryConfig = useCallback((employeeId: string, updates: Partial<Omit<SalaryConfig, 'id' | 'employeeId'>>) => {
    setSalaryConfigs(prev => prev.map(sc => {
      if (sc.employeeId === employeeId) {
        const newConfig = { ...sc, ...updates };
        // Auto-derive per-day salary if base salary changes
        if (updates.baseMonthlySalary !== undefined) {
          newConfig.perDaySalary = Math.round(updates.baseMonthlySalary / 26);
          newConfig.overtimeRate = Math.round(updates.baseMonthlySalary / 26 / 8 * 1.5);
        }
        return newConfig;
      }
      return sc;
    }));
  }, []);

  // Add salary config for new employee
  const addSalaryConfig = useCallback((employeeId: string, role: string) => {
    const baseSalary = getRoleBaseSalary(role);
    const newConfig: SalaryConfig = {
      id: `sal-${employeeId}`,
      employeeId,
      baseMonthlySalary: baseSalary,
      perDaySalary: Math.round(baseSalary / 26),
      overtimeRate: Math.round(baseSalary / 26 / 8 * 1.5),
      allowances: Math.round(baseSalary * 0.1),
      pfDeduction: 12,
      esiDeduction: 0.75,
      otherDeductions: 0,
    };
    setSalaryConfigs(prev => [...prev, newConfig]);
  }, []);

  // Calculate payroll for an employee for a month
  const calculateEmployeePayroll = useCallback((
    employeeId: string,
    month: string // YYYY-MM
  ): PayrollRecord | null => {
    const employee = employees.find(e => e.id === employeeId);
    const config = getSalaryConfig(employeeId);
    if (!employee || !config) return null;

    // Get attendance records for the month
    const monthRecords = attendanceRecords.filter(r => 
      r.employeeId === employeeId && r.date.startsWith(month)
    );

    // Calculate days
    const year = parseInt(month.split('-')[0]);
    const monthNum = parseInt(month.split('-')[1]);
    const daysInMonth = new Date(year, monthNum, 0).getDate();
    
    // Count Sundays (non-working)
    let sundays = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      if (new Date(year, monthNum - 1, d).getDay() === 0) sundays++;
    }
    const workingDays = daysInMonth - sundays;

    const presentDays = monthRecords.filter(r => 
      r.status === AttendanceStatus.PRESENT || r.status === AttendanceStatus.LATE
    ).length;
    const halfDays = monthRecords.filter(r => r.status === AttendanceStatus.HALF_DAY).length;
    const absentDays = monthRecords.filter(r => r.status === AttendanceStatus.ABSENT).length;
    const lateDays = monthRecords.filter(r => r.status === AttendanceStatus.LATE).length;
    const leaveDays = monthRecords.filter(r => r.status === AttendanceStatus.ON_LEAVE).length;
    const overtimeHours = monthRecords.reduce((sum, r) => sum + (r.overtimeHours || 0), 0);

    // Calculate salary
    const effectiveDays = presentDays + (halfDays * 0.5);
    const basicSalary = Math.round(config.perDaySalary * effectiveDays);
    const overtimePay = Math.round(config.overtimeRate * overtimeHours);
    const allowances = config.allowances;
    const grossSalary = basicSalary + overtimePay + allowances;

    // Calculate deductions
    const pfDeduction = Math.round(basicSalary * (config.pfDeduction / 100));
    const esiDeduction = Math.round(grossSalary * (config.esiDeduction / 100));
    const otherDeductions = config.otherDeductions;
    const totalDeductions = pfDeduction + esiDeduction + otherDeductions;

    const netSalary = grossSalary - totalDeductions;

    return {
      id: `pr-${employeeId}-${month}`,
      employeeId,
      month,
      workingDays,
      presentDays,
      halfDays,
      absentDays,
      lateDays,
      leaveDays,
      overtimeHours,
      basicSalary,
      overtimePay,
      allowances,
      grossSalary,
      pfDeduction,
      esiDeduction,
      otherDeductions,
      totalDeductions,
      netSalary,
      status: PayrollStatus.DRAFT,
    };
  }, [employees, attendanceRecords, getSalaryConfig]);

  // Generate payroll for all employees for a month
  const generateMonthlyPayroll = useCallback((month: string): PayrollRecord[] => {
    const records: PayrollRecord[] = [];
    employees.forEach(emp => {
      const record = calculateEmployeePayroll(emp.id, month);
      if (record) records.push(record);
    });
    return records;
  }, [employees, calculateEmployeePayroll]);

  // Process payroll (mark as processed and create finance entry)
  const processPayroll = useCallback((month: string): boolean => {
    if (processedMonths.includes(month)) return false;

    const records = generateMonthlyPayroll(month);
    const totalNetSalary = records.reduce((sum, r) => sum + r.netSalary, 0);

    // Update records with processed status
    const processedRecords = records.map(r => ({
      ...r,
      status: PayrollStatus.PROCESSED,
      processedDate: new Date().toISOString().split('T')[0],
    }));

    setPayrollRecords(prev => {
      // Remove existing records for this month and add new ones
      const filtered = prev.filter(r => !r.month.startsWith(month));
      return [...filtered, ...processedRecords];
    });

    // Create finance transaction
    const monthDate = new Date(month + '-15');
    const monthName = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    addTransaction({
      type: TransactionType.DEBIT,
      amount: totalNetSalary,
      date: new Date().toISOString().split('T')[0],
      category: TransactionCategory.SALARY,
      description: `Salary Payment - ${monthName}`,
      status: PaymentStatus.PAID,
    });

    setProcessedMonths(prev => [...prev, month]);
    return true;
  }, [processedMonths, generateMonthlyPayroll, addTransaction]);

  // Get payroll records for a month
  const getPayrollForMonth = useCallback((month: string): PayrollRecord[] => {
    // If already processed, return stored records
    const stored = payrollRecords.filter(r => r.month === month);
    if (stored.length > 0) return stored;
    
    // Otherwise generate draft records
    return generateMonthlyPayroll(month);
  }, [payrollRecords, generateMonthlyPayroll]);

  // Check if month is processed
  const isMonthProcessed = useCallback((month: string): boolean => {
    return processedMonths.includes(month);
  }, [processedMonths]);

  // Monthly summary
  const getMonthlyPayrollSummary = useCallback((month: string) => {
    const records = getPayrollForMonth(month);
    return {
      month,
      totalEmployees: records.length,
      totalGrossSalary: records.reduce((sum, r) => sum + r.grossSalary, 0),
      totalDeductions: records.reduce((sum, r) => sum + r.totalDeductions, 0),
      totalNetSalary: records.reduce((sum, r) => sum + r.netSalary, 0),
      status: isMonthProcessed(month) ? PayrollStatus.PROCESSED : PayrollStatus.DRAFT,
    };
  }, [getPayrollForMonth, isMonthProcessed]);

  return {
    salaryConfigs,
    payrollRecords,
    processedMonths,
    getSalaryConfig,
    updateSalaryConfig,
    addSalaryConfig,
    calculateEmployeePayroll,
    generateMonthlyPayroll,
    processPayroll,
    getPayrollForMonth,
    isMonthProcessed,
    getMonthlyPayrollSummary,
  };
}
