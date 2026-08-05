import api from './axios';

export interface FiscalYearRecord {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  status: 'Open' | 'Closed' | 'Archived';
  openingBalancePosted: boolean;
}

export const getFiscalYears = async (businessUnitId?: number): Promise<FiscalYearRecord[]> => {
  const response = await api.get('/fiscal-years', { params: { businessUnitId } });
  return response.data.fiscalYears;
};