import { useEffect, useState } from 'react';
import { Button, Table, Typography, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { getTransfers, type TransferRecord } from '../api/transfers';
import { useBusinessUnit } from '../context/BusinessUnitContext';

const { Title } = Typography;

export default function Transfers() {
  const { selectedBusinessUnit } = useBusinessUnit();
  const navigate = useNavigate();

  const [transfers, setTransfers] = useState<TransferRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTransfers = async () => {
    if (!selectedBusinessUnit?.id) {
      setTransfers([]);
      return;
    }

    setLoading(true);

    try {
      const transferList = await getTransfers(selectedBusinessUnit.id);
      setTransfers(transferList);
    } catch (error) {
      message.error('Failed to load Transfers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransfers();
  }, [selectedBusinessUnit]);

  const columns = [
    {
      title: 'Date',
      dataIndex: 'transferDate',
      key: 'transferDate',
      render: (value: string) => dayjs(value).format('YYYY-MM-DD'),
    },
    {
      title: 'From Account',
      key: 'fromAccount',
      render: (_: unknown, record: TransferRecord) =>
        record.fromAccount ? `${record.fromAccount.code} - ${record.fromAccount.name}` : '',
    },
    {
      title: 'To Account',
      key: 'toAccount',
      render: (_: unknown, record: TransferRecord) =>
        record.toAccount ? `${record.toAccount.code} - ${record.toAccount.name}` : '',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right' as const,
      render: (value: number) => value.toLocaleString(),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (value: string | null) => value || '',
    },
    {
      title: 'Voucher',
      key: 'voucher',
      render: (_: unknown, record: TransferRecord) => record.journal?.voucherNo || '',
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
          Transfers ({transfers.length})
        </Title>

        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('add')}>
          Add New
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={transfers}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}