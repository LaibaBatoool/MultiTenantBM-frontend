import api from './axios';

export interface CurrentUser {
  id: number;
  fullName: string;
  username: string;
  email: string;
  businessUnitId: number | null;
  profilePictureId: number | null;
  profilePicture?: { id: number; url: string; originalName: string } | null;
}

export const getCurrentUser = async (): Promise<CurrentUser> => {
  const response = await api.get('/auth/me');
  return response.data.user;
};

export const updateMyProfile = async (payload: {
  fullName?: string;
  email?: string;
  password?: string;
  profilePictureId?: number;
}) => {
  const response = await api.patch('/auth/me', payload);
  return response.data;
};