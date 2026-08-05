import api from './axios';

export interface OpeningBalanceLine {
  accountId: number;
  debit?: number;
  credit?: number;
}

export interface OpeningBalanceLineResult extends OpeningBalanceLine {
  id: number;
  account?: { id: number; code: string; name: string };
}

export interface OpeningBalanceJournal {
  id: number;
  voucherNo: string;
  postingDate: string;
  status: string;
  lines: OpeningBalanceLineResult[];
}

export const postOpeningBalance = async (
  payload: { fiscalYearId: number; openingDate: string; lines: OpeningBalanceLine[] },
  businessUnitId?: number,
) => {
  const response = await api.post('/opening-balance', payload, { params: { businessUnitId } });
  return response.data;
};

export const getOpeningBalance = async (
  fiscalYearId: number,
  businessUnitId?: number,
): Promise<{ success: boolean; posted: boolean; journal: OpeningBalanceJournal | null }> => {
  const response = await api.get(`/opening-balance/${fiscalYearId}`, { params: { businessUnitId } });
  return response.data;
};