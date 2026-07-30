import { useEffect, useState } from 'react';
import { Table, Button, Typography, message, Select, Space, Switch } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getBankAccounts, toggleBankAccountActive, type BankAccount } from '../api/bankAccounts';
import { useBusinessUnit } from '../context/BusinessUnitContext';
import { useAuth } from '../context/AuthContext';

const { Title } = Typography;

export default function BankAccounts() {
  const navigate = useNavigate();
  const { selectedBusinessUnit } = useBusinessUnit();
  const { hasPermission } = useAuth();
  const [data, setData] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const fetchData = async () => {
    if (!selectedBusinessUnit) {
      setData([]);
      return;
    }
    setLoading(true);
    try {
      const accounts = await getBankAccounts(selectedBusinessUnit.id, status);
      setData(accounts);
    } catch (error) {
      message.error('Failed to load bank accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedBusinessUnit, status]);

  const handleToggle = async (id: number) => {
    try {
      await toggleBankAccountActive(id, selectedBusinessUnit?.id);
      message.success('Status updated');
      fetchData();
    } catch (error) {
      message.error('Failed to update status');
    }
  };

  const columns = [
    {
      title: 'Bank Name',
      dataIndex: 'bankName',
      key: 'bankName',
      render: (text: string, record: BankAccount) =>
        status === 'active' ? (
          <a onClick={() => navigate(`/master-data/bank-accounts/${record.id}/edit`)}>{text}</a>
        ) : (
          <span>{text}</span>
        ),
    },
    { title: 'Company', key: 'company', render: (_: unknown, record: BankAccount) => record.company?.name || '' },
    { title: 'Account Title', dataIndex: 'accountTitle', key: 'accountTitle', render: (v: string | null) => v || '' },
    { title: 'Account Number', dataIndex: 'accountNumber', key: 'accountNumber' },
    { title: 'IBAN', dataIndex: 'iban', key: 'iban', render: (v: string | null) => v || '' },
    {
      title: 'Active',
      key: 'active',
      render: (_: unknown, record: BankAccount) =>
        hasPermission('master-data.bank-accounts.edit') ? (
          <Switch checked={record.isActive} onChange={() => handleToggle(record.id)} />
        ) : (
          <span>{record.isActive ? 'Yes' : 'No'}</span>
        ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          Bank Accounts ({data.length})
        </Title>
        {hasPermission('master-data.bank-accounts.add') && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/master-data/bank-accounts/new')}>
            Add New
          </Button>
        )}
      </div>

      <Space style={{ marginBottom: 16 }}>
        <Select
          value={status}
          onChange={(value) => setStatus(value)}
          style={{ width: 150 }}
          options={[
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'In-Active' },
          ]}
        />
      </Space>

      <Table columns={columns} dataSource={data} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
    </div>
  );
}