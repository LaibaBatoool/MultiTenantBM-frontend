import { useEffect, useState } from 'react';
import { Table, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { getAccountsPayableVendors, type AccountsPayableVendor } from '../api/accountsPayable';
import { useBusinessUnit } from '../context/BusinessUnitContext';

const { Title, Text } = Typography;

export default function AccountsPayable() {
  const { selectedBusinessUnit } = useBusinessUnit();
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<AccountsPayableVendor[]>([]);
  const [totalPayable, setTotalPayable] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadCustomers = async () => {
    if (!selectedBusinessUnit?.id) {
      setCustomers([]);
      return;
    }

    setLoading(true);
    try {
      const data = await getAccountsPayableVendors(selectedBusinessUnit.id);
      setCustomers(data.vendors);
      setTotalPayable(data.totalPayable);
    } catch (error) {
      message.error('Accounts Payable load nahi ho saka.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [selectedBusinessUnit]);

  const columns = [
    { title: 'Customer', dataIndex: 'name', key: 'name' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone', render: (value: string | null) => value || '' },
    {
      title: 'Credit Limit',
      dataIndex: 'creditLimit',
      key: 'creditLimit',
      align: 'right' as const,
      render: (value: number) => value.toLocaleString(),
    },
    { title: 'Payment Terms', dataIndex: 'paymentTerms', key: 'paymentTerms', render: (value: string | null) => value || '' },
    {
      title: 'Outstanding Balance',
      dataIndex: 'outstandingBalance',
      key: 'outstandingBalance',
      align: 'right' as const,
      render: (value: number) => value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          Accounts Payable ({customers.length})
        </Title>
        <Text strong>
          Total Payable: {totalPayable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
      </div>

      <Table
        columns={columns}
        dataSource={customers}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        onRow={(record) => ({
          onClick: () => navigate(`/reports/accounts-payable/${record.id}`),
          style: { cursor: 'pointer' },
        })}
      />
    </div>
  );
}