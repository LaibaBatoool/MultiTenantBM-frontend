import { useEffect, useState } from 'react';
import { Button, Table, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useBusinessUnit } from '../context/BusinessUnitContext';
import { getAccountsReceivableCustomers, exportAccountsReceivable, type AccountsReceivableCustomer } from '../api/accountsReceivable';

const { Title, Text } = Typography;

export default function AccountsReceivable() {
  const { selectedBusinessUnit } = useBusinessUnit();
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<AccountsReceivableCustomer[]>([]);
  const [totalReceivable, setTotalReceivable] = useState(0);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const loadCustomers = async () => {
    if (!selectedBusinessUnit?.id) {
      setCustomers([]);
      return;
    }

    setLoading(true);
    try {
      const data = await getAccountsReceivableCustomers(selectedBusinessUnit.id);
      setCustomers(data.customers);
      setTotalReceivable(data.totalReceivable);
    } catch (error) {
      message.error('Accounts Receivable load nahi ho saka.');
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

    const handleExport = async () => {
    setExporting(true);
    try {
      await exportAccountsReceivable(selectedBusinessUnit?.id);
    } catch (error) {
      message.error('Excel export nahi ho saka.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          Accounts Receivable ({customers.length})
        </Title>
        <Text strong>
          Total Receivable: {totalReceivable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
        <Button style={{ width: 100}} type="primary" onClick={handleExport} loading={exporting}>
          Excel
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={customers}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        onRow={(record) => ({
          onClick: () => navigate(`/reports/accounts-receivable/${record.id}`),
          style: { cursor: 'pointer' },
        })}
      />
    </div>
  );
}