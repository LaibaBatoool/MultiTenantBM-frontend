import { useEffect, useState } from 'react';
import { Table, Typography, message, Button, Popconfirm, Select, Space, Avatar } from 'antd';
import { PlusOutlined, StopOutlined, CheckCircleOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getStaff, deactivateStaff, restoreStaff, type Staff } from '../api/staff';
import { useBusinessUnit } from '../context/BusinessUnitContext';
import { useAuth } from '../context/AuthContext';
import { Switch } from 'antd';

const { Title } = Typography;
const API_BASE = 'http://192.168.1.157:3000';

export default function Users() {
  const navigate = useNavigate();
  const { selectedBusinessUnit } = useBusinessUnit();
  const { hasPermission } = useAuth();
  const [data, setData] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchData = async () => {
    if (!selectedBusinessUnit) {
      setData([]);
      return;
    }
    setLoading(true);
    try {
      const result = await getStaff(selectedBusinessUnit.id, status, page, pageSize);
      setData(result.staff);
      setTotal(result.total);
    } catch (error) {
      message.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedBusinessUnit, status, page, pageSize]);

  const handleDeactivate = async (id: number) => {
    try {
      await deactivateStaff(id, selectedBusinessUnit?.id);
      message.success('User deactivated');
      fetchData();
    } catch (error) {
      message.error('Failed to deactivate user');
    }
  };

  const handleActivate = async (id: number) => {
    try {
      await restoreStaff(id, selectedBusinessUnit?.id);
      message.success('User activated');
      fetchData();
    } catch (error) {
      message.error('Failed to activate user');
    }
  };

  const columns = [
    {
      title: '',
      key: 'avatar',
      width: 60,
      render: (_: unknown, record: Staff) => (
        <Avatar
          src={record.profilePicture?.url ? `${API_BASE}${record.profilePicture.url}` : undefined}
          icon={!record.profilePicture?.url ? <UserOutlined /> : undefined}
        />
      ),
    },
    { title: 'Full Name', dataIndex: 'fullName', key: 'fullName' },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      render: (text: string, record: Staff) =>
        status === 'inactive' ? (
          <span>{text}</span>
        ) : (
          <a onClick={() => navigate(`/staff/users/${record.id}/edit`)}>{text}</a>
        ),
    },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Active',
      key: 'actions',
      render: (_: unknown, record: Staff) => {
        const canToggle =
          status === 'active' ? hasPermission('staff.users.delete') : hasPermission('staff.users.edit');

        if (!canToggle) return null;

        return (
          <Switch
            checked={status === 'active'}
            onChange={(checked) => {
              if (checked) {
                handleActivate(record.id);
              } else {
                handleDeactivate(record.id);
              }
            }}
          />
        );
      },
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

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total,
          onChange: (p, ps) => {
            setPage(p);
            setPageSize(ps);
          },
        }}
      />    </div>
  );
}