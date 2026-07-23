import api from './axios';

export interface PermissionNode {
  id: number;
  name: string;
  permission: string;
  parent: string | null;
  children?: PermissionNode[];
}

export const getPermissionTree = async (): Promise<PermissionNode[]> => {
  const response = await api.get('/permissions/tree');
  return response.data.permissions;
};