import { useEffect, useState } from 'react';
import { Button, Card, Col, Progress, Row, Select, Statistic, Table, Tag, Typography, message } from 'antd';
import dayjs from 'dayjs';

import { getProjects, type ProjectRecord } from '../api/projects';
import { useBusinessUnit } from '../context/BusinessUnitContext';
import { getProjectProfitability, exportProjectProfitability, type ProjectProfitabilityReport } from '../api/project-profitability';

const { Title, Text } = Typography;

export default function ProjectProfitability() {
  const { selectedBusinessUnit } = useBusinessUnit();

  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number>();
  const [report, setReport] = useState<ProjectProfitabilityReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const loadProjects = async () => {
    if (!selectedBusinessUnit?.id) {
      setProjects([]);
      return;
    }

    try {
      const projectList = await getProjects(selectedBusinessUnit.id);
      setProjects(projectList);
      if (projectList.length > 0 && !selectedProjectId) {
        setSelectedProjectId(projectList[0].id);
      }
    } catch (error) {
      message.error('Failed to load projects.');
    }
  };

  const loadReport = async () => {
    if (!selectedProjectId || !selectedBusinessUnit?.id) {
      setReport(null);
      return;
    }

    setLoading(true);

    try {
      const data = await getProjectProfitability(selectedProjectId, selectedBusinessUnit.id);
      setReport(data);
    } catch (error) {
      message.error('Failed to load project profitability report.');
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [selectedBusinessUnit]);

  useEffect(() => {
    loadReport();
  }, [selectedProjectId, selectedBusinessUnit]);

  const handleExport = async () => {
    if (!selectedProjectId || !selectedBusinessUnit?.id) return;
    setExporting(true);
    try {
      await exportProjectProfitability(selectedProjectId, selectedBusinessUnit.id);
    } catch (error) {
      message.error('Excel export failed.');
    } finally {
      setExporting(false);
    }
  };

  const transactionColumns = [
    {
      title: 'Date',
      dataIndex: 'postingDate',
      key: 'postingDate',
      render: (value: string) => dayjs(value).format('DD-MMM-YYYY'),
    },
    { title: 'Voucher', dataIndex: 'voucherNo', key: 'voucherNo' },
    {
      title: 'Account',
      key: 'account',
      render: (_: unknown, record: ProjectProfitabilityReport['transactions'][number]) =>
        `${record.account.code} - ${record.account.name}`,
    },
    {
      title: 'Type',
      key: 'accountType',
      render: (_: unknown, record: ProjectProfitabilityReport['transactions'][number]) => (
        <Tag color={record.account.accountType === 'REVENUE' ? 'green' : 'volcano'}>
          {record.account.accountType}
        </Tag>
      ),
    },
    { title: 'Description', dataIndex: 'description', key: 'description', render: (v: string | null) => v || '' },
    {
      title: 'Debit',
      dataIndex: 'debit',
      key: 'debit',
      align: 'right' as const,
      render: (value: number) => (value ? value.toLocaleString() : ''),
    },
    {
      title: 'Credit',
      dataIndex: 'credit',
      key: 'credit',
      align: 'right' as const,
      render: (value: number) => (value ? value.toLocaleString() : ''),
    },
  ];

  const accountColumns = [
    {
      title: 'Account',
      key: 'account',
      render: (_: unknown, record: { code: string; name: string }) => `${record.code} - ${record.name}`,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right' as const,
      render: (value: number) => value.toLocaleString(),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <Title level={3} style={{ margin: 0 }}>
          Project Profitability
        </Title>

        <div style={{ display: 'flex', gap: 12 }}>
          <Select
            showSearch
            style={{ minWidth: 280 }}
            placeholder="Select a project"
            value={selectedProjectId}
            onChange={setSelectedProjectId}
            options={projects.map((project) => ({
              value: project.id,
              label: `${project.code} - ${project.name}`,
            }))}
            filterOption={(input, option) =>
              String(option?.label || '').toLowerCase().includes(input.toLowerCase())
            }
          />
          <Button type="primary" style={{ width: 110 }} onClick={handleExport} loading={exporting} disabled={!report}>
            Excel
          </Button>
        </div>
      </div>

      {!report && !loading && (
        <Text type="secondary">Select a project to view its profitability report.</Text>
      )}

      {report && (
        <>
          <Card
            loading={loading}
            style={{ marginBottom: 24 }}
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>
                  {report.project.code} - {report.project.name}
                  {report.project.customer ? ` (${report.project.customer.name})` : ''}
                </span>
                <Tag>{report.project.status}</Tag>
              </div>
            }
          >
            <Row gutter={[24, 24]}>
              <Col xs={12} md={6}>
                <Statistic title="Revenue" value={report.revenue.total} precision={0} valueStyle={{ fontSize: 20, fontWeight: 600, }} />
              </Col>
              <Col xs={12} md={6}>
                <Statistic title="Costs" value={report.costs.total} precision={0} valueStyle={{ fontSize: 20, fontWeight: 600, }} />
              </Col>
              <Col xs={12} md={6}>
                <Statistic
                  title="Profit"
                  value={report.profit}
                  precision={0}
                  valueStyle={{ fontSize: 20, fontWeight: 600, color: report.profit >= 0 ? '#3f8600' : '#cf1322' }}
                />
              </Col>
              <Col xs={12} md={6}>
                <Statistic title="Profit Margin" value={report.profitMargin} precision={1} suffix="%" valueStyle={{ fontSize: 20, fontWeight: 600, }} />
              </Col>
            </Row>

            {report.budget !== null && (
              <Row gutter={[24, 24]} style={{ marginTop: 16 }}>
                <Col xs={12} md={6}>
                  <Statistic title="Budget" value={report.budget} precision={0} />
                </Col>
                <Col xs={12} md={6}>
                  <Statistic title="Actual Cost" value={report.actualCost} precision={0} />
                </Col>
                <Col xs={12} md={6}>
                  <Statistic
                    title="Remaining Budget"
                    value={report.remainingBudget ?? 0}
                    precision={0}
                    valueStyle={{ color: (report.remainingBudget ?? 0) >= 0 ? '#3f8600' : '#cf1322' }}
                  />
                </Col>
                <Col xs={24} md={6}>
                  <Text type="secondary">Budget Utilization</Text>
                  <Progress
                    percent={
                      report.budget ? Math.min(100, Math.round((report.actualCost / report.budget) * 100)) : 0
                    }
                    status={report.actualCost > (report.budget || 0) ? 'exception' : 'active'}
                  />
                </Col>
              </Row>
            )}
          </Card>

          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col xs={24} md={12}>
              <Card title="Revenue by Account">
                <Table
                  columns={accountColumns}
                  dataSource={report.revenue.byAccount}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title="Costs by Account">
                <Table
                  columns={accountColumns}
                  dataSource={report.costs.byAccount}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              </Card>
            </Col>
          </Row>

          <Card title="Transactions">
            <Table
              columns={transactionColumns}
              dataSource={report.transactions}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              size="small"
            />
          </Card>
        </>
      )}
    </div>
  );
}