import { useEffect, useRef, useState } from 'react';
import { Form, Input, Button, Card, message, Typography, Row, Col, Select } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { getBusinessUnit, createBusinessUnit, updateBusinessUnit } from '../api/businessUnits';
import FileUploadField, { type FileUploadFieldHandle } from '../components/FileUploadField';

const { Title } = Typography;

export default function BusinessUnitForm() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const logoFieldRef = useRef<FileUploadFieldHandle>(null);

  useEffect(() => {
    if (isEditMode) {
      loadBusinessUnit();
    }
  }, [id]);

  const loadBusinessUnit = async () => {
    try {
      const unit = await getBusinessUnit(Number(id));
      form.setFieldsValue({
        name: unit.name,
        logo: unit.logo ? { url: unit.logo } : null,
        adminFullName: unit.admin?.fullName,
        adminUsername: unit.admin?.username,
        adminEmail: unit.admin?.email,
      });
    } catch (error) {
      message.error('Failed to load business unit');
    }
  };

  const onFinish = async (values: any) => {
    const { confirmPassword, logo, ...rest } = values;

    setLoading(true);
    try {
      if (isEditMode) {
        const payload: any = {
          name: rest.name,
          logo: logo?.url,
          adminFullName: rest.adminFullName,
          adminUsername: rest.adminUsername,
          adminEmail: rest.adminEmail,
        };
        if (rest.adminPassword) {
          payload.adminPassword = rest.adminPassword;
        }
        await updateBusinessUnit(Number(id), payload);
        message.success('Business unit updated');
      } else {
        await createBusinessUnit({ ...rest, logo: logo?.url });
        message.success('Business unit created');
      }
      navigate('/business-units');
    } catch (error: any) {
      message.error(error?.response?.data?.message?.[0] || error?.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    logoFieldRef.current?.discardUnsavedUpload();
    navigate('/business-units');
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
          <Button onClick={handleCancel}>Cancel</Button>
        </div>
      </div>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="Business Unit Details" size="small">
            <Form.Item
              label="Name"
              name="name"
              rules={[{ required: true, message: 'Name is required' }]}
            >
              <Input placeholder="e.g. North Region" />
            </Form.Item>
            <Form.Item label="Logo" name="logo">
              <FileUploadField ref={logoFieldRef} variant="image" label="Upload Logo" />
            </Form.Item>
            <Form.Item
              label="Fiscal Year Start Month"
              name="fiscalYearStartMonth"
              tooltip="Business ka financial year kis mahine se shuru hota hai"
            >
              <Select placeholder="e.g. January" allowClear>
                <Select.Option value={1}>January</Select.Option>
                <Select.Option value={2}>February</Select.Option>
                <Select.Option value={3}>March</Select.Option>
                <Select.Option value={4}>April</Select.Option>
                <Select.Option value={5}>May</Select.Option>
                <Select.Option value={6}>June</Select.Option>
                <Select.Option value={7}>July</Select.Option>
                <Select.Option value={8}>August</Select.Option>
                <Select.Option value={9}>September</Select.Option>
                <Select.Option value={10}>October</Select.Option>
                <Select.Option value={11}>November</Select.Option>
                <Select.Option value={12}>December</Select.Option>
              </Select>
            </Form.Item>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="Contact Person Credentials" size="small" style={{ marginBottom: 16 }}>
            <Form.Item
              label="User Name"
              name="adminUsername"
              rules={[{ required: true, message: 'Username is required' }]}
            >
              <Input placeholder="e.g. ali.north" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Password"
                  name="adminPassword"
                  rules={
                    isEditMode
                      ? [{ min: 6, message: 'Minimum 6 characters' }]
                      : [
                        { required: true, message: 'Password is required' },
                        { min: 6, message: 'Minimum 6 characters' },
                      ]
                  }
                >
                  <Input.Password placeholder={isEditMode ? 'Leave blank to keep current' : 'Password'} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Confirm Password"
                  name="confirmPassword"
                  dependencies={['adminPassword']}
                  rules={[
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        const pwd = getFieldValue('adminPassword');
                        if (!pwd && !value) return Promise.resolve();
                        if (pwd === value) return Promise.resolve();
                        return Promise.reject(new Error('Passwords do not match'));
                      },
                    }),
                  ]}
                >
                  <Input.Password placeholder={isEditMode ? 'Leave blank to keep current' : 'Confirm Password'} />
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
      </Row>
    </Form>
  );
}