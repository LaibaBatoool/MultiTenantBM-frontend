import api from './axios';

export interface SalesInvoiceItemPayload {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface SalesInvoicePayload {
  invoiceDate: string;
  dueDate?: string;
  customerId: number;
  taxRate?: number;
  description?: string;
  projectId?: number;
  items: SalesInvoiceItemPayload[];
}

export interface SalesInvoiceItemRecord {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface SalesInvoiceRecord {
  id: number;
  invoiceDate: string;
  dueDate: string | null;
  customerId: number;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  description: string | null;
  customer?: { id: number; name: string; email?: string | null; phone?: string | null; address?: string | null } | null;
  journal?: { id: number; voucherNo: string } | null;
  items?: SalesInvoiceItemRecord[];
  createdByUser?: { id: number; username: string; fullName: string | null } | null;
  createdAt: string;
}

export const getSalesInvoices = async (businessUnitId?: number): Promise<SalesInvoiceRecord[]> => {
  const response = await api.get('/sales-invoices', { params: { businessUnitId } });
  return response.data.invoices as SalesInvoiceRecord[];
};

export const getSalesInvoice = async (id: number, businessUnitId?: number): Promise<SalesInvoiceRecord> => {
  const response = await api.get(`/sales-invoices/${id}`, { params: { businessUnitId } });
  return response.data.invoice as SalesInvoiceRecord;
};

export const createSalesInvoice = async (payload: SalesInvoicePayload, businessUnitId?: number) => {
  const response = await api.post('/sales-invoices', payload, { params: { businessUnitId } });
  return response.data;
};