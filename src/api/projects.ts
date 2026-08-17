import api from './axios';

export interface ProjectRecord {
  id: number;
  code: string;
  name: string;
  customerId: number | null;
  description: string | null;
  startDate: string;
  endDate: string | null;
  status: string;
  budget: number | null;
  isActive: boolean;
  customer?: { id: number; name: string } | null;
}

export interface ProjectPayload {
  code: string;
  name: string;
  customerId?: number;
  description?: string;
  startDate: string;
  endDate?: string;
  status?: string;
  budget?: number;
}

export const getProjects = async (businessUnitId?: number): Promise<ProjectRecord[]> => {
  const response = await api.get('/projects', { params: { businessUnitId } });
  return response.data.projects as ProjectRecord[];
};

export const createProject = async (payload: ProjectPayload, businessUnitId?: number) => {
  const response = await api.post('/projects', payload, { params: { businessUnitId } });
  return response.data;
};

export const updateProject = async (
  id: number,
  payload: Partial<ProjectPayload>,
  businessUnitId?: number,
) => {
  const response = await api.patch(`/projects/${id}`, payload, { params: { businessUnitId } });
  return response.data;
};