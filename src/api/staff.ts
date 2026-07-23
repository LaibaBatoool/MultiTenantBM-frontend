import api from './axios';

export interface Staff {
  id: number;
  fullName: string;
  username: string;
  email: string;
  businessUnitId: number | null;
  companyId: number | null;
}

export const getStaff = async (businessUnitId?: number): Promise<Staff[]> => {
  const response = await api.get('/staff', { params: { businessUnitId } });
  return response.data.staff;
};

export const getStaffOne = async (id: number, businessUnitId?: number): Promise<Staff> => {
  const response = await api.get(`/staff/${id}`, { params: { businessUnitId } });
  return response.data.staff;
};

export interface CreateStaffPayload {
  fullName: string;
  username: string;
  email: string;
  password: string;
}

export const createStaff = async (payload: CreateStaffPayload, businessUnitId?: number) => {
  const response = await api.post('/staff', payload, { params: { businessUnitId } });
  return response.data;
};

export const updateStaff = async (id: number, payload: { fullName?: string; email?: string }, businessUnitId?: number) => {
  const response = await api.patch(`/staff/${id}`, payload, { params: { businessUnitId } });
  return response.data;
};

export const deactivateStaff = async (id: number, businessUnitId?: number) => {
  const response = await api.delete(`/staff/${id}`, { params: { businessUnitId } });
  return response.data;
};