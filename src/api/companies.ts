import api from './axios';

export interface CompanyRecord {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  website: string | null;
  isActive: boolean;
  logo?: string | null;
  admin?: { id: number; fullName: string; username: string; email: string } | null;
  createdAt: string;
  createdByUser?: { username: string };
  updatedAt: string | null;
  updatedByUser?: { username: string };
}

export interface CreateCompanyPayload {
  name: string;
  businessUnitId: number;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  logoId?: string;
  adminFullName: string;
  adminUsername: string;
  adminEmail: string;
  adminPassword: string;
}

export const getCompaniesByType = async (
  type: string,
  businessUnitId?: number,
  status: 'active' | 'inactive' = 'active',
): Promise<CompanyRecord[]> => {
  const response = await api.get(`/master-data/${type}`, { params: { businessUnitId, status } });
  return response.data.companies;
};

export const getCompanyByType = async (type: string, id: number): Promise<CompanyRecord> => {
  const response = await api.get(`/master-data/${type}/${id}`);
  return response.data.company;
};

export const createCompanyOfType = async (type: string, payload: CreateCompanyPayload) => {
  const response = await api.post(`/master-data/${type}`, payload);
  return response.data;
};

export const updateCompanyOfType = async (
  type: string,
  id: number,
  payload: {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    website?: string;
    logoId?: string;
    adminFullName?: string;
    adminUsername?: string;
    adminEmail?: string;
    adminPassword?: string;
  },
) => {
  const response = await api.patch(`/master-data/${type}/${id}`, payload);
  return response.data;
};

export const toggleCompanyActive = async (type: string, id: number) => {
  const response = await api.patch(`/master-data/${type}/${id}/toggle-active`);
  return response.data;
};