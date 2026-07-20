import api from './axios';

export interface CurrentUser {
  id: number;
  fullName: string;
  username: string;
  email: string;
}

export const getCurrentUser = async (): Promise<CurrentUser> => {
  const response = await api.get('/auth/me');
  return response.data.user;
};