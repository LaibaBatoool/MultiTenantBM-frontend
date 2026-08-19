import api from './axios';

export interface UserInfo {
  id: number;
  username: string;
  name: string;
  email: string;
  profilePic: string;
  businessUnitId: number | null;
}

export interface UserContextResponse {
  user: UserInfo;
  permissions: string[];
  isSuperAdmin: boolean;
  isAgencyAdmin: boolean;
  isAgencyUser: boolean;
  isCompanyAdmin: boolean;
  token: string;
}

export const getUserContext = async (): Promise<UserContextResponse> => {
  const response = await api.get('/auth/user-context');
  return response.data;
};

export const updateMyProfile = async (payload: {
  fullName?: string;
  email?: string;
  password?: string;
  profilePicture?: string;
}) => {
  const response = await api.patch('/auth/me', payload);
  return response.data;
};