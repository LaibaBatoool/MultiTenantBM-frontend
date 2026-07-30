import { useEffect, useState } from 'react';
import { Table, Button, Typography, message, Select, Space, Switch } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getAssets, toggleAssetActive, type Asset } from '../api/assets';
import { useBusinessUnit } from '../context/BusinessUnitContext';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/date';

const { Title } = Typography;

export default function Assets() {
  const navigate = useNavigate();
  const { selectedBusinessUnit } = useBusinessUnit();
  const { hasPermission } = useAuth();
  const [data, setData] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const fetchData = async () => {
    if (!selectedBusinessUnit) {
      setData([]);
      return;
    }
    setLoading(true);
    try {
      const assets = await getAssets(selectedBusinessUnit.id, status);
      setData(assets);
    } catch (error) {
      message.error('Failed to load assets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedBusinessUnit, status]);

  const handleToggle = async (id: number) => {
    try {
      await toggleAssetActive(id, selectedBusinessUnit?.id);
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
      render: (text: string, record: Asset) =>
        status === 'active' ? (
          <a onClick={() => navigate(`/master-data/assets/${record.id}/edit`)}>{text}</a>
        ) : (
          <span>{text}</span>
        ),
    },
    { title: 'Category', dataIndex: 'assetCategory', key: 'assetCategory', render: (v: string | null) => v || '' },
    { title: 'Serial Number', dataIndex: 'serialNumber', key: 'serialNumber', render: (v: string | null) => v || '' },
    { title: 'Purchase Price', dataIndex: 'purchasePrice', key: 'purchasePrice', render: (v: number | null) => v ?? '' },
    { title: 'Book Value', dataIndex: 'currentBookValue', key: 'currentBookValue', render: (v: number | null) => v ?? '' },
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
      render: (u: Asset['createdByUser']) => u?.username || '',
    },
    {
      title: 'Active',
      key: 'active',
      render: (_: unknown, record: Asset) =>
        hasPermission('master-data.assets.edit') ? (
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
          Assets ({data.length})
        </Title>
        {hasPermission('master-data.assets.add') && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/master-data/assets/new')}>
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