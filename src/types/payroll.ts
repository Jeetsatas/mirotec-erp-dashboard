// Payroll Types

export interface SalaryConfig {
  id: string;
  employeeId: string;
  baseMonthlySalary: number;
  perDaySalary: number; // Derived: baseMonthlySalary / 26 (working days)
  overtimeRate: number; // Per hour
  allowances: number; // Fixed monthly allowances
  pfDeduction: number; // % of basic
  esiDeduction: number; // % of gross
  otherDeductions: number; // Fixed deductions
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  month: string; // YYYY-MM format
  
  // Attendance breakdown
  workingDays: number;
  presentDays: number;
  halfDays: number;
  absentDays: number;
  lateDays: number;
  leaveDays: number;
  overtimeHours: number;
  
  // Salary breakdown
  basicSalary: number;
  overtimePay: number;
  allowances: number;
  grossSalary: number;
  
  // Deductions
  pfDeduction: number;
  esiDeduction: number;
  otherDeductions: number;
  totalDeductions: number;
  
  // Final
  netSalary: number;
  
  // Status
  status: PayrollStatus;
  processedDate?: string;
}

export enum PayrollStatus {
  DRAFT = 'draft',
  PROCESSED = 'processed',
  PAID = 'paid',
}

export interface MonthlyPayrollSummary {
  month: string;
  totalEmployees: number;
  totalGrossSalary: number;
  totalDeductions: number;
  totalNetSalary: number;
  status: PayrollStatus;
}
