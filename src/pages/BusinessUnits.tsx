import { useEffect, useState } from 'react';
import { Card, Avatar, Button, Input, Select, Space, Typography, message, Row, Col, Popconfirm } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  LoginOutlined,
  ApartmentOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getBusinessUnits, deleteBusinessUnit, restoreBusinessUnit, type BusinessUnit } from '../api/businessUnits';
import { useBusinessUnit } from '../context/BusinessUnitContext';

const { Title } = Typography;

export default function BusinessUnits() {
  const navigate = useNavigate();
  const { selectBusinessUnit } = useBusinessUnit();
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

  const handleSelect = (bu: BusinessUnit) => {
    selectBusinessUnit({ id: bu.id, name: bu.name });
    message.success(`${bu.name} selected`);
    navigate('/');
  };

  const handleToggleStatus = async (bu: BusinessUnit) => {
    try {
      if (status === 'active') {
        await deleteBusinessUnit(bu.id);
        message.success('Business unit deactivated');
      } else {
        await restoreBusinessUnit(bu.id);
        message.success('Business unit activated');
      }
      fetchData(status);
    } catch (error) {
      message.error('Action failed');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>
          Business Units ({filteredData.length})
        </Title>
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

      <Row gutter={[16, 16]}>
        {filteredData.map((bu) => (
          <Col key={bu.id} xs={24} sm={12} md={8} lg={6}>
            <Card
              size="small"
              actions={[
                <LoginOutlined key="select" title="Select" onClick={() => handleSelect(bu)} />,
                <EditOutlined key="edit" title="Edit" onClick={() => navigate(`/business-units/${bu.id}/edit`)} />,
                <Popconfirm
                  key="toggle"
                  title={status === 'active' ? 'Deactivate this business unit?' : 'Activate this business unit?'}
                  onConfirm={() => handleToggleStatus(bu)}
                  okText="Yes"
                  cancelText="No"
                >
                  {status === 'active' ? <EyeOutlined title="Deactivate" /> : <EyeInvisibleOutlined title="Activate" />}
                </Popconfirm>,
              ]}
            >
              <Card.Meta
                avatar={<Avatar icon={<ApartmentOutlined />} />}
                title={bu.name}
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}