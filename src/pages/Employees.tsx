import { useEffect, useState } from 'react';
import { Table, Button, Typography, message, Select, Space, Switch } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getEmployees, toggleEmployeeActive, type Employee } from '../api/employees';
import { useBusinessUnit } from '../context/BusinessUnitContext';
import { useAuth } from '../context/AuthContext';
import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const API_BASE = 'http://192.168.1.157:3000';
//const API_BASE = 'http://192.168.10.21:3000';

const { Title } = Typography;

export default function Employees() {
  const navigate = useNavigate();
  const { selectedBusinessUnit } = useBusinessUnit();
  const { hasPermission } = useAuth();
  const [data, setData] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const fetchData = async () => {
    if (!selectedBusinessUnit) {
      setData([]);
      return;
    }
    setLoading(true);
    try {
      const employees = await getEmployees(selectedBusinessUnit.id, status);
      setData(employees);
    } catch (error) {
      message.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedBusinessUnit, status]);

  const handleToggle = async (id: number) => {
    try {
      await toggleEmployeeActive(id, selectedBusinessUnit?.id);
      message.success('Status updated');
      fetchData();
    } catch (error) {
      message.error('Failed to update status');
    }
  };

  const columns = [
    {
      title: '',
      key: 'avatar',
      width: 60,
      render: (_: unknown, record: Employee) => (
        <Avatar
          src={record.user?.profilePicture ? `${API_BASE}${record.user.profilePicture}` : undefined}
          icon={!record.user?.profilePicture ? <UserOutlined /> : undefined}
        />
      ),
    },
    {
      title: 'Full Name',
      key: 'fullName',
      render: (_: unknown, record: Employee) =>
        status === 'active' ? (
          <a onClick={() => navigate(`/master-data/employees/${record.id}/edit`)}>{record.user?.fullName}</a>
        ) : (
          <span>{record.user?.fullName}</span>
        ),
    },
    { title: 'Username', key: 'username', render: (_: unknown, record: Employee) => record.user?.username },
    { title: 'Email', key: 'email', render: (_: unknown, record: Employee) => record.user?.email },
    { title: 'Designation', dataIndex: 'designation', key: 'designation', render: (v: string | null) => v || '' },
    { title: 'Department', dataIndex: 'department', key: 'department', render: (v: string | null) => v || '' },
    {
      title: 'Active',
      key: 'active',
      render: (_: unknown, record: Employee) =>
        hasPermission('master-data.employees.edit') ? (
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
          Employees ({data.length})
        </Title>
        {hasPermission('master-data.employees.add') && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/master-data/employees/new')}>
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