import { useState, useCallback, useMemo } from 'react';
import {
  Machine,
  MachineStatus,
  MachineType,
  InventoryItem,
  InventoryCategory,
  StockStatus,
  Order,
  OrderStatus,
  Employee,
  EmployeeRole,
  Department,
  Shift,
  AttendanceStatus,
  AttendanceRecord,
  Transaction,
  TransactionType,
  TransactionSource,
  TransactionCategory,
  PaymentStatus,
  ProductionData,
  Alert,
  Invoice,
  InvoiceStatus,
  GSTType,
  GSTChallan,
  ChallanStatus,
  PaymentMode,
} from '@/types/erp';
import { SalaryConfig, PayrollRecord, PayrollStatus } from '@/types/payroll';
import { Client, ClientFormData, ClientSummary } from '@/types/client';
import { getMachineConsumption, RawMaterialKey } from '@/config/productionConfig';

// Initial Data
const initialMachines: Machine[] = [
  { id: 'm1', name: 'WD-001', type: MachineType.WIRE_DRAWING, status: MachineStatus.RUNNING, efficiency: 87, temperature: 45, operatorId: 'e1' },
  { id: 'm2', name: 'WD-002', type: MachineType.WIRE_DRAWING, status: MachineStatus.RUNNING, efficiency: 92, temperature: 42, operatorId: 'e2' },
  { id: 'm3', name: 'FL-001', type: MachineType.FLATTENING, status: MachineStatus.MAINTENANCE, efficiency: 0, temperature: 28, operatorId: null },
  { id: 'm4', name: 'FL-002', type: MachineType.FLATTENING, status: MachineStatus.RUNNING, efficiency: 78, temperature: 52, operatorId: 'e3' },
  { id: 'm5', name: 'WN-001', type: MachineType.WINDING, status: MachineStatus.RUNNING, efficiency: 95, temperature: 35, operatorId: 'e4' },
  { id: 'm6', name: 'WN-002', type: MachineType.WINDING, status: MachineStatus.STOPPED, efficiency: 0, temperature: 25, operatorId: null },
  { id: 'm7', name: 'EP-001', type: MachineType.ELECTROPLATING, status: MachineStatus.RUNNING, efficiency: 83, temperature: 68, operatorId: 'e5' },
  { id: 'm8', name: 'EP-002', type: MachineType.ELECTROPLATING, status: MachineStatus.RUNNING, efficiency: 89, temperature: 65, operatorId: 'e6' },
];

const initialInventory: InventoryItem[] = [
  { id: 'i1', nameKey: 'silver', category: InventoryCategory.RAW_MATERIAL, quantity: 15, unit: 'kg', estimatedValue: 1125000, stockStatus: StockStatus.LOW_STOCK, minStock: 20 },
  { id: 'i2', nameKey: 'copper', category: InventoryCategory.RAW_MATERIAL, quantity: 85, unit: 'kg', estimatedValue: 68000, stockStatus: StockStatus.IN_STOCK, minStock: 50 },
  { id: 'i3', nameKey: 'polyesterYarn', category: InventoryCategory.RAW_MATERIAL, quantity: 200, unit: 'kg', estimatedValue: 40000, stockStatus: StockStatus.IN_STOCK, minStock: 100 },
  { id: 'i4', nameKey: 'realJari', category: InventoryCategory.FINISHED_GOODS, quantity: 45, unit: 'kg', estimatedValue: 675000, stockStatus: StockStatus.IN_STOCK, minStock: 30 },
  { id: 'i5', nameKey: 'imitationJari', category: InventoryCategory.FINISHED_GOODS, quantity: 120, unit: 'kg', estimatedValue: 360000, stockStatus: StockStatus.IN_STOCK, minStock: 50 },
];

const initialOrders: Order[] = [
  { id: 'ORD-2024-001', clientId: 'c1', clientName: 'Surat Silk House', productKey: 'realJari', quantity: 25, amount: 375000, date: '2024-12-15', status: OrderStatus.PROCESSING },
  { id: 'ORD-2024-002', clientId: 'c2', clientName: 'Mumbai Textiles', productKey: 'imitationJari', quantity: 50, amount: 150000, date: '2024-12-14', status: OrderStatus.PENDING },
  { id: 'ORD-2024-003', clientId: 'c3', clientName: 'Delhi Saree Emporium', productKey: 'realJari', quantity: 15, amount: 225000, date: '2024-12-13', status: OrderStatus.SHIPPED },
  { id: 'ORD-2024-004', clientId: 'c4', clientName: 'Jaipur Fabrics', productKey: 'imitationJari', quantity: 80, amount: 240000, date: '2024-12-12', status: OrderStatus.DELIVERED },
  { id: 'ORD-2024-005', clientId: 'c5', clientName: 'Varanasi Weavers', productKey: 'realJari', quantity: 30, amount: 450000, date: '2024-12-11', status: OrderStatus.PENDING },
];

// Initial Clients Data
const initialClients: Client[] = [
  {
    id: 'c1',
    clientName: 'Surat Silk House',
    companyName: 'Surat Silk House Pvt. Ltd.',
    gstin: '24AABCT1234E1ZQ',
    billingAddress: '123 Textile Market, Ring Road, Surat - 395002',
    shippingAddress: '123 Textile Market, Ring Road, Surat - 395002',
    contactPerson: 'Rajesh Patel',
    phone: '+91 98765 43210',
    email: 'rajesh@suratsilk.com',
    state: 'gujarat',
    creditLimit: 500000,
    createdDate: '2024-01-15',
    isActive: true,
  },
  {
    id: 'c2',
    clientName: 'Mumbai Textiles',
    companyName: 'Mumbai Textiles & Co.',
    gstin: '27AABCM5678F1ZR',
    billingAddress: '45 Crawford Market, Mumbai - 400001',
    shippingAddress: '45 Crawford Market, Mumbai - 400001',
    contactPerson: 'Vikram Shah',
    phone: '+91 98765 12345',
    email: 'vikram@mumbaitextiles.com',
    state: 'maharashtra',
    creditLimit: 750000,
    createdDate: '2024-02-20',
    isActive: true,
  },
  {
    id: 'c3',
    clientName: 'Delhi Saree Emporium',
    companyName: 'Delhi Saree Emporium',
    gstin: '07AABCD5678F1ZR',
    billingAddress: '45 Chandni Chowk, Old Delhi - 110006',
    shippingAddress: '45 Chandni Chowk, Old Delhi - 110006',
    contactPerson: 'Amit Kumar',
    phone: '+91 98765 67890',
    email: 'amit@delhisaree.com',
    state: 'delhi',
    creditLimit: 600000,
    createdDate: '2024-03-10',
    isActive: true,
  },
  {
    id: 'c4',
    clientName: 'Jaipur Fabrics',
    companyName: 'Jaipur Fabrics House',
    gstin: '08AABCJ9012G1ZS',
    billingAddress: '78 Johri Bazaar, Jaipur - 302003',
    shippingAddress: '78 Johri Bazaar, Jaipur - 302003',
    contactPerson: 'Sunil Sharma',
    phone: '+91 98765 11111',
    email: 'sunil@jaipurfabrics.com',
    state: 'rajasthan',
    creditLimit: 400000,
    createdDate: '2024-04-05',
    isActive: true,
  },
  {
    id: 'c5',
    clientName: 'Varanasi Weavers',
    companyName: 'Varanasi Weavers Cooperative',
    gstin: '09AABCV3456H1ZT',
    billingAddress: '12 Vishwanath Gali, Varanasi - 221001',
    shippingAddress: '12 Vishwanath Gali, Varanasi - 221001',
    contactPerson: 'Ravi Mishra',
    phone: '+91 98765 22222',
    email: 'ravi@varanasiweavers.com',
    state: 'uttarPradesh',
    creditLimit: 800000,
    createdDate: '2024-05-12',
    isActive: true,
  },
];

const initialEmployees: Employee[] = [
  { id: 'e1', name: 'Ramesh Patel', employeeId: 'EMP001', role: EmployeeRole.OPERATOR, department: Department.PRODUCTION, shift: Shift.MORNING, attendance: AttendanceStatus.PRESENT },
  { id: 'e2', name: 'Suresh Kumar', employeeId: 'EMP002', role: EmployeeRole.OPERATOR, department: Department.PRODUCTION, shift: Shift.MORNING, attendance: AttendanceStatus.PRESENT },
  { id: 'e3', name: 'Mohan Singh', employeeId: 'EMP003', role: EmployeeRole.TECHNICIAN, department: Department.PRODUCTION, shift: Shift.MORNING, attendance: AttendanceStatus.HALF_DAY },
  { id: 'e4', name: 'Priya Sharma', employeeId: 'EMP004', role: EmployeeRole.SUPERVISOR, department: Department.PRODUCTION, shift: Shift.MORNING, attendance: AttendanceStatus.PRESENT },
  { id: 'e5', name: 'Vijay Mehta', employeeId: 'EMP005', role: EmployeeRole.OPERATOR, department: Department.PRODUCTION, shift: Shift.EVENING, attendance: AttendanceStatus.PRESENT },
  { id: 'e6', name: 'Anil Verma', employeeId: 'EMP006', role: EmployeeRole.OPERATOR, department: Department.PRODUCTION, shift: Shift.EVENING, attendance: AttendanceStatus.ABSENT },
  { id: 'e7', name: 'Kavita Desai', employeeId: 'EMP007', role: EmployeeRole.HELPER, department: Department.PACKAGING, shift: Shift.MORNING, attendance: AttendanceStatus.PRESENT },
  { id: 'e8', name: 'Rajesh Joshi', employeeId: 'EMP008', role: EmployeeRole.TECHNICIAN, department: Department.MAINTENANCE, shift: Shift.MORNING, attendance: AttendanceStatus.PRESENT },
];

const initialTransactions: Transaction[] = [
  { id: 'TXN001', description: 'Silver Wire Purchase - Ahmedabad Metals', descriptionKey: 'txnSilverPurchase', type: TransactionType.DEBIT, amount: 500000, status: PaymentStatus.PAID, date: '2024-12-15', source: TransactionSource.MANUAL, category: TransactionCategory.PURCHASE },
  { id: 'TXN002', description: 'Order Payment - Surat Silk House', descriptionKey: 'txnOrderPayment', type: TransactionType.CREDIT, amount: 375000, status: PaymentStatus.PENDING, date: '2024-12-14', source: TransactionSource.MANUAL, category: TransactionCategory.SALES },
  { id: 'TXN003', description: 'Electricity Bill - December', descriptionKey: 'txnElectricityBill', type: TransactionType.DEBIT, amount: 85000, status: PaymentStatus.PAID, date: '2024-12-13', source: TransactionSource.MANUAL, category: TransactionCategory.MAINTENANCE },
  { id: 'TXN004', description: 'Order Payment - Delhi Saree Emporium', descriptionKey: 'txnOrderPayment', type: TransactionType.CREDIT, amount: 225000, status: PaymentStatus.PAID, date: '2024-12-12', source: TransactionSource.MANUAL, category: TransactionCategory.SALES },
  { id: 'TXN005', description: 'Machine Parts - Industrial Supplies', descriptionKey: 'txnMachineParts', type: TransactionType.DEBIT, amount: 45000, status: PaymentStatus.OVERDUE, date: '2024-12-10', source: TransactionSource.MANUAL, category: TransactionCategory.MAINTENANCE },
  // Invoice payment transaction (for already paid invoice inv2)
  { id: 'TXN-INV-inv2', description: 'Invoice Payment - Delhi Saree Emporium', descriptionKey: 'txnInvoicePayment', type: TransactionType.CREDIT, amount: 265500, status: PaymentStatus.PAID, date: '2024-12-13', source: TransactionSource.INVOICE, referenceId: 'inv2', referenceNumber: 'INV-2024-002', category: TransactionCategory.SALES },
  // GST Challan payment transaction (for already paid challan ch1)
  { id: 'TXN-GST-ch1', description: 'GST Payment - 2024-11', descriptionKey: 'txnGstPayment', type: TransactionType.DEBIT, amount: 122000, status: PaymentStatus.PAID, date: '2024-12-10', source: TransactionSource.GST_CHALLAN, referenceId: 'ch1', referenceNumber: 'GST-2024-11-001', category: TransactionCategory.GST },
];

const initialProductionData: ProductionData[] = [
  { day: 'Mon', output: 125 },
  { day: 'Tue', output: 142 },
  { day: 'Wed', output: 138 },
  { day: 'Thu', output: 156 },
  { day: 'Fri', output: 148 },
  { day: 'Sat', output: 132 },
  { day: 'Sun', output: 95 },
];

const initialAlerts: Alert[] = [
  { id: 'a1', type: 'lowStock', messageKey: 'silverStockLow', severity: 'warning' },
  { id: 'a2', type: 'maintenance', messageKey: 'flatteningMachineMaintenance', severity: 'error' },
  { id: 'a3', type: 'orders', messageKey: 'ordersAwaitingDispatch', severity: 'info' },
];

const initialInvoices: Invoice[] = [
  {
    id: 'inv1',
    invoiceNumber: 'INV-2024-001',
    invoiceDate: '2024-12-15',
    orderId: 'ORD-2024-001',
    clientName: 'Surat Silk House',
    clientAddress: '123 Textile Market, Ring Road, Surat - 395002',
    clientGSTIN: '24AABCT1234E1ZQ',
    clientState: 'gujarat',
    companyState: 'gujarat',
    lineItems: [
      { id: 'li1', productKey: 'realJari', hsnCode: '5605', quantity: 25, rate: 15000, taxableValue: 375000 }
    ],
    gstType: GSTType.CGST_SGST,
    cgstRate: 9,
    sgstRate: 9,
    igstRate: 0,
    subtotal: 375000,
    cgstAmount: 33750,
    sgstAmount: 33750,
    igstAmount: 0,
    totalTax: 67500,
    grandTotal: 442500,
    status: InvoiceStatus.ISSUED,
  },
  {
    id: 'inv2',
    invoiceNumber: 'INV-2024-002',
    invoiceDate: '2024-12-13',
    orderId: 'ORD-2024-003',
    clientName: 'Delhi Saree Emporium',
    clientAddress: '45 Chandni Chowk, Old Delhi - 110006',
    clientGSTIN: '07AABCD5678F1ZR',
    clientState: 'delhi',
    companyState: 'gujarat',
    lineItems: [
      { id: 'li2', productKey: 'realJari', hsnCode: '5605', quantity: 15, rate: 15000, taxableValue: 225000 }
    ],
    gstType: GSTType.IGST,
    cgstRate: 0,
    sgstRate: 0,
    igstRate: 18,
    subtotal: 225000,
    cgstAmount: 0,
    sgstAmount: 0,
    igstAmount: 40500,
    totalTax: 40500,
    grandTotal: 265500,
    status: InvoiceStatus.PAID,
  },
];

const initialChallans: GSTChallan[] = [
  {
    id: 'ch1',
    challanNumber: 'GST-2024-11-001',
    taxPeriod: '2024-11',
    gstin: '24AABCS1234D1ZA',
    cgstAmount: 45000,
    sgstAmount: 45000,
    igstAmount: 32000,
    interestAmount: 0,
    penaltyAmount: 0,
    totalPayable: 122000,
    paymentMode: PaymentMode.NET_BANKING,
    status: ChallanStatus.PAID,
    createdDate: '2024-12-10',
  },
  {
    id: 'ch2',
    challanNumber: 'GST-2024-12-001',
    taxPeriod: '2024-12',
    gstin: '24AABCS1234D1ZA',
    cgstAmount: 33750,
    sgstAmount: 33750,
    igstAmount: 40500,
    interestAmount: 0,
    penaltyAmount: 0,
    totalPayable: 108000,
    paymentMode: PaymentMode.NET_BANKING,
    status: ChallanStatus.PENDING,
    createdDate: '2024-12-18',
  },
];

// Generate attendance records for past 30 days
const generateInitialAttendanceRecords = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const statuses = [AttendanceStatus.PRESENT, AttendanceStatus.PRESENT, AttendanceStatus.PRESENT, 
                    AttendanceStatus.PRESENT, AttendanceStatus.HALF_DAY, AttendanceStatus.ABSENT,
                    AttendanceStatus.LATE, AttendanceStatus.ON_LEAVE];
  
  initialEmployees.forEach(employee => {
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayOfWeek = date.getDay();
      
      // Skip Sundays
      if (dayOfWeek === 0) continue;
      
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const checkInHour = 8 + Math.floor(Math.random() * 2);
      const checkInMin = Math.floor(Math.random() * 60);
      const checkOutHour = 17 + Math.floor(Math.random() * 3);
      const checkOutMin = Math.floor(Math.random() * 60);
      
      records.push({
        id: `att-${employee.id}-${dateStr}`,
        employeeId: employee.id,
        date: dateStr,
        status: randomStatus === AttendanceStatus.ON_LEAVE || randomStatus === AttendanceStatus.ABSENT 
          ? randomStatus 
          : randomStatus,
        checkInTime: randomStatus === AttendanceStatus.ABSENT || randomStatus === AttendanceStatus.ON_LEAVE 
          ? undefined 
          : `${String(checkInHour).padStart(2, '0')}:${String(checkInMin).padStart(2, '0')}`,
        checkOutTime: randomStatus === AttendanceStatus.ABSENT || randomStatus === AttendanceStatus.ON_LEAVE 
          ? undefined 
          : randomStatus === AttendanceStatus.HALF_DAY 
            ? `${String(13 + Math.floor(Math.random() * 2)).padStart(2, '0')}:${String(checkOutMin).padStart(2, '0')}`
            : `${String(checkOutHour).padStart(2, '0')}:${String(checkOutMin).padStart(2, '0')}`,
        overtimeHours: Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 1 : 0,
      });
    }
  });
  
  return records;
};

const initialAttendanceRecords = generateInitialAttendanceRecords();
const getInvoiceTransactionId = (invoiceId: string) => `TXN-INV-${invoiceId}`;
const getChallanTransactionId = (challanId: string) => `TXN-GST-${challanId}`;

// Helper to generate salary configs
const getRoleBaseSalary = (role: string): number => {
  switch (role) {
    case 'supervisor': return 35000;
    case 'operatorRole': return 22000;
    case 'technician': return 28000;
    case 'helper': return 15000;
    default: return 18000;
  }
};

const generateInitialSalaryConfigs = (employees: Employee[]): SalaryConfig[] => {
  return employees.map(emp => {
    const baseSalary = getRoleBaseSalary(emp.role);
    return {
      id: `sal-${emp.id}`,
      employeeId: emp.id,
      baseMonthlySalary: baseSalary,
      perDaySalary: Math.round(baseSalary / 26),
      overtimeRate: Math.round(baseSalary / 26 / 8 * 1.5),
      allowances: Math.round(baseSalary * 0.1),
      pfDeduction: 12,
      esiDeduction: 0.75,
      otherDeductions: 0,
    };
  });
};

export function useERPState() {
  const [machines, setMachines] = useState<Machine[]>(initialMachines);
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [productionData] = useState<ProductionData[]>(initialProductionData);
  const [alerts] = useState<Alert[]>(initialAlerts);
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [challans, setChallans] = useState<GSTChallan[]>(initialChallans);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(initialAttendanceRecords);
  
  // Client state
  const [clients, setClients] = useState<Client[]>(initialClients);
  
  // Payroll state
  const [salaryConfigs, setSalaryConfigs] = useState<SalaryConfig[]>(() => 
    generateInitialSalaryConfigs(initialEmployees)
  );
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [processedMonths, setProcessedMonths] = useState<string[]>([]);

  // Machine actions with inventory consumption
  const updateMachineStatus = useCallback((machineId: string, status: MachineStatus) => {
    const machine = machines.find(m => m.id === machineId);
    if (!machine) return { success: false, reason: 'machineNotFound' };

    // If starting the machine, consume inventory
    if (status === MachineStatus.RUNNING && machine.status !== MachineStatus.RUNNING) {
      const consumptionRates = getMachineConsumption(machine.type);
      
      // Check if we have enough stock for all materials
      for (const rate of consumptionRates) {
        const inventoryItem = inventory.find(item => item.nameKey === rate.materialKey);
        if (!inventoryItem || inventoryItem.quantity < rate.amountPerStart) {
          return { 
            success: false, 
            reason: 'insufficientStock',
            material: rate.materialKey,
            required: rate.amountPerStart,
            available: inventoryItem?.quantity || 0
          };
        }
      }
      
      // Consume the materials
      setInventory(prev => prev.map(item => {
        const consumption = consumptionRates.find(r => r.materialKey === item.nameKey);
        if (consumption) {
          const newQuantity = item.quantity - consumption.amountPerStart;
          let stockStatus = StockStatus.IN_STOCK;
          if (newQuantity === 0) stockStatus = StockStatus.OUT_OF_STOCK;
          else if (newQuantity < item.minStock) stockStatus = StockStatus.LOW_STOCK;
          return { ...item, quantity: newQuantity, stockStatus };
        }
        return item;
      }));
    }

    setMachines(prev => prev.map(m => 
      m.id === machineId 
        ? { ...m, status, efficiency: status === MachineStatus.RUNNING ? m.efficiency || 75 : 0 }
        : m
    ));
    
    return { success: true };
  }, [machines, inventory]);

  // Inventory actions
  const addInventoryItem = useCallback((item: Omit<InventoryItem, 'id'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: `i${Date.now()}`,
    };
    setInventory(prev => [...prev, newItem]);
  }, []);

  const updateInventoryQuantity = useCallback((itemId: string, quantity: number) => {
    setInventory(prev => prev.map(item => {
      if (item.id === itemId) {
        let stockStatus = StockStatus.IN_STOCK;
        if (quantity === 0) stockStatus = StockStatus.OUT_OF_STOCK;
        else if (quantity < item.minStock) stockStatus = StockStatus.LOW_STOCK;
        return { ...item, quantity, stockStatus };
      }
      return item;
    }));
  }, []);

  // Employee actions
  const addEmployee = useCallback((employee: Omit<Employee, 'id'>) => {
    const newEmployee: Employee = {
      ...employee,
      id: `e${Date.now()}`,
    };
    setEmployees(prev => [...prev, newEmployee]);
  }, []);

  const updateEmployeeAttendance = useCallback((employeeId: string, attendance: AttendanceStatus) => {
    setEmployees(prev => prev.map(e => 
      e.id === employeeId ? { ...e, attendance } : e
    ));
  }, []);

  // Attendance Record actions
  const addAttendanceRecord = useCallback((record: Omit<AttendanceRecord, 'id'>) => {
    const recordId = `att-${record.employeeId}-${record.date}`;
    setAttendanceRecords(prev => {
      // Update if exists, add if not
      const existing = prev.find(r => r.employeeId === record.employeeId && r.date === record.date);
      if (existing) {
        return prev.map(r => 
          r.employeeId === record.employeeId && r.date === record.date
            ? { ...r, ...record, id: recordId }
            : r
        );
      }
      return [...prev, { ...record, id: recordId }];
    });
  }, []);

  const updateAttendanceRecord = useCallback((
    employeeId: string, 
    date: string, 
    updates: Partial<Omit<AttendanceRecord, 'id' | 'employeeId' | 'date'>>
  ) => {
    setAttendanceRecords(prev => prev.map(r => 
      r.employeeId === employeeId && r.date === date
        ? { ...r, ...updates }
        : r
    ));
  }, []);

  const getAttendanceForDate = useCallback((date: string) => {
    return attendanceRecords.filter(r => r.date === date);
  }, [attendanceRecords]);

  const getAttendanceForEmployee = useCallback((employeeId: string, startDate?: string, endDate?: string) => {
    return attendanceRecords.filter(r => {
      if (r.employeeId !== employeeId) return false;
      if (startDate && r.date < startDate) return false;
      if (endDate && r.date > endDate) return false;
      return true;
    });
  }, [attendanceRecords]);

  const getAttendanceStats = useCallback((employeeId: string, startDate: string, endDate: string) => {
    const records = attendanceRecords.filter(r => 
      r.employeeId === employeeId && r.date >= startDate && r.date <= endDate
    );
    return {
      total: records.length,
      present: records.filter(r => r.status === AttendanceStatus.PRESENT).length,
      absent: records.filter(r => r.status === AttendanceStatus.ABSENT).length,
      halfDay: records.filter(r => r.status === AttendanceStatus.HALF_DAY).length,
      late: records.filter(r => r.status === AttendanceStatus.LATE).length,
      onLeave: records.filter(r => r.status === AttendanceStatus.ON_LEAVE).length,
      totalOvertimeHours: records.reduce((sum, r) => sum + (r.overtimeHours || 0), 0),
    };
  }, [attendanceRecords]);

  // Invoice actions with Finance integration
  const addInvoice = useCallback((invoice: Omit<Invoice, 'id'>) => {
    const newInvoice: Invoice = {
      ...invoice,
      id: `inv${Date.now()}`,
    };
    setInvoices(prev => [...prev, newInvoice]);
    
    // If invoice is created as PAID, create finance transaction
    if (invoice.status === InvoiceStatus.PAID) {
      const transactionId = getInvoiceTransactionId(newInvoice.id);
      const newTransaction: Transaction = {
        id: transactionId,
        description: `Invoice Payment - ${invoice.clientName}`,
        descriptionKey: 'txnInvoicePayment',
        type: TransactionType.CREDIT,
        amount: invoice.grandTotal,
        status: PaymentStatus.PAID,
        date: new Date().toISOString().split('T')[0],
        source: TransactionSource.INVOICE,
        category: TransactionCategory.SALES,
        referenceId: newInvoice.id,
        referenceNumber: invoice.invoiceNumber,
      };
      setTransactions(prev => [...prev, newTransaction]);
    }
    
    return newInvoice;
  }, []);

  // Manual transaction entry
  const addManualTransaction = useCallback((transaction: {
    type: TransactionType;
    amount: number;
    date: string;
    category: TransactionCategory;
    description: string;
    status: PaymentStatus;
  }) => {
    const newTransaction: Transaction = {
      id: `TXN${Date.now()}`,
      description: transaction.description,
      type: transaction.type,
      amount: transaction.amount,
      status: transaction.status,
      date: transaction.date,
      source: TransactionSource.MANUAL,
      category: transaction.category,
    };
    setTransactions(prev => [...prev, newTransaction]);
    return newTransaction;
  }, []);

  const updateInvoiceStatus = useCallback((invoiceId: string, newStatus: InvoiceStatus) => {
    setInvoices(prev => {
      const invoice = prev.find(inv => inv.id === invoiceId);
      if (!invoice) return prev;
      
      const oldStatus = invoice.status;
      const transactionId = getInvoiceTransactionId(invoiceId);
      
      // Handle finance transaction based on status change
      if (newStatus === InvoiceStatus.PAID && oldStatus !== InvoiceStatus.PAID) {
        // Create credit transaction when invoice becomes PAID
        setTransactions(txns => {
          // Check if transaction already exists (idempotency)
          if (txns.some(t => t.id === transactionId)) {
            return txns;
          }
          const newTransaction: Transaction = {
            id: transactionId,
            description: `Invoice Payment - ${invoice.clientName}`,
            descriptionKey: 'txnInvoicePayment',
            type: TransactionType.CREDIT,
            amount: invoice.grandTotal,
            status: PaymentStatus.PAID,
            date: new Date().toISOString().split('T')[0],
            source: TransactionSource.INVOICE,
            category: TransactionCategory.SALES,
            referenceId: invoiceId,
            referenceNumber: invoice.invoiceNumber,
          };
          return [...txns, newTransaction];
        });
      } else if (oldStatus === InvoiceStatus.PAID && newStatus !== InvoiceStatus.PAID) {
        // Remove credit transaction when invoice is no longer PAID (reversal)
        setTransactions(txns => txns.filter(t => t.id !== transactionId));
      }
      
      return prev.map(inv => 
        inv.id === invoiceId ? { ...inv, status: newStatus } : inv
      );
    });
  }, []);

  // Challan actions with Finance integration
  const addChallan = useCallback((challan: Omit<GSTChallan, 'id'>) => {
    const newChallan: GSTChallan = {
      ...challan,
      id: `ch${Date.now()}`,
    };
    setChallans(prev => [...prev, newChallan]);
    
    // If challan is created as PAID, create finance expense
    if (challan.status === ChallanStatus.PAID) {
      const transactionId = getChallanTransactionId(newChallan.id);
      const newTransaction: Transaction = {
        id: transactionId,
        description: `GST Payment - ${challan.taxPeriod}`,
        descriptionKey: 'txnGstPayment',
        type: TransactionType.DEBIT,
        amount: challan.totalPayable,
        status: PaymentStatus.PAID,
        date: new Date().toISOString().split('T')[0],
        source: TransactionSource.GST_CHALLAN,
        category: TransactionCategory.GST,
        referenceId: newChallan.id,
        referenceNumber: challan.challanNumber,
      };
      setTransactions(prev => [...prev, newTransaction]);
    }
    
    return newChallan;
  }, []);

  const updateChallanStatus = useCallback((challanId: string, newStatus: ChallanStatus) => {
    setChallans(prev => {
      const challan = prev.find(ch => ch.id === challanId);
      if (!challan) return prev;
      
      const oldStatus = challan.status;
      const transactionId = getChallanTransactionId(challanId);
      
      // Handle finance transaction based on status change
      if (newStatus === ChallanStatus.PAID && oldStatus !== ChallanStatus.PAID) {
        // Create expense transaction when challan becomes PAID
        setTransactions(txns => {
          // Check if transaction already exists (idempotency)
          if (txns.some(t => t.id === transactionId)) {
            return txns;
          }
          const newTransaction: Transaction = {
            id: transactionId,
            description: `GST Payment - ${challan.taxPeriod}`,
            descriptionKey: 'txnGstPayment',
            type: TransactionType.DEBIT,
            amount: challan.totalPayable,
            status: PaymentStatus.PAID,
            date: new Date().toISOString().split('T')[0],
            source: TransactionSource.GST_CHALLAN,
            category: TransactionCategory.GST,
            referenceId: challanId,
            referenceNumber: challan.challanNumber,
          };
          return [...txns, newTransaction];
        });
      } else if (oldStatus === ChallanStatus.PAID && newStatus === ChallanStatus.PENDING) {
        // Remove expense transaction when challan reverts to PENDING (reversal)
        setTransactions(txns => txns.filter(t => t.id !== transactionId));
      }
      
      return prev.map(ch => 
        ch.id === challanId ? { ...ch, status: newStatus } : ch
      );
    });
  }, []);

  // Computed values
  const dailyProduction = productionData[productionData.length - 1]?.output || 0;
  const activeWorkforce = employees.filter(e => e.attendance !== AttendanceStatus.ABSENT).length;
  const pendingOrdersCount = orders.filter(o => o.status === OrderStatus.PENDING).length;
  const inventoryValue = inventory.reduce((sum, item) => sum + item.estimatedValue, 0);
  const runningMachines = machines.filter(m => m.status === MachineStatus.RUNNING).length;
  const avgEfficiency = Math.round(
    machines.filter(m => m.status === MachineStatus.RUNNING)
      .reduce((sum, m) => sum + m.efficiency, 0) / runningMachines || 0
  );

  // Finance computed values - derived from transactions
  const totalRevenue = transactions
    .filter(t => t.type === TransactionType.CREDIT && t.status === PaymentStatus.PAID)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === TransactionType.DEBIT && t.status === PaymentStatus.PAID)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const profit = totalRevenue - totalExpenses;
  
  // Outstanding = unpaid invoices (ISSUED status)
  const outstandingReceivables = invoices
    .filter(inv => inv.status === InvoiceStatus.ISSUED)
    .reduce((sum, inv) => sum + inv.grandTotal, 0);
  
  // Pending payments from transactions
  const outstandingPayments = transactions
    .filter(t => t.status === PaymentStatus.PENDING || t.status === PaymentStatus.OVERDUE)
    .reduce((sum, t) => sum + t.amount, 0);

  // Billing computed values
  const totalInvoicesCount = invoices.length;
  const paidInvoicesCount = invoices.filter(inv => inv.status === InvoiceStatus.PAID).length;
  const pendingChallansCount = challans.filter(c => c.status === ChallanStatus.PENDING).length;
  const totalGSTCollected = invoices.reduce((sum, inv) => sum + inv.totalTax, 0);
  const totalGSTPaid = challans
    .filter(ch => ch.status === ChallanStatus.PAID)
    .reduce((sum, ch) => sum + ch.totalPayable, 0);

  // Inventory helpers
  const getInventoryByMaterialKey = useCallback((materialKey: RawMaterialKey) => {
    return inventory.find(item => item.nameKey === materialKey);
  }, [inventory]);

  const lowStockItems = inventory.filter(item => 
    item.stockStatus === StockStatus.LOW_STOCK || item.stockStatus === StockStatus.OUT_OF_STOCK
  );

  // Dynamic alerts based on current state
  const dynamicAlerts: Alert[] = [
    ...lowStockItems.map(item => ({
      id: `lowstock-${item.id}`,
      type: 'lowStock' as const,
      messageKey: `${item.nameKey}StockLow`,
      severity: item.stockStatus === StockStatus.OUT_OF_STOCK ? 'error' as const : 'warning' as const,
    })),
    ...machines
      .filter(m => m.status === MachineStatus.MAINTENANCE)
      .map(m => ({
        id: `maintenance-${m.id}`,
        type: 'maintenance' as const,
        messageKey: 'flatteningMachineMaintenance',
        severity: 'error' as const,
      })),
    ...(pendingOrdersCount > 0 ? [{
      id: 'pending-orders',
      type: 'orders' as const,
      messageKey: 'ordersAwaitingDispatch',
      severity: 'info' as const,
    }] : []),
  ];

  // Payroll functions
  const getSalaryConfig = useCallback((employeeId: string): SalaryConfig | undefined => {
    return salaryConfigs.find(sc => sc.employeeId === employeeId);
  }, [salaryConfigs]);

  const updateSalaryConfig = useCallback((employeeId: string, updates: Partial<Omit<SalaryConfig, 'id' | 'employeeId'>>) => {
    setSalaryConfigs(prev => prev.map(sc => {
      if (sc.employeeId === employeeId) {
        const newConfig = { ...sc, ...updates };
        if (updates.baseMonthlySalary !== undefined) {
          newConfig.perDaySalary = Math.round(updates.baseMonthlySalary / 26);
          newConfig.overtimeRate = Math.round(updates.baseMonthlySalary / 26 / 8 * 1.5);
        }
        return newConfig;
      }
      return sc;
    }));
  }, []);

  const calculateEmployeePayroll = useCallback((employeeId: string, month: string): PayrollRecord | null => {
    const employee = employees.find(e => e.id === employeeId);
    const config = getSalaryConfig(employeeId);
    if (!employee || !config) return null;

    const monthRecords = attendanceRecords.filter(r => 
      r.employeeId === employeeId && r.date.startsWith(month)
    );

    const year = parseInt(month.split('-')[0]);
    const monthNum = parseInt(month.split('-')[1]);
    const daysInMonth = new Date(year, monthNum, 0).getDate();
    
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

    const effectiveDays = presentDays + (halfDays * 0.5);
    const basicSalary = Math.round(config.perDaySalary * effectiveDays);
    const overtimePay = Math.round(config.overtimeRate * overtimeHours);
    const allowances = config.allowances;
    const grossSalary = basicSalary + overtimePay + allowances;

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

  const generateMonthlyPayroll = useCallback((month: string): PayrollRecord[] => {
    const records: PayrollRecord[] = [];
    employees.forEach(emp => {
      const record = calculateEmployeePayroll(emp.id, month);
      if (record) records.push(record);
    });
    return records;
  }, [employees, calculateEmployeePayroll]);

  const getPayrollForMonth = useCallback((month: string): PayrollRecord[] => {
    const stored = payrollRecords.filter(r => r.month === month);
    if (stored.length > 0) return stored;
    return generateMonthlyPayroll(month);
  }, [payrollRecords, generateMonthlyPayroll]);

  const isMonthProcessed = useCallback((month: string): boolean => {
    return processedMonths.includes(month);
  }, [processedMonths]);

  const processPayroll = useCallback((month: string): boolean => {
    if (processedMonths.includes(month)) return false;

    const records = generateMonthlyPayroll(month);
    const totalNetSalary = records.reduce((sum, r) => sum + r.netSalary, 0);

    const processedRecords = records.map(r => ({
      ...r,
      status: PayrollStatus.PROCESSED,
      processedDate: new Date().toISOString().split('T')[0],
    }));

    setPayrollRecords(prev => {
      const filtered = prev.filter(r => !r.month.startsWith(month));
      return [...filtered, ...processedRecords];
    });

    const monthDate = new Date(month + '-15');
    const monthName = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    const newTransaction: Transaction = {
      id: `TXN-SAL-${month}`,
      description: `Salary Payment - ${monthName}`,
      descriptionKey: 'txnSalaryPayment',
      type: TransactionType.DEBIT,
      amount: totalNetSalary,
      status: PaymentStatus.PAID,
      date: new Date().toISOString().split('T')[0],
      source: TransactionSource.MANUAL,
      category: TransactionCategory.SALARY,
    };
    setTransactions(prev => [...prev, newTransaction]);

    setProcessedMonths(prev => [...prev, month]);
    return true;
  }, [processedMonths, generateMonthlyPayroll]);

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

  // Client actions
  const addClient = useCallback((data: ClientFormData) => {
    const newClient: Client = {
      ...data,
      id: `c${Date.now()}`,
      createdDate: new Date().toISOString().split('T')[0],
      isActive: true,
    };
    setClients(prev => [...prev, newClient]);
    return newClient;
  }, []);

  const updateClient = useCallback((clientId: string, data: Partial<ClientFormData>) => {
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, ...data } : c));
  }, []);

  const getClientSummary = useCallback((clientId: string): ClientSummary => {
    const client = clients.find(c => c.id === clientId);
    if (!client) {
      return {
        client: clients[0],
        totalOrders: 0,
        totalSalesValue: 0,
        totalInvoiced: 0,
        totalPaid: 0,
        outstandingBalance: 0,
        isOverCreditLimit: false,
      };
    }
    
    const clientOrders = orders.filter(o => o.clientId === clientId);
    const clientInvoices = invoices.filter(inv => inv.clientId === clientId);
    
    const totalOrders = clientOrders.length;
    const totalSalesValue = clientOrders.reduce((sum, o) => sum + o.amount, 0);
    const totalInvoiced = clientInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
    const totalPaid = clientInvoices
      .filter(inv => inv.status === InvoiceStatus.PAID)
      .reduce((sum, inv) => sum + inv.grandTotal, 0);
    const outstandingBalance = totalInvoiced - totalPaid;
    const isOverCreditLimit = outstandingBalance > client.creditLimit;

    return {
      client,
      totalOrders,
      totalSalesValue,
      totalInvoiced,
      totalPaid,
      outstandingBalance,
      isOverCreditLimit,
    };
  }, [clients, orders, invoices]);

  return {
    // Data
    machines,
    inventory,
    orders,
    employees,
    transactions,
    productionData,
    alerts: dynamicAlerts,
    invoices,
    challans,
    attendanceRecords,
    salaryConfigs,
    payrollRecords,
    processedMonths,
    clients,
    
    // Actions
    updateMachineStatus,
    addInventoryItem,
    updateInventoryQuantity,
    addEmployee,
    updateEmployeeAttendance,
    addAttendanceRecord,
    updateAttendanceRecord,
    getAttendanceForDate,
    getAttendanceForEmployee,
    getAttendanceStats,
    addInvoice,
    updateInvoiceStatus,
    addChallan,
    updateChallanStatus,
    addManualTransaction,
    getInventoryByMaterialKey,
    
    // Payroll actions
    getSalaryConfig,
    updateSalaryConfig,
    calculateEmployeePayroll,
    generateMonthlyPayroll,
    getPayrollForMonth,
    isMonthProcessed,
    processPayroll,
    getMonthlyPayrollSummary,
    
    // Client actions
    addClient,
    updateClient,
    getClientSummary,
    
    // Computed
    dailyProduction,
    activeWorkforce,
    pendingOrdersCount,
    inventoryValue,
    runningMachines,
    avgEfficiency,
    totalRevenue,
    totalExpenses,
    profit,
    outstandingPayments,
    outstandingReceivables,
    totalInvoicesCount,
    paidInvoicesCount,
    pendingChallansCount,
    totalGSTCollected,
    totalGSTPaid,
    lowStockItems,
  };
}