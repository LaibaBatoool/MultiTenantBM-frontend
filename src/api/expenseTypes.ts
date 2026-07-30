import api from './axios';

export interface ExpenseType {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
  createdByUser?: { username: string };
  createdAt: string;
  updatedByUser?: { username: string };
  updatedAt: string | null;
}

export const getExpenseTypes = async (businessUnitId?: number, status: 'active' | 'inactive' = 'active') => {
  const response = await api.get('/expense-types', { params: { businessUnitId, status } });
  return response.data.expenseTypes as ExpenseType[];
};

export const getExpenseType = async (id: number, businessUnitId?: number) => {
  const response = await api.get(`/expense-types/${id}`, { params: { businessUnitId } });
  return response.data.expenseType as ExpenseType;
};

export const createExpenseType = async (
  payload: { name: string; description?: string },
  businessUnitId?: number,
) => {
  const response = await api.post('/expense-types', payload, { params: { businessUnitId } });
  return response.data;
};

export const updateExpenseType = async (
  id: number,
  payload: { name?: string; description?: string },
  businessUnitId?: number,
) => {
  const response = await api.patch(`/expense-types/${id}`, payload, { params: { businessUnitId } });
  return response.data;
};

export const toggleExpenseTypeActive = async (id: number, businessUnitId?: number) => {
  const response = await api.patch(`/expense-types/${id}/toggle-active`, {}, { params: { businessUnitId } });
  return response.data;
};