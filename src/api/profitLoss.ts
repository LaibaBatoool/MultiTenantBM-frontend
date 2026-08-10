import api from './axios';

export interface ProfitLossLine {
  accountId: number;
  code: string;
  name: string;
  amount: number;
}

export interface ProfitLossResult {
  rangeStart: string;
  rangeEnd: string;
  periodLabel: string;
  revenue: ProfitLossLine[];
  cogs: ProfitLossLine[];
  operatingExpenses: ProfitLossLine[];
  totalRevenue: number;
  totalCOGS: number;
  grossProfit: number;
  totalOperatingExpenses: number;
  netProfit: number;
}

export interface ProfitLossParams {
  businessUnitId?: number;
  fiscalYearId?: number;
  periodId?: number;
  startDate?: string;
  endDate?: string;
}

export const getProfitAndLoss = async (params: ProfitLossParams): Promise<ProfitLossResult> => {
  const response = await api.get('/profit-loss', { params });
  return response.data;
};

export const exportProfitAndLoss = async (params: ProfitLossParams): Promise<void> => {
  const response = await api.get('/profit-loss/export', { params, responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'profit-and-loss.xlsx');
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};