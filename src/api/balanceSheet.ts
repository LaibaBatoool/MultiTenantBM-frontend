import api from './axios';

export interface BalanceSheetLine {
  accountId: number;
  code: string;
  name: string;
  amount: number;
}

export interface BalanceSheetSection {
  name: string;
  accounts: BalanceSheetLine[];
  total: number;
}

export interface BalanceSheetResult {
  asOfDate: string;
  periodLabel: string;
  assets: { sections: BalanceSheetSection[]; total: number };
  liabilities: { sections: BalanceSheetSection[]; total: number };
  equity: { accounts: BalanceSheetLine[]; currentYearProfit: number; total: number };
  totalLiabilitiesAndEquity: number;
  difference: number;
  isBalanced: boolean;
}

export interface BalanceSheetParams {
  businessUnitId?: number;
  fiscalYearId?: number;
  periodId?: number;
  asOfDate?: string;
}

export const getBalanceSheet = async (params: BalanceSheetParams): Promise<BalanceSheetResult> => {
  const response = await api.get('/balance-sheet', { params });
  return response.data;
};

export const exportBalanceSheet = async (params: BalanceSheetParams): Promise<void> => {
  const response = await api.get('/balance-sheet/export', { params, responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'balance-sheet.xlsx');
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};