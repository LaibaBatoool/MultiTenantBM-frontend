import { useEffect, useState } from 'react';
import { Typography, Select, Button, Table, DatePicker, Empty, message, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import dayjs, { type Dayjs } from 'dayjs';
import { getAccounts, type AccountRecord } from '../api/accounts';
import { getFiscalYears, type FiscalYearRecord } from '../api/fiscalYears';
import { exportGeneralLedger, getGeneralLedger, type GeneralLedgerResult } from '../api/generealLedger';
import { useBusinessUnit } from '../context/BusinessUnitContext';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export default function GeneralLedger() {
  const { selectedBusinessUnit } = useBusinessUnit();
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState<AccountRecord[]>([]);
  const [fiscalYears, setFiscalYears] = useState<FiscalYearRecord[]>([]);
  const [accountId, setAccountId] = useState<number | undefined>();
  const [fiscalYearId, setFiscalYearId] = useState<number | undefined>();
  const [periodId, setPeriodId] = useState<number | undefined>();
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);

  const [result, setResult] = useState<GeneralLedgerResult | null>(null);
  const [loadingFilters, setLoadingFilters] = useState(false);
  const [loadingLedger, setLoadingLedger] = useState(false);

  const formatAmount = (value: number) => value.toLocaleString();

  const getDefaultFiscalYearId = (years: FiscalYearRecord[]) => {
    const today = dayjs().format('YYYY-MM-DD');
    const currentYear = years.find((fy) => fy.startDate <= today && fy.endDate >= today);
    return currentYear?.id ?? years[0]?.id;
  };

  const fetchLedger = async (params?: {
    accountId?: number;
    fiscalYearId?: number;
    periodId?: number;
    startDate?: string;
    endDate?: string;
  }) => {
    if (!selectedBusinessUnit?.id) {
      return;
    }

    setLoadingLedger(true);
    try {
      const data = await getGeneralLedger({
        businessUnitId: selectedBusinessUnit.id,
        accountId: params?.accountId,
        fiscalYearId: params?.fiscalYearId,
        periodId: params?.periodId,
        startDate: params?.startDate,
        endDate: params?.endDate,
      });
      setResult(data);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Ledger cant be fetched.');
      setResult(null);
    } finally {
      setLoadingLedger(false);
    }
  };

  useEffect(() => {
    if (selectedBusinessUnit?.id) {
      void loadFilters();
      setAccountId(undefined);
      setFiscalYearId(undefined);
      setPeriodId(undefined);
      setDateRange(null);
      setResult(null);
    }
  }, [selectedBusinessUnit]);

  const loadFilters = async () => {
    setLoadingFilters(true);
    try {
      const [accountsData, fiscalYearsData] = await Promise.all([
        getAccounts(selectedBusinessUnit?.id),
        getFiscalYears(selectedBusinessUnit?.id),
      ]);
      setAccounts(accountsData.filter((a) => !a.isGroup));
      setFiscalYears(fiscalYearsData);

      const defaultFiscalYearId = getDefaultFiscalYearId(fiscalYearsData);
      setFiscalYearId(defaultFiscalYearId);
      setPeriodId(undefined);
      setDateRange(null);

      await fetchLedger({ fiscalYearId: defaultFiscalYearId });
    } catch (error) {
      message.error('Filters load nahi ho sakay.');
    } finally {
      setLoadingFilters(false);
    }
  };

  const selectedFiscalYear = fiscalYears.find((fy) => fy.id === fiscalYearId);

  const handleFiscalYearChange = (value: number | undefined) => {
    setFiscalYearId(value);
    setPeriodId(undefined);
    setDateRange(null);
  };

  const handlePeriodChange = (value: number | undefined) => {
    setPeriodId(value);
    setDateRange(null);
  };

  const handleDateRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (dates && dates[0] && dates[1]) {
      setDateRange([dates[0], dates[1]]);
      setFiscalYearId(undefined);
      setPeriodId(undefined);
    } else {
      setDateRange(null);
    }
  };

  const handleViewLedger = async () => {
    await fetchLedger({
      accountId,
      fiscalYearId,
      periodId,
      startDate: dateRange ? dateRange[0].format('YYYY-MM-DD') : undefined,
      endDate: dateRange ? dateRange[1].format('YYYY-MM-DD') : undefined,
    });
  };

  const periodOptions = selectedFiscalYear?.periods?.map((period) => ({
    value: period.id,
    label: `${dayjs(period.startDate).format('MMM YYYY')} - ${dayjs(period.endDate).format('MMM YYYY')}`,
  })) ?? [];

  return (
    <div>
      <Title level={4} style={{ marginTop: 0, marginBottom: 16 }}>
        General Ledger
      </Title>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Select
          placeholder="All Accounts"
          style={{ width: 240 }}
          value={accountId}
          onChange={setAccountId}
          loading={loadingFilters}
          showSearch
          optionFilterProp="label"
          options={accounts.map((a) => ({
            value: a.id,
            label: `${a.code} - ${a.name}`,
          }))}
          allowClear
        />
        <Select
          placeholder="Fiscal Year"
          style={{ width: 180 }}
          value={fiscalYearId}
          onChange={handleFiscalYearChange}
          loading={loadingFilters}
          options={fiscalYears.map((fy) => ({ value: fy.id, label: fy.name }))}
          allowClear
        />
        <Select
          placeholder="Period"
          style={{ width: 160 }}
          value={periodId}
          onChange={handlePeriodChange}
          disabled={!selectedFiscalYear}
          options={periodOptions}
          allowClear
        />
        <RangePicker
          value={dateRange}
          onChange={handleDateRangeChange}
          disabled={!!periodId || !!fiscalYearId}
          allowEmpty={[true, true]}
        />

        <Button type="primary" onClick={handleViewLedger} loading={loadingLedger}>
          View Ledger
        </Button>

        <Button type="primary" style={{ width: 110 }} onClick={() => exportGeneralLedger({
          businessUnitId: selectedBusinessUnit?.id,
          accountId, fiscalYearId, periodId,
          startDate: dateRange ? dateRange[0].format('YYYY-MM-DD') : undefined,
          endDate: dateRange ? dateRange[1].format('YYYY-MM-DD') : undefined,
        })}>
          Excel Report
        </Button>

      </div>

      {result ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
          <Text strong>Opening Balance: {formatAmount(result.openingBalance)}</Text>
          <Text strong>Closing Balance: {formatAmount(result.closingBalance)}</Text>
          <Text strong>Total Debits: {formatAmount(result.totalDebits)}</Text>
          <Text strong>Total Credits: {formatAmount(result.totalCredits)}</Text>
          <Text strong>Transactions: {result.transactionCount}</Text>
        </div>
      ) : loadingFilters || loadingLedger ? (
        <Spin />
      ) : (
        <Empty description="Report dekhne ke liye View Ledger dabayein." />
      )}

      {result && (
        <>
          <div style={{ marginBottom: 12 }}>
            <Text strong>
              {result.account ? `${result.account.code} - ${result.account.name}` : 'All Accounts'}
            </Text>{' '}
            <Text type="secondary">
              {result.account ? `(${result.account.accountType})` : '(Current Fiscal Year)'}
            </Text>
          </div>

          <Table
            dataSource={result.lines}
            rowKey="id"
            loading={loadingLedger}
            pagination={false}
            summary={() =>
              accountId ? (
                <>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={4}>
                      <Text strong>Opening Balance</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                      <Text strong>{formatAmount(result.openingBalance)}</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2}>
                      <Text strong>{formatAmount(result.closingBalance)}</Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </>
              ) : (
                <>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={4}>
                      <Text strong>Totals</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                      <Text strong>{formatAmount(result.totalDebits)}</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2}>
                      <Text strong>{formatAmount(result.totalCredits)}</Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </>
              )
            }
            columns={accountId ? [
              { title: 'Date', dataIndex: 'postingDate' },
              {
                title: 'Voucher',
                dataIndex: 'voucherNo',
                render: (voucherNo: string, record: GeneralLedgerResult['lines'][number]) => (
                  <Button
                    type="link"
                    style={{ padding: 0, height: 'auto' }}
                    onClick={() => navigate(`/finance/journal-entries/${record.journalId}`, { state: { from: '/reports/general-ledger' } })}
                  >
                    {voucherNo}
                  </Button>
                ),
              },
              { title: 'Description', dataIndex: 'description' },
              {
                title: 'Debit',
                dataIndex: 'debit',
                align: 'right',
                render: (v: number) => (v ? v.toLocaleString() : ''),
              },
              {
                title: 'Credit',
                dataIndex: 'credit',
                align: 'right',
                render: (v: number) => (v ? v.toLocaleString() : ''),
              },
              {
                title: 'Balance',
                dataIndex: 'balance',
                align: 'right',
                render: (v: number) => (v ? v.toLocaleString() : ''),
              },
            ] : [
              { title: 'Date', dataIndex: 'postingDate' },
              {
                title: 'Voucher',
                dataIndex: 'voucherNo',
                render: (voucherNo: string, record: GeneralLedgerResult['lines'][number]) => (
                  <Button
                    type="link"
                    style={{ padding: 0, height: 'auto' }}
                    onClick={() => navigate(`/finance/journal-entries/${record.journalId}`, { state: { from: '/reports/general-ledger' } })}
                  >
                    {voucherNo}
                  </Button>
                ),
              },
              {
                title: 'Account',
                dataIndex: 'account',
                render: (account: GeneralLedgerResult['lines'][number]['account']) => `${account.code} - ${account.name}`,
              },
              { title: 'Description', dataIndex: 'description' },
              {
                title: 'Debit',
                dataIndex: 'debit',
                align: 'right',
                render: (v: number) => (v ? v.toLocaleString() : ''),
              },
              {
                title: 'Credit',
                dataIndex: 'credit',
                align: 'right',
                render: (v: number) => (v ? v.toLocaleString() : ''),
              },
            ]}
          />
        </>
      )}
    </div>
  );
}

