import api from './axios';

export interface BankAccount {
  id: number;
  bankName: string;
  branch: string | null;
  accountTitle: string | null;
  accountNumber: string;
  iban: string | null;
  isDefault: boolean;
  isActive: boolean;
  company?: { id: number; name: string };
  createdByUser?: { username: string };
  createdAt: string;
  updatedByUser?: { username: string };
  updatedAt: string | null;
}

export interface BankAccountPayload {
  companyId: number;
  bankName: string;
  branch?: string;
  accountTitle?: string;
  accountNumber: string;
  iban?: string;
  isDefault?: boolean;
}

export const getBankAccounts = async (businessUnitId?: number, status: 'active' | 'inactive' = 'active') => {
  const response = await api.get('/bank-accounts', { params: { businessUnitId, status } });
  return response.data.bankAccounts as BankAccount[];
};

export const getBankAccount = async (id: number, businessUnitId?: number) => {
  const response = await api.get(`/bank-accounts/${id}`, { params: { businessUnitId } });
  return response.data.bankAccount as BankAccount;
};

export const createBankAccount = async (payload: BankAccountPayload, businessUnitId?: number) => {
  const response = await api.post('/bank-accounts', payload, { params: { businessUnitId } });
  return response.data;
};

export const updateBankAccount = async (id: number, payload: Partial<BankAccountPayload>, businessUnitId?: number) => {
  const response = await api.patch(`/bank-accounts/${id}`, payload, { params: { businessUnitId } });
  return response.data;
};

export const toggleBankAccountActive = async (id: number, businessUnitId?: number) => {
  const response = await api.patch(`/bank-accounts/${id}/toggle-active`, {}, { params: { businessUnitId } });
  return response.data;
};