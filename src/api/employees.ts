import api from './axios';

export interface Employee {
  id: number;
  employeeCode: string | null;
  designation: string | null;
  department: string | null;
  joiningDate: string | null;
  basicSalary: number | null;
  phone: string | null;
  isActive: boolean;
  user?: {
    id: number;
    fullName: string;
    username: string;
    email: string;
    profilePicture?: { id: number; url: string } | null;
  };
}

export interface CreateEmployeePayload {
  fullName: string;
  username: string;
  email: string;
  password: string;
  employeeCode?: string;
  designation?: string;
  department?: string;
  joiningDate?: string;
  basicSalary?: number;
  phone?: string;
  profilePictureId?: number;
}

export const getEmployees = async (businessUnitId?: number, status: 'active' | 'inactive' = 'active') => {
  const response = await api.get('/employees', { params: { businessUnitId, status } });
  return response.data.employees as Employee[];
};

export const getEmployee = async (id: number, businessUnitId?: number) => {
  const response = await api.get(`/employees/${id}`, { params: { businessUnitId } });
  return response.data.employee as Employee;
};

export const createEmployee = async (payload: CreateEmployeePayload, businessUnitId?: number) => {
  const response = await api.post('/employees', payload, { params: { businessUnitId } });
  return response.data;
};

export const updateEmployee = async (
  id: number,
  payload: Partial<CreateEmployeePayload>,
  businessUnitId?: number,
) => {
  const response = await api.patch(`/employees/${id}`, payload, { params: { businessUnitId } });
  return response.data;
};

export const toggleEmployeeActive = async (id: number, businessUnitId?: number) => {
  const response = await api.patch(`/employees/${id}/toggle-active`, {}, { params: { businessUnitId } });
  return response.data;
};