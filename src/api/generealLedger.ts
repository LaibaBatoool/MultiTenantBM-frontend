import api from './axios';

export interface GeneralLedgerLine {
  id: number;
  journalId: number;
  voucherNo: string;
  voucherType: string;
  postingDate: string;
  account: {
    id: number;
    code: string;
    name: string;
    accountType: string;
  };
  description?: string | null;
  debit: number;
  credit: number;
  balance: number;
}

export interface GeneralLedgerResult {
  account: { id: number; code: string; name: string; accountType: string } | null;
  openingBalance: number;
  totalDebits: number;
  totalCredits: number;
  transactionCount: number;
  lines: GeneralLedgerLine[];
  closingBalance: number;
  rangeStart: string | null;
  rangeEnd: string | null;
}

export interface GeneralLedgerParams {
  businessUnitId?: number;
  accountId?: number;
  fiscalYearId?: number;
  periodId?: number;
  startDate?: string;
  endDate?: string;
  voucherNo?: string;
}

export const getGeneralLedger = async (params: GeneralLedgerParams): Promise<GeneralLedgerResult> => {
  const response = await api.get('/general-ledger', { params });
  return response.data;
};

export const exportGeneralLedger = async (params: GeneralLedgerParams): Promise<void> => {
  const response = await api.get('/general-ledger/export', { params, responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'general-ledger.xlsx');
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};