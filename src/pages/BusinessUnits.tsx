import { useEffect, useState } from 'react';
import { Table, Button, Input, Select, Space, Popconfirm, message, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getBusinessUnits, deleteBusinessUnit, type BusinessUnit } from '../api/businessUnits';

const { Title } = Typography;

export default function BusinessUnits() {
  const navigate = useNavigate();
  const [data, setData] = useState<BusinessUnit[]>([]);
  const [filteredData, setFilteredData] = useState<BusinessUnit[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const fetchData = async (currentStatus: 'active' | 'inactive') => {
    setLoading(true);
    try {
      const units = await getBusinessUnits(currentStatus);
      setData(units);
      setFilteredData(units);
    } catch (error) {
      message.error('Failed to load business units');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(status);
  }, [status]);

  const handleSearch = () => {
    if (!searchText.trim()) {
      setFilteredData(data);
      return;
    }
    const filtered = data.filter((item) =>
      item.name.toLowerCase().includes(searchText.toLowerCase()),
    );
    setFilteredData(filtered);
  };

  const handleClear = () => {
    setSearchText('');
    setFilteredData(data);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteBusinessUnit(id);
      message.success('Business unit deleted');
      fetchData(status);
    } catch (error) {
      message.error('Failed to delete business unit');
    }
  };

  const baseColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: BusinessUnit) => (
        <a onClick={() => navigate(`/business-units/${record.id}/edit`)}>{text}</a>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Created By',
      dataIndex: 'createdBy',
      key: 'createdBy',
    },
    {
      title: 'Modified At',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date: string | null) => (date ? new Date(date).toLocaleString() : '—'),
    },
    {
      title: 'Modified By',
      dataIndex: 'updatedBy',
      key: 'updatedBy',
      render: (val: number | null) => val ?? '—',
    },
  ];

  const inactiveColumns = [
    {
      title: 'Deleted At',
      dataIndex: 'deletedAt',
      key: 'deletedAt',
      render: (date: string | null) => (date ? new Date(date).toLocaleString() : '—'),
    },
    {
      title: 'Deleted By',
      dataIndex: 'deletedBy',
      key: 'deletedBy',
      render: (val: number | null) => val ?? '—',
    },
  ];

  const actionsColumn = {
    title: 'Actions',
    key: 'actions',
    render: (_: unknown, record: BusinessUnit) => (
      <Popconfirm
        title="Delete this business unit?"
        onConfirm={() => handleDelete(record.id)}
        okText="Yes"
        cancelText="No"
      >
        <Button danger icon={<DeleteOutlined />} size="small">
          Delete
        </Button>
      </Popconfirm>
    ),
  };

  const columns =
    status === 'inactive'
      ? [...baseColumns, ...inactiveColumns]
      : [...baseColumns, actionsColumn];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Business Units</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/business-units/new')}>
          Add New
        </Button>
      </div>

      <Space style={{ marginBottom: 16, justifyContent: 'flex-start', width: '100%' }}>
        <Input
          placeholder="Search by name..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onPressEnter={handleSearch}
          style={{ width: 250 }}
        />
        <Select
          value={status}
          onChange={(value) => setStatus(value)}
          style={{ width: 150 }}
          options={[
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'In-Active' },
          ]}
        />
        <Button onClick={handleSearch}>Search</Button>
        <Button onClick={handleClear}>Clear</Button>
      </Space>

      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}