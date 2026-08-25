import api from './axios';

export interface AccountsReceivableCustomer {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  creditLimit: number;
  paymentTerms: string | null;
  outstandingBalance: number;
}

export interface AccountsReceivableList {
  customers: AccountsReceivableCustomer[];
  totalReceivable: number;
}

export interface AccountsReceivableLedgerLine {
  id: number;
  voucherNo: string;
  voucherType: string;
  postingDate: string;
  description: string | null;
  debit: number;
  credit: number;
  balance: number;
}

export interface AccountsReceivableLedgerResult {
  customer: { id: number; name: string };
  lines: AccountsReceivableLedgerLine[];
  closingBalance: number;
}

export const getAccountsReceivableCustomers = async (businessUnitId?: number): Promise<AccountsReceivableList> => {
  const response = await api.get('/accounts-receivable/customers', { params: { businessUnitId } });
  return response.data;
};

export const getAccountsReceivableLedger = async (
  customerId: number,
  businessUnitId?: number,
): Promise<AccountsReceivableLedgerResult> => {
  const response = await api.get(`/accounts-receivable/customers/${customerId}/ledger`, { params: { businessUnitId } });
  return response.data;
};

export const exportAccountsReceivable = async (businessUnitId?: number): Promise<void> => {
  const response = await api.get('/accounts-receivable/customers/export', {
    params: { businessUnitId },
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'accounts-receivable.xlsx');
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};