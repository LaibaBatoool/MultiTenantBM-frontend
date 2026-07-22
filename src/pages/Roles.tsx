import { useEffect, useState } from 'react';
import { Table, Button, Popconfirm, message, Typography, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getRoles, deleteRole, type Role } from '../api/roles';

const { Title } = Typography;

export default function Roles() {
  const navigate = useNavigate();
  const [data, setData] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const roles = await getRoles();
      setData(roles);
    } catch (error) {
      message.error('Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await deleteRole(id);
      message.success('Role deleted');
      fetchData();
    } catch (error) {
      message.error('Failed to delete role');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Role) => (
        <a onClick={() => navigate(`/staff/roles/${record.id}/edit`)}>{text}</a>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (val: string | null) => val || '',
    },
    {
      title: 'Permissions',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissions: Role['permissions']) => (
        <span>{permissions?.length || 0} assigned</span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: Role) => (
        <Popconfirm title="Delete this role?" onConfirm={() => handleDelete(record.id)} okText="Yes" cancelText="No">
          <Button danger icon={<DeleteOutlined />} size="small">
            Delete
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Roles ({data.length})</Title>        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/staff/roles/new')}>
          Add New
        </Button>
      </div>
      <Table columns={columns} dataSource={data} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
    </div>
  );
}