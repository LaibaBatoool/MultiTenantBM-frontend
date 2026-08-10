import api from './axios';

export interface TrialBalanceRow {
  accountId: number;
  code: string;
  name: string;
  accountType: string;
  debit: number;
  credit: number;
}

export interface TrialBalanceResult {
  asOfDate: string;
  periodLabel: string | null;
  accounts: TrialBalanceRow[];
  totalAccounts: number;
  totalDebit: number;
  totalCredit: number;
  difference: number;
  isBalanced: boolean;
}

export interface TrialBalanceParams {
  businessUnitId?: number;
  fiscalYearId?: number;
  periodId?: number;
  asOfDate?: string;
}

export const getTrialBalance = async (params: TrialBalanceParams): Promise<TrialBalanceResult> => {
  const response = await api.get('/trial-balance', { params });
  return response.data;
};

export const exportTrialBalance = async (params: TrialBalanceParams): Promise<void> => {
  const response = await api.get('/trial-balance/export', { params, responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'trial-balance.xlsx');
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};