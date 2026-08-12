import { useEffect, useState } from 'react';
import { Typography, Select, Button, Table, DatePicker, Card, Row, Col, Statistic, Tag, message, Spin } from 'antd';
import dayjs from 'dayjs';
import { getFiscalYears, type FiscalYearRecord } from '../api/fiscalYears';
import { getTrialBalance, exportTrialBalance, type TrialBalanceResult } from '../api/trialBalance';
import { useBusinessUnit } from '../context/BusinessUnitContext';

const { Title, Text } = Typography;

export default function TrialBalance() {
  const { selectedBusinessUnit } = useBusinessUnit();

  const [fiscalYears, setFiscalYears] = useState<FiscalYearRecord[]>([]);
  const [fiscalYearId, setFiscalYearId] = useState<number | undefined>();
  const [periodId, setPeriodId] = useState<number | undefined>();
  const [asOfDate, setAsOfDate] = useState<dayjs.Dayjs | null>(null);

  const [result, setResult] = useState<TrialBalanceResult | null>(null);
  const [loadingFilters, setLoadingFilters] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);
  const [exporting, setExporting] = useState(false);

  const fetchReport = async (params?: {
    fiscalYearId?: number;
    periodId?: number;
    asOfDate?: string;
  }) => {
    if (!selectedBusinessUnit?.id) return;
    setLoadingReport(true);
    try {
      const data = await getTrialBalance({
        businessUnitId: selectedBusinessUnit.id,
        fiscalYearId: params?.fiscalYearId,
        periodId: params?.periodId,
        asOfDate: params?.asOfDate,
      });
      setResult(data);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Trial Balance load nahi ho saka.');
      setResult(null);
    } finally {
      setLoadingReport(false);
    }
  };

  useEffect(() => {
    if (selectedBusinessUnit?.id) {
      void loadFiscalYears();
      setFiscalYearId(undefined);
      setPeriodId(undefined);
      setAsOfDate(null);
      setResult(null);
    }
  }, [selectedBusinessUnit]);

  const loadFiscalYears = async () => {
    setLoadingFilters(true);
    try {
      const data = await getFiscalYears(selectedBusinessUnit?.id);
      setFiscalYears(data);

      const today = dayjs();
      setAsOfDate(today);
      setFiscalYearId(undefined);
      setPeriodId(undefined);

      await fetchReport({ asOfDate: today.format('YYYY-MM-DD') });
    } catch (error) {
      message.error('Fiscal years load nahi ho sakay.');
    } finally {
      setLoadingFilters(false);
    }
  };

  const selectedFiscalYear = fiscalYears.find((fy) => fy.id === fiscalYearId);

  const handleFiscalYearChange = (value: number | undefined) => {
    setFiscalYearId(value);
    setPeriodId(undefined);
    setAsOfDate(null);
  };

  const handlePeriodChange = (value: number | undefined) => {
    setPeriodId(value);
    setAsOfDate(null);
  };

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    setAsOfDate(date);
    setFiscalYearId(undefined);
    setPeriodId(undefined);
  };

  const buildParams = () => ({
    fiscalYearId,
    periodId,
    asOfDate: asOfDate ? asOfDate.format('YYYY-MM-DD') : undefined,
  });

  const handleViewReport = async () => {
    await fetchReport(buildParams());
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportTrialBalance({ businessUnitId: selectedBusinessUnit?.id, ...buildParams() });
    } catch (error) {
      message.error('Excel export nahi ho saka.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <Title level={4} style={{ marginTop: 0, marginBottom: 16 }}>
        Trial Balance
      </Title>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 16 }}>
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
          options={(selectedFiscalYear?.periods || []).map((p) => ({
            value: p.id,
            label: dayjs(p.startDate).format('MMM YYYY'),
          }))}
          allowClear
        />

        <DatePicker
          placeholder="As Of Date"
          value={asOfDate}
          onChange={handleDateChange}
          disabled={!!periodId || !!fiscalYearId}
        />

        <Button type="primary" onClick={handleViewReport} loading={loadingReport}>
          View Report
        </Button>

        {result && (
          <Button type="primary" style={{ width: 110 }} onClick={handleExport} loading={exporting}>
            Excel
          </Button>
        )}
      </div>

      {!result ? (
        loadingFilters || loadingReport ? <Spin /> : null
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
            <Text strong>Total Accounts: {result.totalAccounts}</Text>
            <Text strong>Debit Balance: {result.totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
            <Text strong>Credit Balance: {result.totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
            <Text strong>Difference: {result.difference.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
            <Text strong>
              Status: <Tag color={result.isBalanced ? 'green' : 'red'} style={{ marginLeft: 4 }}>{result.isBalanced ? 'Balanced' : 'Not Balanced'}</Tag>
            </Text>
          </div>

          <Text type="secondary">
            {result.periodLabel || `As of ${result.asOfDate}`}
          </Text>

          <Table
            style={{ marginTop: 8 }}
            dataSource={result.accounts}
            rowKey="accountId"
            loading={loadingReport}
            pagination={false}
            summary={() => (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0}>
                  <Text strong>TOTAL</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1}>
                  <Text strong>{result.totalDebit.toLocaleString()}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2}>
                  <Text strong>{result.totalCredit.toLocaleString()}</Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            )}
            columns={[
              {
                title: 'Account',
                dataIndex: 'name',
                render: (_: string, record) => `${record.code} - ${record.name}`,
              },
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