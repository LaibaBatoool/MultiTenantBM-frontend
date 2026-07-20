import { useEffect, useState } from 'react';
import { Form, Input, Button, Card, message, Typography, Row, Col } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { getBusinessUnit, createBusinessUnit, updateBusinessUnit } from '../api/businessUnits';

const { Title } = Typography;

export default function BusinessUnitForm() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      loadBusinessUnit();
    }
  }, [id]);

  const loadBusinessUnit = async () => {
    try {
      const unit = await getBusinessUnit(Number(id));
      form.setFieldsValue({ name: unit.name });
    } catch (error) {
      message.error('Failed to load business unit');
    }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      if (isEditMode) {
        await updateBusinessUnit(Number(id), { name: values.name });
        message.success('Business unit updated');
      } else {
        await createBusinessUnit(values);
        message.success('Business unit created');
      }
      navigate('/business-units');
    } catch (error: any) {
      message.error(error?.response?.data?.message?.[0] || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          background: '#fafafa',
          padding: '12px 16px',
          border: '1px solid #f0f0f0',
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          {isEditMode ? 'Edit Business Unit' : 'Add Business Unit'}
        </Title>
        <div>
          <Button type="primary" htmlType="submit" loading={loading} style={{ marginRight: 8 }}>
            Save
          </Button>
          <Button onClick={() => navigate('/business-units')}>Cancel</Button>
        </div>
      </div>

      <Row gutter={16}>
        <Col span={isEditMode ? 24 : 12}>
          <Card title="Business Unit Details" size="small">
            <Form.Item
              label="Name"
              name="name"
              rules={[{ required: true, message: 'Name is required' }]}
            >
              <Input placeholder="e.g. North Region" />
            </Form.Item>
          </Card>
        </Col>

        {!isEditMode && (
          <Col span={12}>
            <Card title="Contact Person Credentials" size="small" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Username"
                    name="adminUsername"
                    rules={[{ required: true, message: 'Username is required' }]}
                  >
                    <Input placeholder="e.g. ali.north" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Password"
                    name="adminPassword"
                    rules={[
                      { required: true, message: 'Password is required' },
                      { min: 6, message: 'Minimum 6 characters' },
                    ]}
                  >
                    <Input.Password placeholder="Minimum 6 characters" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card title="Contact Person Details" size="small">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Full Name"
                    name="adminFullName"
                    rules={[{ required: true, message: 'Full name is required' }]}
                  >
                    <Input placeholder="e.g. Ali Raza" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Email"
                    name="adminEmail"
                    rules={[
                      { required: true, message: 'Email is required' },
                      { type: 'email', message: 'Enter a valid email' },
                    ]}
                  >
                    <Input placeholder="e.g. ali@example.com" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>
        )}
      </Row>
    </Form>
  );
}