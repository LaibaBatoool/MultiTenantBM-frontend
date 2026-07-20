import api from './axios';

export interface BusinessUnit {
  id: number;
  name: string;
  adminId: number | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateBusinessUnitPayload {
  name: string;
  adminFullName: string;
  adminUsername: string;
  adminEmail: string;
  adminPassword: string;
}

export const getBusinessUnits = async (): Promise<BusinessUnit[]> => {
  const response = await api.get('/business-units');
  return response.data.businessUnits;
};

export const getBusinessUnit = async (id: number): Promise<BusinessUnit> => {
  const response = await api.get(`/business-units/${id}`);
  return response.data.businessUnit;
};

export const createBusinessUnit = async (payload: CreateBusinessUnitPayload) => {
  const response = await api.post('/business-units', payload);
  return response.data;
};

export const updateBusinessUnit = async (id: number, payload: { name: string }) => {
  const response = await api.patch(`/business-units/${id}`, payload);
  return response.data;
};

export const deleteBusinessUnit = async (id: number) => {
  const response = await api.delete(`/business-units/${id}`);
  return response.data;
};