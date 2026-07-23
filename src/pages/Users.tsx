import { useEffect, useState } from 'react';
import { Table, Typography, message, Button, Popconfirm } from 'antd';
import { PlusOutlined, StopOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getStaff, deactivateStaff, type Staff } from '../api/staff';
import { useBusinessUnit } from '../context/BusinessUnitContext';
import { useAuth } from '../context/AuthContext';

const { Title } = Typography;

export default function Users() {
  const navigate = useNavigate();
  const { selectedBusinessUnit } = useBusinessUnit();
  const { hasPermission } = useAuth();
  const [data, setData] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    if (!selectedBusinessUnit) {
      setData([]);
      return;
    }
    setLoading(true);
    try {
      const staff = await getStaff(selectedBusinessUnit.id);
      setData(staff);
    } catch (error) {
      message.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedBusinessUnit]);

  const handleDeactivate = async (id: number) => {
    try {
      await deactivateStaff(id, selectedBusinessUnit?.id);
      message.success('User deactivated');
      fetchData();
    } catch (error) {
      message.error('Failed to deactivate user');
    }
  };

  const columns = [
    { title: 'Full Name', dataIndex: 'fullName', key: 'fullName' },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      render: (text: string, record: Staff) => (
        <a onClick={() => navigate(`/staff/users/${record.id}/edit`)}>{text}</a>
      ),
    },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: Staff) =>
        hasPermission('staff.users.delete') ? (
          <Popconfirm title="Deactivate this user?" onConfirm={() => handleDeactivate(record.id)} okText="Yes" cancelText="No">
            <Button danger icon={<StopOutlined />} size="small">
              Deactivate
            </Button>
          </Popconfirm>
        ) : null,
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          Users ({data.length})
        </Title>
        {hasPermission('staff.users.add') && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/staff/users/new')}>
            Add New
          </Button>
        )}
      </div>
      <Table columns={columns} dataSource={data} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
    </div>
  );
}