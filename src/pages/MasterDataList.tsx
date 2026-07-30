import { useEffect, useState } from 'react';
import { Table, Button, Typography, message, Select, Space, Switch } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { getCompaniesByType, toggleCompanyActive, type CompanyRecord } from '../api/companies';
import { useBusinessUnit } from '../context/BusinessUnitContext';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/date';
import { Avatar } from 'antd';

const API_BASE = 'http://192.168.1.157:3000';
const { Title } = Typography;

const TYPE_LABELS: Record<string, string> = {
  vendor: 'Vendors',
  supplier: 'Suppliers',
  contractor: 'Contractors',
  consultant: 'Consultants',
  customer: 'Customers',
};

export default function MasterDataList() {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const { selectedBusinessUnit } = useBusinessUnit();
  const { hasPermission } = useAuth();
  const [data, setData] = useState<CompanyRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const label = TYPE_LABELS[type || ''] || type;

  const fetchData = async () => {
    if (!selectedBusinessUnit || !type) {
      setData([]);
      return;
    }
    setLoading(true);
    try {
      const companies = await getCompaniesByType(type, selectedBusinessUnit.id, status);
      setData(companies);
    } catch (error) {
      message.error(`Failed to load ${label}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedBusinessUnit, status, type]);

  const handleToggle = async (id: number) => {
    if (!type) return;
    try {
      await toggleCompanyActive(type, id);
      message.success('Status updated');
      fetchData();
    } catch (error) {
      message.error('Failed to update status');
    }
  };

  const permPrefix = `master-data.${type}`;

  const columns = [
    {
      title: '',
      key: 'logo',
      width: 60,
      render: (_: unknown, record: CompanyRecord) => (
        <Avatar
          shape="circle"
          src={record.logo?.url ? `${API_BASE}${record.logo.url}` : undefined}
        />
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: CompanyRecord) =>
        status === 'inactive' ? (
          <span>{text}</span>
        ) : (
          <a onClick={() => navigate(`/master-data/${type}/${record.id}/edit`)}>{text}</a>
        ),
    },
    { title: 'Email', dataIndex: 'email', key: 'email', render: (v: string | null) => v || '' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone', render: (v: string | null) => v || '' },
    { title: 'Address', dataIndex: 'address', key: 'address', render: (v: string | null) => v || '' },
    {
      title: 'Contact Person Name',
      dataIndex: 'admin',
      key: 'admin',
      render: (admin: CompanyRecord['admin']) => admin?.fullName || '',
    },
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
      render: (user: CompanyRecord['createdByUser']) => user?.username || '',
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
      render: (user: CompanyRecord['updatedByUser']) => user?.username || '',
    },
    {
      title: 'Active',
      key: 'actions',
      render: (_: unknown, record: CompanyRecord) =>
        hasPermission(`${permPrefix}.edit`) ? (
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
          {label} ({data.length})
        </Title>
        {hasPermission(`${permPrefix}.add`) && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate(`/master-data/${type}/new`)}>
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