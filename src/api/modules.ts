import api from './axios';

export interface ModuleNode {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  children?: ModuleNode[];
  permissions?: { id: number; name: string }[];
}

export const getModuleTree = async (): Promise<ModuleNode[]> => {
  const response = await api.get('/modules');
  return response.data.modules;
};