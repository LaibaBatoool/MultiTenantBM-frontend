import api from './axios';

export interface ProjectProfitabilityReport {
  project: {
    id: number;
    code: string;
    name: string;
    status: string;
    budget: number | null;
    customer: { id: number; name: string } | null;
  };
  revenue: { total: number; byAccount: { id: number; code: string; name: string; amount: number }[] };
  costs: { total: number; byAccount: { id: number; code: string; name: string; amount: number }[] };
  profit: number;
  profitMargin: number;
  budget: number | null;
  actualCost: number;
  remainingBudget: number | null;
  transactions: {
    id: number;
    voucherNo: string;
    voucherType: string;
    postingDate: string;
    account: { id: number; code: string; name: string; accountType: string };
    description: string | null;
    debit: number;
    credit: number;
  }[];
}

export const getProjectProfitability = async (
  projectId: number,
  businessUnitId?: number,
): Promise<ProjectProfitabilityReport> => {
  const response = await api.get(`/project-profitability/${projectId}`, { params: { businessUnitId } });
  return response.data;
};

export const exportProjectProfitability = async (projectId: number, businessUnitId?: number): Promise<void> => {
  const response = await api.get(`/project-profitability/${projectId}/export`, {
    params: { businessUnitId },
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `project-profitability-${projectId}.xlsx`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};