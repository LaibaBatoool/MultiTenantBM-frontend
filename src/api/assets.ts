import api from './axios';

export interface Asset {
  id: number;
  name: string;
  assetCode: string | null;
  assetCategory: string | null;
  serialNumber: string | null;
  purchaseDate: string | null;
  purchasePrice: number | null;
  currentBookValue: number | null;
  assetAccountId: number | null;
  paymentAccountId: number | null;
  assetAccount?: { id: number; code: string; name: string } | null;
  paymentAccount?: { id: number; code: string; name: string } | null;
  journal?: { id: number; voucherNo: string } | null;
  isActive: boolean;
  createdByUser?: { username: string };
  createdAt: string;
  updatedByUser?: { username: string };
  updatedAt: string | null;
}

export interface AssetPayload {
  name: string;
  assetCode?: string;
  assetCategory?: string;
  serialNumber?: string;
  purchaseDate?: string;
  purchasePrice: number;
  currentBookValue?: number;
  assetAccountId: number;
  paymentAccountId: number;
}

export const getAssets = async (businessUnitId?: number, status: 'active' | 'inactive' = 'active') => {
  const response = await api.get('/assets', { params: { businessUnitId, status } });
  return response.data.assets as Asset[];
};

export const getAsset = async (id: number, businessUnitId?: number) => {
  const response = await api.get(`/assets/${id}`, { params: { businessUnitId } });
  return response.data.asset as Asset;
};

export const createAsset = async (payload: AssetPayload, businessUnitId?: number) => {
  const response = await api.post('/assets', payload, { params: { businessUnitId } });
  return response.data;
};

export const updateAsset = async (id: number, payload: AssetPayload, businessUnitId?: number) => {
  const response = await api.patch(`/assets/${id}`, payload, { params: { businessUnitId } });
  return response.data;
};

export const toggleAssetActive = async (id: number, businessUnitId?: number) => {
  const response = await api.patch(`/assets/${id}/toggle-active`, {}, { params: { businessUnitId } });
  return response.data;
};