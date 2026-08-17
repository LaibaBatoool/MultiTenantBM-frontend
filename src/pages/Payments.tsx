import { useEffect, useState } from 'react';
import { Button, Table, Typography, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { getPayments, type PaymentRecord } from '../api/payments';
import { useBusinessUnit } from '../context/BusinessUnitContext';

const { Title } = Typography;

export default function Payments() {
  const { selectedBusinessUnit } = useBusinessUnit();
  const navigate = useNavigate();

  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPayments = async () => {
    if (!selectedBusinessUnit?.id) {
      setPayments([]);
      return;
    }

    setLoading(true);

    try {
      const paymentList = await getPayments(selectedBusinessUnit.id);
      setPayments(paymentList);
    } catch (error) {
      message.error('Failed to load Payments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [selectedBusinessUnit]);

  const columns = [
    {
      title: 'Date',
      dataIndex: 'paymentDate',
      key: 'paymentDate',
      render: (value: string) => dayjs(value).format('YYYY-MM-DD'),
    },
    {
      title: 'Paid To / Company',
      dataIndex: 'paidTo',
      key: 'paidTo',
      render: (value: string | null) => value || '',
    },
    {
      title: 'Payment Account',
      key: 'paymentAccount',
      render: (_: unknown, record: PaymentRecord) =>
        record.paymentAccount
          ? `${record.paymentAccount.code} - ${record.paymentAccount.name}`
          : '',
    },
    {
      title: 'Expense / Other Account',
      key: 'expenseAccount',
      render: (_: unknown, record: PaymentRecord) =>
        record.expenseAccount
          ? `${record.expenseAccount.code} - ${record.expenseAccount.name}`
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
      render: (_: unknown, record: PaymentRecord) => record.journal?.voucherNo || '',
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
          Payments ({payments.length})
        </Title>

        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('add')}>
          Add New
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={payments}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}