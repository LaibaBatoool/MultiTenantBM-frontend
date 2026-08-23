import { useEffect, useState } from 'react';
import { Table, Button, Popconfirm, message, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getRoles, deleteRole, type Role } from '../api/roles';
import { useAuth } from '../context/AuthContext';
import { useBusinessUnit } from '../context/BusinessUnitContext';
import { Switch } from 'antd';
import { toggleRoleActive } from '../api/roles';

const { Title } = Typography;

export default function Roles() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [data, setData] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const { selectedBusinessUnit } = useBusinessUnit();
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
      const result = await getRoles(selectedBusinessUnit.id);
      setData(result);
      setTotal(result.length);
    } catch (error) {
      message.error('Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedBusinessUnit, page, pageSize]);


  const handleDelete = async (id: number) => {
    try {
      await deleteRole(id);
      message.success('Role deleted');
      fetchData();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to delete role');
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      await toggleRoleActive(id);
      message.success('Role status updated');
      fetchData();
    } catch (error) {
      message.error('Failed to update role status');
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
      title: 'Active',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean, record: Role) =>
        hasPermission('staff.roles.edit') ? (
          <Switch checked={isActive} onChange={() => handleToggleActive(record.id)} />
        ) : (
          <span>{isActive ? 'Yes' : 'No'}</span>
        ),
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
      render: (_: unknown, record: Role) =>
        hasPermission('staff.roles.delete') ? (
          <Popconfirm
            title="Delete this role?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />} size="small">
              Delete
            </Button>
          </Popconfirm>
        ) : null,
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Roles ({data.length})</Title>
        {hasPermission('staff.roles.add') && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/staff/roles/new')}>
            Add New
          </Button>
        )}
      </div>
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