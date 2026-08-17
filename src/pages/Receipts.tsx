import { useEffect, useState } from 'react';
import { Button, Table, Typography, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { getReceipts, type ReceiptRecord } from '../api/receipts';
import { useBusinessUnit } from '../context/BusinessUnitContext';

const { Title } = Typography;

export default function Receipts() {
  const { selectedBusinessUnit } = useBusinessUnit();
  const navigate = useNavigate();

  const [receipts, setReceipts] = useState<ReceiptRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const loadReceipts = async () => {
    if (!selectedBusinessUnit?.id) {
      setReceipts([]);
      return;
    }

    setLoading(true);

    try {
      const receiptList = await getReceipts(selectedBusinessUnit.id);
      setReceipts(receiptList);
    } catch (error) {
      message.error('Failed to load Receipts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReceipts();
  }, [selectedBusinessUnit]);

  const columns = [
    {
      title: 'Date',
      dataIndex: 'receiptDate',
      key: 'receiptDate',
      render: (value: string) => dayjs(value).format('YYYY-MM-DD'),
    },
    {
      title: 'Received From',
      dataIndex: 'receivedFrom',
      key: 'receivedFrom',
      render: (value: string | null) => value || '',
    },
    {
      title: 'Receiving Account',
      key: 'receivingAccount',
      render: (_: unknown, record: ReceiptRecord) =>
        record.receivingAccount
          ? `${record.receivingAccount.code} - ${record.receivingAccount.name}`
          : '',
    },
    {
      title: 'Against Account',
      key: 'againstAccount',
      render: (_: unknown, record: ReceiptRecord) =>
        record.againstAccount
          ? `${record.againstAccount.code} - ${record.againstAccount.name}`
          : '',
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
      render: (_: unknown, record: ReceiptRecord) => record.journal?.voucherNo || '',
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
          Receipts ({receipts.length})
        </Title>

        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('add')}>
          Add New
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={receipts}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}