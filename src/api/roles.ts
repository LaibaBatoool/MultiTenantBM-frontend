import api from './axios';

export interface Permission {
  id: number;
  name: string;
}

export interface Role {
  id: number;
  name: string;
  description: string | null;
  permissions: Permission[];
}

export interface RolePayload {
  name: string;
  description?: string;
  permissionIds?: number[];
}

export const getRole = async (id: number): Promise<Role> => {
  const response = await api.get(`/roles/${id}`);
  return response.data.role;
};

export const getRoles = async (businessUnitId?: number): Promise<Role[]> => {
  const response = await api.get('/roles', { params: { businessUnitId } });
  return response.data.roles;
};

export const createRole = async (payload: RolePayload, businessUnitId?: number) => {
  const response = await api.post('/roles', payload, { params: { businessUnitId } });
  return response.data;
};

export const updateRole = async (id: number, payload: RolePayload) => {
  const response = await api.patch(`/roles/${id}`, payload);
  return response.data;
};

export const deleteRole = async (id: number) => {
  const response = await api.delete(`/roles/${id}`);
  return response.data;
};

export const assignRolesToUser = async (userId: number, roleIds: number[]) => {
  const response = await api.post('/roles/assign', { userId, roleIds });
  return response.data;
};

export const getUserRoles = async (userId: number): Promise<Role[]> => {
  const response = await api.get(`/roles/user/${userId}`);
  return response.data.roles;
};

export const getMyPermissions = async (): Promise<string[]> => {
  const response = await api.get('/roles/me/permissions');
  return response.data.permissions;
};