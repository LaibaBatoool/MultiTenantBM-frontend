import api from './axios';

export interface AccountsPayableVendor {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  creditLimit: number;
  paymentTerms: string | null;
  outstandingBalance: number;
}

export interface AccountsPayableList {
  vendors: AccountsPayableVendor[];
  totalPayable: number;
}

export interface AccountsPayableLedgerLine {
  id: number;
  voucherNo: string;
  voucherType: string;
  postingDate: string;
  description: string | null;
  debit: number;
  credit: number;
  balance: number;
}

export interface AccountsPayableLedgerResult {
  vendor: { id: number; name: string };
  lines: AccountsPayableLedgerLine[];
  closingBalance: number;
}

export const getAccountsPayableVendors = async (businessUnitId?: number): Promise<AccountsPayableList> => {
  const response = await api.get('/accounts-payable/vendors', { params: { businessUnitId } });
  return response.data;
};

export const getAccountsPayableLedger = async (
  vendorId: number,
  businessUnitId?: number,
): Promise<AccountsPayableLedgerResult> => {
  const response = await api.get(`/accounts-payable/vendors/${vendorId}/ledger`, { params: { businessUnitId } });
  return response.data;
};