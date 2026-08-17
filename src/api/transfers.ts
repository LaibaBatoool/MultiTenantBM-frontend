import api from './axios';

export interface TransferRecord {
  id: number;
  transferDate: string;
  fromAccountId: number;
  toAccountId: number;
  amount: number;
  description: string | null;
  journalId: number | null;
  fromAccount?: { id: number; code: string; name: string } | null;
  toAccount?: { id: number; code: string; name: string } | null;
  journal?: { id: number; voucherNo: string } | null;
  createdByUser?: { id: number; username: string; fullName: string | null } | null;
  createdAt: string;
}

export interface TransferPayload {
  transferDate: string;
  fromAccountId: number;
  toAccountId: number;
  amount: number;
  description?: string;
}

export const getTransfers = async (businessUnitId?: number): Promise<TransferRecord[]> => {
  const response = await api.get('/transfers', { params: { businessUnitId } });
  return response.data.transfers as TransferRecord[];
};

export const createTransfer = async (payload: TransferPayload, businessUnitId?: number) => {
  const response = await api.post('/transfers', payload, { params: { businessUnitId } });
  return response.data;
};