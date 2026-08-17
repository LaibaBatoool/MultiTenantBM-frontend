import api from './axios';

export interface ReceiptRecord {
  id: number;
  receiptDate: string;
  receivingAccountId: number;
  againstAccountId: number;
  amount: number;
  projectId: number | null;
  receivedFrom: string | null;
  description: string | null;
  attachmentPath: string | null;
  journalId: number | null;
  receivingAccount?: { id: number; code: string; name: string } | null;
  againstAccount?: { id: number; code: string; name: string } | null;
  journal?: { id: number; voucherNo: string } | null;
  createdByUser?: { id: number; username: string; fullName: string | null } | null;
  createdAt: string;
}

export interface ReceiptPayload {
  receiptDate: string;
  receivingAccountId: number;
  againstAccountId: number;
  amount: number;
  projectId?: number;
  receivedFrom?: string;
  description?: string;
  attachmentPath?: string;
}

export const getReceipts = async (businessUnitId?: number): Promise<ReceiptRecord[]> => {
  const response = await api.get('/receipts', { params: { businessUnitId } });
  return response.data.receipts as ReceiptRecord[];
};

export const createReceipt = async (payload: ReceiptPayload, businessUnitId?: number) => {
  const response = await api.post('/receipts', payload, { params: { businessUnitId } });
  return response.data;
};