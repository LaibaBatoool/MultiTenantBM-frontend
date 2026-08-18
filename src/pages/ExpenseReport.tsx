import { useEffect, useState } from 'react';
import { Button, Card, Col, DatePicker, Row, Select, Statistic, Table, Typography, message } from 'antd';
import dayjs from 'dayjs';

import { getExpenseReport, exportExpenseReport, type ExpenseReportResult } from '../api/expenseReport';
import { getAccounts, type AccountRecord } from '../api/accounts';
import { getProjects, type ProjectRecord } from '../api/projects';
import { getFiscalYears, type FiscalYearRecord } from '../api/fiscalYears';
import { useBusinessUnit } from '../context/BusinessUnitContext';

const { Title } = Typography;
const { RangePicker } = DatePicker;

export default function ExpenseReport() {
  const { selectedBusinessUnit } = useBusinessUnit();

  const [accounts, setAccounts] = useState<AccountRecord[]>([]);
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [fiscalYears, setFiscalYears] = useState<FiscalYearRecord[]>([]);

  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [fiscalYearId, setFiscalYearId] = useState<number>();
  const [periodId, setPeriodId] = useState<number>();
  const [expenseAccountId, setExpenseAccountId] = useState<number>();
  const [projectId, setProjectId] = useState<number>();
  const [vendorName, setVendorName] = useState<string>();
  const [paymentAccountId, setPaymentAccountId] = useState<number>();

  const [report, setReport] = useState<ExpenseReportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const loadFilters = async () => {
    if (!selectedBusinessUnit?.id) return;
    try {
      const [accountList, projectList, years] = await Promise.all([
        getAccounts(selectedBusinessUnit.id),
        getProjects(selectedBusinessUnit.id),
        getFiscalYears(selectedBusinessUnit.id),
      ]);
      setAccounts(accountList);
      setProjects(projectList);
      setFiscalYears(years);
    } catch (error) {
      message.error('Failed to load filters.');
    }
  };

  const buildParams = () => ({
    businessUnitId: selectedBusinessUnit?.id,
    startDate: dateRange?.[0]?.format('YYYY-MM-DD'),
    endDate: dateRange?.[1]?.format('YYYY-MM-DD'),
    fiscalYearId,
    periodId,
    expenseAccountId,
    projectId,
    vendorName,
    paymentAccountId,
  });

  const loadReport = async () => {
    if (!selectedBusinessUnit?.id) {
      setReport(null);
      return;
    }
    setLoading(true);
    try {
      const data = await getExpenseReport(buildParams());
      setReport(data);
    } catch (error) {
      message.error('Failed to load expense report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFilters();
  }, [selectedBusinessUnit]);

  useEffect(() => {
    loadReport();
  }, [selectedBusinessUnit]);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportExpenseReport(buildParams());
    } catch (error) {
      message.error('Excel export failed.');
    } finally {
      setExporting(false);
    }
  };

  const expenseAccounts = accounts.filter(
    (account) => !account.isGroup && (account.accountType === 'EXPENSE' || account.accountType === 'COGS'),
  );

  const paymentAccounts = accounts.filter((account) => !account.isGroup);

  const selectedFiscalYear = fiscalYears.find((year) => year.id === fiscalYearId);

  const rowColumns = [
    { title: 'Date', dataIndex: 'expenseDate', key: 'expenseDate', render: (v: string) => dayjs(v).format('DD-MMM') },
    { title: 'Voucher', dataIndex: 'voucherNo', key: 'voucherNo' },
    { title: 'Expense', dataIndex: 'description', key: 'description', render: (v: string) => v || '' },
    {
      title: 'Account',
      key: 'account',
      render: (_: unknown, row: ExpenseReportResult['rows'][number]) =>
        row.expenseAccount ? row.expenseAccount.name : '',
    },
    {
      title: 'Project',
      key: 'project',
      render: (_: unknown, row: ExpenseReportResult['rows'][number]) =>
        row.project ? row.project.name : '—',
    },
    {
      title: 'Paid From',
      key: 'paymentAccount',
      render: (_: unknown, row: ExpenseReportResult['rows'][number]) =>
        row.paymentAccount ? row.paymentAccount.name : '',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right' as const,
      render: (v: number) => v.toLocaleString(),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          Expense Report
        </Title>

        <div style={{ display: 'flex', gap: 8 }}>
          <Button type="primary" onClick={loadReport} loading={loading}>
            Show Report
          </Button>

          <Button type='primary' style={{ width: 110 }} onClick={handleExport} loading={exporting}>
            Excel
          </Button>
        </div>
      </div>

      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={[12, 12]}>
          <Col xs={24} md={6}>
            <RangePicker style={{ width: '100%' }} onChange={(v) => setDateRange(v as any)} />
          </Col>
          <Col xs={24} md={5}>
            <Select
              allowClear
              style={{ width: '100%' }}
              placeholder="Fiscal Year"
              value={fiscalYearId}
              onChange={(v) => {
                setFiscalYearId(v);
                setPeriodId(undefined);
              }}
              options={fiscalYears.map((year) => ({ value: year.id, label: year.name }))}
            />
          </Col>
          <Col xs={24} md={5}>
            <Select
              allowClear
              style={{ width: '100%' }}
              placeholder="Period"
              value={periodId}
              onChange={setPeriodId}
              disabled={!selectedFiscalYear}
              options={(selectedFiscalYear?.periods || []).map((p) => ({
                value: p.id,
                label: dayjs(p.startDate).format('MMM YYYY'),
              }))}
            />
          </Col>
          <Col xs={24} md={4}>
            <Select
              allowClear
              showSearch
              style={{ width: '100%' }}
              placeholder="Expense Account"
              value={expenseAccountId}
              onChange={setExpenseAccountId}
              options={expenseAccounts.map((a) => ({ value: a.id, label: `${a.code} - ${a.name}` }))}
              filterOption={(input, option) =>
                String(option?.label || '').toLowerCase().includes(input.toLowerCase())
              }
            />
          </Col>
          <Col xs={24} md={4}>
            <Select
              allowClear
              showSearch
              style={{ width: '100%' }}
              placeholder="Project"
              value={projectId}
              onChange={setProjectId}
              options={projects.map((p) => ({ value: p.id, label: `${p.code} - ${p.name}` }))}
              filterOption={(input, option) =>
                String(option?.label || '').toLowerCase().includes(input.toLowerCase())
              }
            />
          </Col>
        </Row>
        <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
          <Col xs={24} md={6}>
            <Select
              allowClear
              showSearch
              style={{ width: '100%' }}
              placeholder="Payment Account"
              value={paymentAccountId}
              onChange={setPaymentAccountId}
              options={paymentAccounts.map((a) => ({ value: a.id, label: `${a.code} - ${a.name}` }))}
              filterOption={(input, option) =>
                String(option?.label || '').toLowerCase().includes(input.toLowerCase())
              }
            />
          </Col>
          <Col xs={24} md={6}>
            <Select
              allowClear
              showSearch
              style={{ width: '100%' }}
              placeholder="Vendor / Company"
              value={vendorName}
              onChange={setVendorName}
              options={[]}
              onSearch={setVendorName}
              filterOption={false}
              notFoundContent={null}
              open={false}
            />
          </Col>
        </Row>

      </Card>

      {report && (
        <>
          <Card size="small" style={{ marginBottom: 16 }}>
            <Row gutter={[16, 16]}>
              <Col xs={12} md={4.8 as any}>
                <Statistic title="Total Expenses" value={report.summary.totalExpenses} precision={0} valueStyle={{ fontSize: 18, fontWeight: 600 }} />
              </Col>
              <Col xs={12} md={4.8 as any}>
                <Statistic title="This Period" value={report.summary.thisPeriod} precision={0} valueStyle={{ fontSize: 18, fontWeight: 600 }} />
              </Col>
              <Col xs={12} md={4.8 as any}>
                <Statistic title="Project Expenses" value={report.summary.projectExpenses} precision={0} valueStyle={{ fontSize: 18, fontWeight: 600 }} />
              </Col>
              <Col xs={12} md={4.8 as any}>
                <Statistic title="Other Expenses" value={report.summary.otherExpenses} precision={0} valueStyle={{ fontSize: 18, fontWeight: 600 }} />
              </Col>
              <Col xs={12} md={4.8 as any}>
                <Statistic title="Transactions" value={report.summary.transactionCount} valueStyle={{ fontSize: 18, fontWeight: 600 }} />
              </Col>
            </Row>
          </Card>

          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col xs={24} md={12}>
              <Card title="Expenses by Category" size="small">
                <Table
                  size="small"
                  pagination={false}
                  rowKey="id"
                  dataSource={report.byCategory}
                  columns={[
                    { title: 'Category', key: 'name', render: (_: unknown, r: any) => r.name },
                    { title: 'Amount', dataIndex: 'amount', align: 'right' as const, render: (v: number) => v.toLocaleString() },
                  ]}
                />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title="Expenses by Project" size="small">
                <Table
                  size="small"
                  pagination={false}
                  rowKey="label"
                  dataSource={report.byProject}
                  columns={[
                    { title: 'Project', dataIndex: 'label' },
                    { title: 'Amount', dataIndex: 'amount', align: 'right' as const, render: (v: number) => v.toLocaleString() },
                  ]}
                />
              </Card>
            </Col>
          </Row>

          <Card title="Transactions" size="small">
            <Table
              size="small"
              loading={loading}
              rowKey="id"
              dataSource={report.rows}
              columns={rowColumns}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </>
      )}
    </div>
  );
}