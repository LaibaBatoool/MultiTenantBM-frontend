import { useEffect, useState } from 'react';
import { Table, Button, Typography, message, Select, Space, Switch } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getExpenseTypes, toggleExpenseTypeActive, type ExpenseType } from '../api/expenseTypes';
import { useBusinessUnit } from '../context/BusinessUnitContext';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/date';

const { Title } = Typography;

export default function ExpenseTypesPage() {
  const navigate = useNavigate();
  const { selectedBusinessUnit } = useBusinessUnit();
  const { hasPermission } = useAuth();
  const [data, setData] = useState<ExpenseType[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const fetchData = async () => {
    if (!selectedBusinessUnit) {
      setData([]);
      return;
    }
    setLoading(true);
    try {
      const types = await getExpenseTypes(selectedBusinessUnit.id, status);
      setData(types);
    } catch (error) {
      message.error('Failed to load expense types');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedBusinessUnit, status]);

  const handleToggle = async (id: number) => {
    try {
      await toggleExpenseTypeActive(id, selectedBusinessUnit?.id);
      message.success('Status updated');
      fetchData();
    } catch (error) {
      message.error('Failed to update status');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: ExpenseType) =>
        status === 'active' ? (
          <a onClick={() => navigate(`/master-data/expense-types/${record.id}/edit`)}>{text}</a>
        ) : (
          <span>{text}</span>
        ),
    },
    { title: 'Description', dataIndex: 'description', key: 'description', render: (v: string | null) => v || '' },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Created By',
      dataIndex: 'createdByUser',
      key: 'createdBy',
      render: (u: ExpenseType['createdByUser']) => u?.username || '',
    },
    {
      title: 'Modified At',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date: string | null) => formatDate(date),
    },
    {
      title: 'Modified By',
      dataIndex: 'updatedByUser',
      key: 'updatedBy',
      render: (u: ExpenseType['updatedByUser']) => u?.username || '',
    },
    {
      title: 'Active',
      key: 'active',
      render: (_: unknown, record: ExpenseType) =>
        hasPermission('master-data.expense-types.edit') ? (
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
          Expense Types ({data.length})
        </Title>
        {hasPermission('master-data.expense-types.add') && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/master-data/expense-types/new')}>
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