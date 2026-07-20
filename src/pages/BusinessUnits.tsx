import { useEffect, useState } from 'react';
import { Table, Button, Input, Space, Popconfirm, message, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getBusinessUnits, deleteBusinessUnit } from '../api/businessUnits';
import type { BusinessUnit } from '../api/businessUnits';

const { Title } = Typography;

export default function BusinessUnits() {
  const navigate = useNavigate();
  const [data, setData] = useState<BusinessUnit[]>([]);
  const [filteredData, setFilteredData] = useState<BusinessUnit[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const units = await getBusinessUnits();
      setData(units);
      setFilteredData(units);
    } catch (error) {
      message.error('Failed to load business units');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      fetchData();
    } catch (error) {
      message.error('Failed to delete business unit');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: BusinessUnit) => (
        <a onClick={() => navigate(`/business-units/${record.id}/edit`)}>{text}</a>
      ),
    },
    {
      title: 'Admin ID',
      dataIndex: 'adminId',
      key: 'adminId',
      render: (adminId: number | null) => adminId ?? '—',
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
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
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Business Units</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/business-units/new')}>
          Add New
        </Button>
      </div>

      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search by name..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onPressEnter={handleSearch}
          style={{ width: 250 }}
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