import { useEffect, useState } from 'react';
import { Button, Table, Typography, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { getCapitalContributions, type CapitalContributionRecord } from '../api/capital-contributions';
import { useBusinessUnit } from '../context/BusinessUnitContext';

const { Title } = Typography;

export default function CapitalContributions() {
  const { selectedBusinessUnit } = useBusinessUnit();
  const navigate = useNavigate();

  const [contributions, setContributions] = useState<CapitalContributionRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const loadContributions = async () => {
    if (!selectedBusinessUnit?.id) {
      setContributions([]);
      return;
    }

    setLoading(true);

    try {
      const contributionList = await getCapitalContributions(selectedBusinessUnit.id);
      setContributions(contributionList);
    } catch (error) {
      message.error('Failed to load Capital Contributions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContributions();
  }, [selectedBusinessUnit]);

  const columns = [
    {
      title: 'Date',
      dataIndex: 'contributionDate',
      key: 'contributionDate',
      render: (value: string) => dayjs(value).format('DD-MMM-YYYY'),
    },
    {
      title: 'Voucher',
      key: 'voucher',
      render: (_: unknown, record: CapitalContributionRecord) => record.journal?.voucherNo || '',
    },
    {
      title: 'Contributor',
      dataIndex: 'contributor',
      key: 'contributor',
      render: (value: string | null) => value || '',
    },
    {
      title: 'Account',
      key: 'account',
      render: (_: unknown, record: CapitalContributionRecord) =>
        record.receivingAccount
          ? `${record.receivingAccount.code} - ${record.receivingAccount.name}`
          : '',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right' as const,
      render: (value: number) => Number(value).toLocaleString(),
    },
  ];

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          Capital Contributions ({contributions.length})
        </Title>

        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('add')}>
          Add New
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={contributions}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}