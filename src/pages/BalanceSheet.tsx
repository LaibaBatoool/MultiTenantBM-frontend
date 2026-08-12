import { useEffect, useState } from 'react';
import { Typography, Select, Button, DatePicker, Card, Row, Col, Tag, Divider, message, Spin } from 'antd';
import dayjs from 'dayjs';
import { getFiscalYears, type FiscalYearRecord } from '../api/fiscalYears';
import { getBalanceSheet, exportBalanceSheet, type BalanceSheetResult } from '../api/balanceSheet';
import { useBusinessUnit } from '../context/BusinessUnitContext';

const { Title, Text } = Typography;

export default function BalanceSheet() {
  const { selectedBusinessUnit } = useBusinessUnit();

  const [fiscalYears, setFiscalYears] = useState<FiscalYearRecord[]>([]);
  const [fiscalYearId, setFiscalYearId] = useState<number | undefined>();
  const [periodId, setPeriodId] = useState<number | undefined>();
  const [asOfDate, setAsOfDate] = useState<dayjs.Dayjs | null>(null);

  const [result, setResult] = useState<BalanceSheetResult | null>(null);
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
      const data = await getBalanceSheet({
        businessUnitId: selectedBusinessUnit.id,
        fiscalYearId: params?.fiscalYearId,
        periodId: params?.periodId,
        asOfDate: params?.asOfDate,
      });
      setResult(data);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Balance Sheet load nahi ho saka.');
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
      await exportBalanceSheet({ businessUnitId: selectedBusinessUnit?.id, ...buildParams() });
    } catch (error) {
      message.error('Excel export nahi ho saka.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <Title level={4} style={{ marginTop: 0, marginBottom: 16 }}>
        Balance Sheet
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
          <Text type="secondary">{result.periodLabel}</Text>

          <Card style={{ marginTop: 12, maxWidth: 640 }}>
            <Text strong style={{ fontSize: 15 }}>Assets</Text>
            {result.assets.sections.map((section) => (
              <div key={section.name} style={{ marginTop: 8 }}>
                <Text type="secondary" style={{ paddingLeft: 8 }}>{section.name}</Text>
                {section.accounts.map((a) => (
                  <Row key={a.accountId} style={{ padding: '4px 0 4px 24px' }}>
                    <Col span={18}>{a.code} - {a.name}</Col>
                    <Col span={6} style={{ textAlign: 'right' }}>{a.amount.toLocaleString()}</Col>
                  </Row>
                ))}
                <Row style={{ padding: '2px 0 2px 8px' }}>
                  <Col span={18}><Text strong>Total {section.name}</Text></Col>
                  <Col span={6} style={{ textAlign: 'right' }}><Text strong>{section.total.toLocaleString()}</Text></Col>
                </Row>
              </div>
            ))}
            <Row style={{ padding: '6px 0', borderTop: '1px solid #f0f0f0', marginTop: 8 }}>
              <Col span={18}><Text strong>Total Assets</Text></Col>
              <Col span={6} style={{ textAlign: 'right' }}><Text strong>{result.assets.total.toLocaleString()}</Text></Col>
            </Row>

            <Divider style={{ margin: '16px 0' }} />

            <Text strong style={{ fontSize: 15 }}>Liabilities</Text>
            {result.liabilities.sections.map((section) => (
              <div key={section.name} style={{ marginTop: 8 }}>
                <Text type="secondary" style={{ paddingLeft: 8 }}>{section.name}</Text>
                {section.accounts.map((a) => (
                  <Row key={a.accountId} style={{ padding: '4px 0 4px 24px' }}>
                    <Col span={18}>{a.code} - {a.name}</Col>
                    <Col span={6} style={{ textAlign: 'right' }}>{a.amount.toLocaleString()}</Col>
                  </Row>
                ))}
              </div>
            ))}
            <Row style={{ padding: '6px 0', borderTop: '1px solid #f0f0f0', marginTop: 8 }}>
              <Col span={18}><Text strong>Total Liabilities</Text></Col>
              <Col span={6} style={{ textAlign: 'right' }}><Text strong>{result.liabilities.total.toLocaleString()}</Text></Col>
            </Row>

            <Divider style={{ margin: '16px 0' }} />

            <Text strong style={{ fontSize: 15 }}>Equity</Text>
            {result.equity.accounts.map((a) => (
              <Row key={a.accountId} style={{ padding: '4px 0 4px 16px' }}>
                <Col span={18}>{a.code} - {a.name}</Col>
                <Col span={6} style={{ textAlign: 'right' }}>{a.amount.toLocaleString()}</Col>
              </Row>
            ))}
            <Row style={{ padding: '4px 0 4px 16px' }}>
              <Col span={18}>Current Year Profit</Col>
              <Col span={6} style={{ textAlign: 'right' }}>{result.equity.currentYearProfit.toLocaleString()}</Col>
            </Row>
            <Row style={{ padding: '6px 0', borderTop: '1px solid #f0f0f0', marginTop: 4 }}>
              <Col span={18}><Text strong>Total Equity</Text></Col>
              <Col span={6} style={{ textAlign: 'right' }}><Text strong>{result.equity.total.toLocaleString()}</Text></Col>
            </Row>

            <Divider style={{ margin: '16px 0' }} />

            <Row>
              <Col span={18}><Text strong style={{ fontSize: 16 }}>Total Liabilities + Equity</Text></Col>
              <Col span={6} style={{ textAlign: 'right' }}><Text strong style={{ fontSize: 16 }}>{result.totalLiabilitiesAndEquity.toLocaleString()}</Text></Col>
            </Row>
          </Card>

          <Card size="small" style={{ marginTop: 16, maxWidth: 640 }}>
            <Row gutter={16} align="middle">
              <Col span={7}>
                <Text type="secondary">Total Assets</Text>
                <div><Text strong>{result.assets.total.toLocaleString()}</Text></div>
              </Col>
              <Col span={8}>
                <Text type="secondary">Liabilities + Equity</Text>
                <div><Text strong>{result.totalLiabilitiesAndEquity.toLocaleString()}</Text></div>
              </Col>
              <Col span={5}>
                <Text type="secondary">Difference</Text>
                <div><Text strong>{result.difference.toLocaleString()}</Text></div>
              </Col>
              <Col span={4}>
                <Tag color={result.isBalanced ? 'green' : 'red'} style={{ fontSize: 13, padding: '4px 10px' }}>
                  {result.isBalanced ? 'Balanced' : 'Not Balanced'}
                </Tag>
              </Col>
            </Row>
          </Card>
        </>
      )}
    </div>
  );
}