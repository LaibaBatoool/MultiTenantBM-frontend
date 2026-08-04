import api from './axios';

interface UserRef {
    id: number;
    username: string;
    fullName: string;
    email?: string;
}

export interface BusinessUnit {
    id: number;
    name: string;
    logo?: string | null;
    adminId: number | null;
    admin?: UserRef;
    createdAt: string;
    createdBy: number;
    createdByUser?: UserRef;
    updatedAt: string | null;
    updatedBy: number | null;
    updatedByUser?: UserRef;
    deletedAt: string | null;
    deletedBy: number | null;
    deletedByUser?: UserRef;
}

export interface CreateBusinessUnitPayload {
    name: string;
    logo?: string;
    adminFullName: string;
    adminUsername: string;
    adminEmail: string;
    adminPassword: string;
}

export interface UpdateBusinessUnitPayload {
    name?: string;
    logo?: string;
    adminFullName?: string;
    adminUsername?: string;
    adminEmail?: string;
    adminPassword?: string;
}

export const getBusinessUnits = async (status: 'active' | 'inactive' = 'active'): Promise<BusinessUnit[]> => {
    const response = await api.get('/business-units', { params: { status } });
    return response.data.businessUnits;
};

export const getBusinessUnit = async (id: number): Promise<BusinessUnit> => {
    const response = await api.get(`/business-units/${id}`);
    return response.data.businessUnit;
};

export const createBusinessUnit = async (payload: CreateBusinessUnitPayload) => {
    const response = await api.post('/business-units', payload);
    return response.data;
};

export const updateBusinessUnit = async (id: number, payload: UpdateBusinessUnitPayload) => {
    const response = await api.patch(`/business-units/${id}`, payload);
    return response.data;
};

export const deleteBusinessUnit = async (id: number) => {
    const response = await api.delete(`/business-units/${id}`);
    return response.data;
};

export const restoreBusinessUnit = async (id: number) => {
    const response = await api.patch(`/business-units/${id}/restore`);
    return response.data;
};