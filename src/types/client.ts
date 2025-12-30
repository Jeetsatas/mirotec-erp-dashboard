// Client / Customer Management Types

export interface Client {
  id: string;
  clientName: string;
  companyName: string;
  gstin: string;
  billingAddress: string;
  shippingAddress: string;
  contactPerson: string;
  phone: string;
  email: string;
  state: string;
  creditLimit: number;
  createdDate: string;
  isActive: boolean;
}

export interface ClientSummary {
  client: Client;
  totalOrders: number;
  totalSalesValue: number;
  totalInvoiced: number;
  totalPaid: number;
  outstandingBalance: number;
  isOverCreditLimit: boolean;
}

export interface ClientFormData {
  clientName: string;
  companyName: string;
  gstin: string;
  billingAddress: string;
  shippingAddress: string;
  contactPerson: string;
  phone: string;
  email: string;
  state: string;
  creditLimit: number;
}
