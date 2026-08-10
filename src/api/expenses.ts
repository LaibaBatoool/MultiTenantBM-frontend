import api from './axios';

export interface ExpenseRecord {
  id: number;
  expenseDate: string;
  expenseAccountId: number;
  paymentAccountId: number;
  amount: number;
  vendorName: string | null;
  description: string | null;
  attachmentPath: string | null;
  projectId: number | null;
  journalId: number | null;
  expenseAccount?: { id: number; code: string; name: string } | null;
  paymentAccount?: { id: number; code: string; name: string } | null;
  journal?: { id: number; voucherNo: string } | null;
  createdByUser?: { id: number; username: string; fullName: string | null } | null;
  createdAt: string;
}

export interface ExpensePayload {
  expenseDate: string;
  expenseAccountId: number;
  paymentAccountId: number;
  amount: number;
  vendorName?: string;
  description?: string;
  attachmentPath?: string;
  projectId?: number;
}

export const getExpenses = async (businessUnitId?: number): Promise<ExpenseRecord[]> => {
  const response = await api.get('/expenses', { params: { businessUnitId } });
  return response.data.expenses as ExpenseRecord[];
};

export const createExpense = async (payload: ExpensePayload, businessUnitId?: number) => {
  const response = await api.post('/expenses', payload, { params: { businessUnitId } });
  return response.data;
};