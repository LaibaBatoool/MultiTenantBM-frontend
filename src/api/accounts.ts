import api from './axios';

export interface AccountRecord {
  id: number;
  code: string;
  name: string;
  accountType: string;
  parentAccountId: number | null;
  isGroup: boolean;
  isActive: boolean;
}

export const getAccounts = async (businessUnitId?: number): Promise<AccountRecord[]> => {
  const response = await api.get('/accounts', { params: { businessUnitId } });
  return response.data.accounts;
};