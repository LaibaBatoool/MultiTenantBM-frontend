import api from './axios';

export interface PaymentRecord {
  id: number;
  paymentDate: string;
  paymentAccountId: number;
  expenseAccountId: number;
  amount: number;
  paidTo: string | null;
  description: string | null;
  attachmentPath: string | null;
  projectId: number | null;
  journalId: number | null;
  paymentAccount?: { id: number; code: string; name: string } | null;
  expenseAccount?: { id: number; code: string; name: string } | null;
  journal?: { id: number; voucherNo: string } | null;
  createdByUser?: { id: number; username: string; fullName: string | null } | null;
  createdAt: string;
}

export interface PaymentPayload {
  paymentDate: string;
  paymentAccountId: number;
  expenseAccountId: number;
  amount: number;
  paidTo?: string;
  description?: string;
  attachmentPath?: string;
  projectId?: number;
}

export const getPayments = async (businessUnitId?: number): Promise<PaymentRecord[]> => {
  const response = await api.get('/payments', { params: { businessUnitId } });
  return response.data.payments as PaymentRecord[];
};

export const createPayment = async (payload: PaymentPayload, businessUnitId?: number) => {
  const response = await api.post('/payments', payload, { params: { businessUnitId } });
  return response.data;
};