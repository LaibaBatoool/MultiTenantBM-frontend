import api from './axios';

export interface CapitalContributionRecord {
  id: number;
  contributionDate: string;
  contributor: string | null;
  receivingAccountId: number;
  capitalAccountId: number;
  amount: number;
  description: string | null;
  attachmentPath: string | null;
  journalId: number | null;
  receivingAccount?: { id: number; code: string; name: string } | null;
  capitalAccount?: { id: number; code: string; name: string } | null;
  journal?: { id: number; voucherNo: string } | null;
  createdByUser?: { id: number; username: string; fullName: string | null } | null;
  createdAt: string;
}

export interface CapitalContributionPayload {
  contributionDate: string;
  receivingAccountId: number;
  capitalAccountId: number;
  amount: number;
  contributor?: string;
  description?: string;
  attachmentPath?: string;
}

export const getCapitalContributions = async (
  businessUnitId?: number,
): Promise<CapitalContributionRecord[]> => {
  const response = await api.get('/capital-contributions', { params: { businessUnitId } });
  return response.data.contributions as CapitalContributionRecord[];
};

export const createCapitalContribution = async (
  payload: CapitalContributionPayload,
  businessUnitId?: number,
) => {
  const response = await api.post('/capital-contributions', payload, { params: { businessUnitId } });
  return response.data;
};