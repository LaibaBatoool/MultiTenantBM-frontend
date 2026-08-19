import api from './axios';

export interface Staff {
  id: number;
  fullName: string;
  username: string;
  email: string;
  businessUnitId: number | null;
  companyId: number | null;
  profilePicture?: string | null;
}

export const getStaff = async (
  businessUnitId?: number,
  status: 'active' | 'inactive' = 'active',
  page = 1,
  pageSize = 10,
): Promise<{ staff: Staff[]; total: number }> => {
  const response = await api.get('/staff', { params: { businessUnitId, status, page, pageSize } });
  return { staff: response.data.staff, total: response.data.total };
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
  profilePicture?: string;
}

export const createStaff = async (payload: CreateStaffPayload, businessUnitId?: number) => {
  const response = await api.post('/staff', payload, { params: { businessUnitId } });
  return response.data;
};

export const updateStaff = async (
  id: number,
  payload: { fullName?: string; email?: string; profilePicture?: string },
  businessUnitId?: number,
) => {
  const response = await api.patch(`/staff/${id}`, payload, { params: { businessUnitId } });
  return response.data;
};

export const deactivateStaff = async (id: number, businessUnitId?: number) => {
  const response = await api.delete(`/staff/${id}`, { params: { businessUnitId } });
  return response.data;
};

export const restoreStaff = async (id: number, businessUnitId?: number) => {
  const response = await api.patch(`/staff/${id}/restore`, {}, { params: { businessUnitId } });
  return response.data;
};