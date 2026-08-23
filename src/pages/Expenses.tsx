import { useEffect, useState } from 'react';
import { Button, Table, Typography, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { getExpenses, type ExpenseRecord } from '../api/expenses';
import { useBusinessUnit } from '../context/BusinessUnitContext';

const { Title } = Typography;

export default function Expenses() {
  const { selectedBusinessUnit } = useBusinessUnit();
  const navigate = useNavigate();

  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const loadExpenses = async () => {
    if (!selectedBusinessUnit?.id) {
      setExpenses([]);
      return;
    }

    setLoading(true);

    try {
      const expenseList = await getExpenses(selectedBusinessUnit.id);
      setExpenses(expenseList);
    } catch (error) {
      message.error('Failed to load Expenses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, [selectedBusinessUnit]);

  const columns = [
    {
      title: 'Date',
      dataIndex: 'expenseDate',
      key: 'expenseDate',
      render: (value: string) => dayjs(value).format('YYYY-MM-DD'),
    },
    {
      title: 'Expense Account',
      key: 'expenseAccount',
      render: (_: unknown, record: ExpenseRecord) =>
        record.expenseAccount
          ? `${record.expenseAccount.code} - ${record.expenseAccount.name}`
          : '',
    },
    {
      title: 'Payment Account',
      key: 'paymentAccount',
      render: (_: unknown, record: ExpenseRecord) =>
        record.paymentAccount
          ? `${record.paymentAccount.code} - ${record.paymentAccount.name}`
          : '',
    },
    {
      title: 'Vendor/Company',
      dataIndex: 'vendorName',
      key: 'vendorName',
      render: (value: string | null) => value || '',
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
      render: (_: unknown, record: ExpenseRecord) =>
        record.journal?.voucherNo || '',
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
    Expenses ({expenses.length})
  </Title>

  <Button
    type="primary"
    icon={<PlusOutlined />}
    onClick={() => navigate('add')}
  >
    Add New
  </Button>
</div>

        

        <Table
          columns={columns}
          dataSource={expenses}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
    </div>
  );
}