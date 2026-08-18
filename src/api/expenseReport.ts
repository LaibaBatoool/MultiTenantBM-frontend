import api from './axios';

export interface ExpenseReportRow {
  id: number;
  expenseDate: string;
  voucherNo: string;
  vendorName: string;
  description: string;
  expenseAccount: { id: number; code: string; name: string } | null;
  paymentAccount: { id: number; code: string; name: string } | null;
  project: { id: number; code: string; name: string } | null;
  amount: number;
}

export interface ExpenseReportResult {
  summary: {
    totalExpenses: number;
    thisPeriod: number;
    projectExpenses: number;
    otherExpenses: number;
    transactionCount: number;
  };
  byCategory: { id: number; code: string; name: string; amount: number }[];
  byProject: { label: string; amount: number }[];
  rows: ExpenseReportRow[];
}

export interface ExpenseReportFilters {
  businessUnitId?: number;
  startDate?: string;
  endDate?: string;
  fiscalYearId?: number;
  periodId?: number;
  expenseAccountId?: number;
  projectId?: number;
  vendorName?: string;
  paymentAccountId?: number;
}

export const getExpenseReport = async (filters: ExpenseReportFilters): Promise<ExpenseReportResult> => {
  const response = await api.get('/expense-report', { params: filters });
  return response.data;
};

export const exportExpenseReport = async (filters: ExpenseReportFilters): Promise<void> => {
  const response = await api.get('/expense-report/export', { params: filters, responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'expense-report.xlsx');
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};