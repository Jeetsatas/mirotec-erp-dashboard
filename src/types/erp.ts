// Enums for normalized data

export enum MachineStatus {
  RUNNING = 'running',
  STOPPED = 'stopped',
  MAINTENANCE = 'maintenance',
}

export enum MachineType {
  WIRE_DRAWING = 'wireDrawing',
  FLATTENING = 'flattening',
  WINDING = 'winding',
  ELECTROPLATING = 'electroplating',
}

export enum StockStatus {
  IN_STOCK = 'inStock',
  LOW_STOCK = 'lowStockStatus',
  OUT_OF_STOCK = 'outOfStock',
}

export enum InventoryCategory {
  RAW_MATERIAL = 'rawMaterials',
  FINISHED_GOODS = 'finishedGoods',
}

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
}

export enum AttendanceStatus {
  PRESENT = 'present',
  HALF_DAY = 'halfDay',
  ABSENT = 'absent',
  LATE = 'late',
  ON_LEAVE = 'onLeave',
}

export enum AttendanceViewMode {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  ANNUAL = 'annual',
}

export enum Department {
  PRODUCTION = 'productionDept',
  PACKAGING = 'packagingDept',
  MAINTENANCE = 'maintenanceDept',
}

export enum Shift {
  MORNING = 'morningShift',
  EVENING = 'eveningShift',
  NIGHT = 'nightShift',
}

export enum EmployeeRole {
  SUPERVISOR = 'supervisor',
  OPERATOR = 'operatorRole',
  TECHNICIAN = 'technician',
  HELPER = 'helper',
}

export enum TransactionType {
  DEBIT = 'debit',
  CREDIT = 'credit',
}

export enum TransactionSource {
  MANUAL = 'manual',
  INVOICE = 'invoice',
  GST_CHALLAN = 'gstChallan',
}

export enum TransactionCategory {
  SALES = 'sales',
  PURCHASE = 'purchase',
  SALARY = 'salary',
  GST = 'gst',
  MAINTENANCE = 'maintenanceCategory',
  OTHER = 'other',
}

export enum FinanceViewMode {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
}

export enum PaymentStatus {
  PAID = 'paid',
  PENDING = 'pending',
  OVERDUE = 'overdue',
}

export enum InvoiceStatus {
  DRAFT = 'draft',
  ISSUED = 'issued',
  PAID = 'paid',
  CANCELLED = 'cancelled',
}

export enum GSTType {
  CGST_SGST = 'cgstSgst',
  IGST = 'igst',
}

export enum ChallanStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FILED = 'filed',
}

export enum PaymentMode {
  CASH = 'cash',
  NET_BANKING = 'netBanking',
  UPI = 'upi',
}

// Interfaces

export interface Machine {
  id: string;
  name: string;
  type: MachineType;
  status: MachineStatus;
  efficiency: number;
  temperature: number;
  operatorId: string | null;
}

export interface InventoryItem {
  id: string;
  nameKey: string;
  category: InventoryCategory;
  quantity: number;
  unit: string;
  estimatedValue: number;
  stockStatus: StockStatus;
  minStock: number;
}

export interface Order {
  id: string;
  clientId?: string;
  clientName: string;
  productKey: string;
  quantity: number;
  amount: number;
  date: string;
  status: OrderStatus;
}

export interface Employee {
  id: string;
  name: string;
  employeeId: string;
  role: EmployeeRole;
  department: Department;
  shift: Shift;
  attendance: AttendanceStatus;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  checkInTime?: string; // HH:mm
  checkOutTime?: string; // HH:mm
  notes?: string;
  overtimeHours?: number;
}

export interface Transaction {
  id: string;
  description: string;
  descriptionKey?: string;
  type: TransactionType;
  amount: number;
  status: PaymentStatus;
  date: string;
  source: TransactionSource;
  category?: TransactionCategory;
  referenceId?: string;
  referenceNumber?: string;
}

export interface InvoiceLineItem {
  id: string;
  productKey: string;
  hsnCode: string;
  quantity: number;
  rate: number;
  taxableValue: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  orderId: string;
  clientId?: string;
  clientName: string;
  clientAddress: string;
  clientGSTIN: string;
  clientState: string;
  companyState: string;
  lineItems: InvoiceLineItem[];
  gstType: GSTType;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  subtotal: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalTax: number;
  grandTotal: number;
  status: InvoiceStatus;
}

export interface GSTChallan {
  id: string;
  challanNumber: string;
  taxPeriod: string;
  gstin: string;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  interestAmount: number;
  penaltyAmount: number;
  totalPayable: number;
  paymentMode: PaymentMode;
  status: ChallanStatus;
  createdDate: string;
}

export interface ProductionData {
  day: string;
  output: number;
}

export interface Alert {
  id: string;
  type: 'lowStock' | 'maintenance' | 'orders';
  messageKey: string;
  severity: 'warning' | 'error' | 'info';
}
