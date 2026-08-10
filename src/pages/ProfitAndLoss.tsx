import { useEffect, useState } from 'react';
import { Typography, Select, Button, DatePicker, Card, Row, Col, Statistic, Divider, message, Empty } from 'antd';
import dayjs from 'dayjs';
import { getFiscalYears, type FiscalYearRecord } from '../api/fiscalYears';
import { getProfitAndLoss, exportProfitAndLoss, type ProfitLossResult } from '../api/profitLoss';
import { useBusinessUnit } from '../context/BusinessUnitContext';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export default function ProfitAndLoss() {
    const { selectedBusinessUnit } = useBusinessUnit();

    const [fiscalYears, setFiscalYears] = useState<FiscalYearRecord[]>([]);
    const [fiscalYearId, setFiscalYearId] = useState<number | undefined>();
    const [periodId, setPeriodId] = useState<number | undefined>();
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

    const [result, setResult] = useState<ProfitLossResult | null>(null);
    const [loadingFilters, setLoadingFilters] = useState(false);
    const [loadingReport, setLoadingReport] = useState(false);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        if (selectedBusinessUnit?.id) {
            loadFiscalYears();
            setFiscalYearId(undefined);
            setPeriodId(undefined);
            setDateRange(null);
            setResult(null);
        }
    }, [selectedBusinessUnit]);

    const loadFiscalYears = async () => {
        setLoadingFilters(true);
        try {
            const data = await getFiscalYears(selectedBusinessUnit?.id);
            setFiscalYears(data);
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
        setDateRange(null);
    };

    const handlePeriodChange = (value: number | undefined) => {
        setPeriodId(value);
        setDateRange(null);
    };

    const handleDateRangeChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
        if (dates && dates[0] && dates[1]) {
            setDateRange([dates[0], dates[1]]);
            setFiscalYearId(undefined);
            setPeriodId(undefined);
        } else {
            setDateRange(null);
        }
    };

    const buildParams = () => ({
        businessUnitId: selectedBusinessUnit?.id,
        fiscalYearId,
        periodId,
        startDate: dateRange ? dateRange[0].format('YYYY-MM-DD') : undefined,
        endDate: dateRange ? dateRange[1].format('YYYY-MM-DD') : undefined,
    });

    const handleViewReport = async () => {
        if (!fiscalYearId && !periodId && !dateRange) {
            message.warning('Report dekhne ke liye Fiscal Year, Period, ya Date Range select karein.');
            return;
        }
        setLoadingReport(true);
        try {
            const data = await getProfitAndLoss(buildParams());
            setResult(data);
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Profit & Loss load nahi ho saka.');
            setResult(null);
        } finally {
            setLoadingReport(false);
        }
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            await exportProfitAndLoss(buildParams());
        } catch (error) {
            message.error('Excel export nahi ho saka.');
        } finally {
            setExporting(false);
        }
    };

    return (
        <div>
            <Title level={4} style={{ marginTop: 0, marginBottom: 16 }}>
                Profit &amp; Loss
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

                <RangePicker
                    value={dateRange}
                    onChange={handleDateRangeChange}
                    disabled={!!periodId || !!fiscalYearId}
                    allowEmpty={[true, true]}
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
                <Empty description="Select filters and press 'View Report'" />
            ) : (
                <>
                    <Text type="secondary">{result.periodLabel}</Text>

                    <Card style={{ marginTop: 12, maxWidth: 640 }}>
                        <Text strong style={{ fontSize: 15 }}>Revenue</Text>
                        {result.revenue.map((r) => (
                            <Row key={r.accountId} style={{ padding: '4px 0 4px 16px' }}>
                                <Col span={18}>{r.code} - {r.name}</Col>
                                <Col span={6} style={{ textAlign: 'right' }}>{r.amount.toLocaleString()}</Col>
                            </Row>
                        ))}
                        <Row style={{ padding: '6px 0', borderTop: '1px solid #f0f0f0', marginTop: 4 }}>
                            <Col span={18}><Text strong>Total Revenue</Text></Col>
                            <Col span={6} style={{ textAlign: 'right' }}><Text strong>{result.totalRevenue.toLocaleString()}</Text></Col>
                        </Row>

                        <Divider style={{ margin: '16px 0' }} />

                        <Text strong style={{ fontSize: 15 }}>Cost of Goods Sold</Text>
                        {result.cogs.map((item) => (
                            <Row key={item.accountId} style={{ padding: '4px 0 4px 16px' }}>
                                <Col span={18}>{item.code} - {item.name}</Col>
                                <Col span={6} style={{ textAlign: 'right' }}>({item.amount.toLocaleString()})</Col>
                            </Row>
                        ))}
                        <Row style={{ padding: '6px 0', borderTop: '1px solid #f0f0f0', marginTop: 4 }}>
                            <Col span={18}><Text strong>Total COGS</Text></Col>
                            <Col span={6} style={{ textAlign: 'right' }}><Text strong>({result.totalCOGS.toLocaleString()})</Text></Col>
                        </Row>

                        <Divider style={{ margin: '16px 0' }} />

                        <Row>
                            <Col span={18}><Text strong style={{ fontSize: 16 }}>Gross Profit</Text></Col>
                            <Col span={6} style={{ textAlign: 'right' }}>
                                <Statistic
                                    value={result.grossProfit}
                                    precision={0}
                                    styles={{
                                        content: {
                                            fontSize: 16,
                                            color: result.grossProfit >= 0 ? '#3f8600' : '#cf1322',
                                        },
                                    }}
                                />
                            </Col>
                        </Row>

                        <Divider style={{ margin: '16px 0' }} />

                        <Text strong style={{ fontSize: 15 }}>Operating Expenses</Text>
                        {result.operatingExpenses.map((item) => (
                            <Row key={item.accountId} style={{ padding: '4px 0 4px 16px' }}>
                                <Col span={18}>{item.code} - {item.name}</Col>
                                <Col span={6} style={{ textAlign: 'right' }}>({item.amount.toLocaleString()})</Col>
                            </Row>
                        ))}
                        <Row style={{ padding: '6px 0', borderTop: '1px solid #f0f0f0', marginTop: 4 }}>
                            <Col span={18}><Text strong>Total Operating Expenses</Text></Col>
                            <Col span={6} style={{ textAlign: 'right' }}><Text strong>({result.totalOperatingExpenses.toLocaleString()})</Text></Col>
                        </Row>

                        <Divider style={{ margin: '16px 0' }} />

                        <Row>
                            <Col span={18}><Text strong style={{ fontSize: 16 }}>Net Profit</Text></Col>
                            <Col span={6} style={{ textAlign: 'right' }}>
                                <Statistic
                                    value={result.netProfit}
                                    precision={0}
                                    valueStyle={{
                                        fontSize: 16,
                                        color: result.netProfit >= 0 ? '#3f8600' : '#cf1322',
                                    }}
                                />
                            </Col>
                        </Row>
                    </Card>
                </>
            )}
        </div>
    );
}