import api from './axios';

export interface JournalEntryLine {
  id?: number;
  accountId: number;
  description?: string;
  debit?: number;
  credit?: number;
  account?: { id: number; code: string; name: string };
}

export interface JournalEntryRecord {
  id: number;
  voucherNo: string;
  voucherType: string;
  postingDate: string;
  status: string;
  description?: string;
  lines?: JournalEntryLine[];
}

export const createJournalEntry = async (
  payload: { postingDate: string; description?: string; lines: JournalEntryLine[] },
  businessUnitId?: number,
) => {
  const response = await api.post('/journal-entries', payload, { params: { businessUnitId } });
  return response.data;
};

export const getJournalEntries = async (
  businessUnitId?: number,
  page = 1,
  pageSize = 10,
): Promise<{ journals: JournalEntryRecord[]; total: number }> => {
  const response = await api.get('/journal-entries', { params: { businessUnitId, page, pageSize } });
  return response.data;
};

export const getJournalEntry = async (id: number, businessUnitId?: number): Promise<JournalEntryRecord> => {
  const response = await api.get(`/journal-entries/${id}`, { params: { businessUnitId } });
  return response.data.journal;
};