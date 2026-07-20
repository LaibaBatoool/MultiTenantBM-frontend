import { useEffect, useState } from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
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
    <div>
      <Title level={3}>{isEditMode ? 'Edit Business Unit' : 'Add New Business Unit'}</Title>

      <Card style={{ maxWidth: 500 }}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Business Unit Name"
            name="name"
            rules={[{ required: true, message: 'Name is required' }]}
          >
            <Input placeholder="e.g. North Region" />
          </Form.Item>

          {!isEditMode && (
            <>
              <Form.Item
                label="Admin Full Name"
                name="adminFullName"
                rules={[{ required: true, message: 'Admin full name is required' }]}
              >
                <Input placeholder="e.g. Ali Raza" />
              </Form.Item>

              <Form.Item
                label="Admin Username"
                name="adminUsername"
                rules={[{ required: true, message: 'Admin username is required' }]}
              >
                <Input placeholder="e.g. ali.north" />
              </Form.Item>

              <Form.Item
                label="Admin Email"
                name="adminEmail"
                rules={[{ required: true, message: 'Admin email is required' }, { type: 'email', message: 'Enter a valid email' }]}
              >
                <Input placeholder="e.g. ali@example.com" />
              </Form.Item>

              <Form.Item
                label="Admin Password"
                name="adminPassword"
                rules={[{ required: true, message: 'Admin password is required' }, { min: 6, message: 'Minimum 6 characters' }]}
              >
                <Input.Password placeholder="Minimum 6 characters" />
              </Form.Item>
            </>
          )}

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              {isEditMode ? 'Update' : 'Create'}
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={() => navigate('/business-units')}>
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}