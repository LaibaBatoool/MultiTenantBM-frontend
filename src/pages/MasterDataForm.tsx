import { useEffect, useRef, useState } from 'react';
import { Form, Input, Button, Card, message, Typography, Row, Col } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { getCompanyByType, createCompanyOfType, updateCompanyOfType } from '../api/companies';
import { useBusinessUnit } from '../context/BusinessUnitContext';
import FileUploadField, { type FileUploadFieldHandle } from '../components/FileUploadField';

const { Title } = Typography;

const TYPE_LABELS: Record<string, string> = {
  vendor: 'Vendor',
  supplier: 'Supplier',
  contractor: 'Contractor',
  consultant: 'Consultant',
  customer: 'Customer',
};

export default function MasterDataForm() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { selectedBusinessUnit } = useBusinessUnit();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const logoFieldRef = useRef<FileUploadFieldHandle>(null);

  const label = TYPE_LABELS[type || ''] || type;

  useEffect(() => {
    if (isEditMode && type) {
      loadRecord();
    }
  }, [id]);

  const loadRecord = async () => {
    try {
      const company = await getCompanyByType(type!, Number(id));
      form.setFieldsValue({
        name: company.name,
        phone: company.phone,
        email: company.email,
        address: company.address,
        website: company.website,
        logo: company.logo
          ? ({ url: company.logo, originalName: 'Logo' } as any)
          : null,
        adminFullName: company.admin?.fullName,
        adminUsername: company.admin?.username,
        adminEmail: company.admin?.email,
      });
    } catch (error) {
      message.error(`Failed to load ${label}`);
    }
  };

  const onFinish = async (values: any) => {
    if (!type) return;
    const { logo, confirmPassword, ...rest } = values;
    setLoading(true);
    try {
      if (isEditMode) {
        const payload: any = { ...rest, logo: logo?.url };
        if (!payload.adminPassword) delete payload.adminPassword;
        await updateCompanyOfType(type, Number(id), payload);
        message.success(`${label} updated`);
      } else {
        await createCompanyOfType(type, { ...rest, businessUnitId: selectedBusinessUnit?.id, logo: logo?.url });
        message.success(`${label} created`);
      }
      navigate(`/master-data/${type}`);
    } catch (error: any) {
      message.error(error?.response?.data?.message?.[0] || error?.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    logoFieldRef.current?.discardUnsavedUpload();
    navigate(`/master-data/${type}`);
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
          {isEditMode ? `Edit ${label}` : `Add ${label}`}
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
          <Card title={`${label} Details`} size="small">
            <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Name is required' }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Email" name="email" rules={[{ type: 'email', message: 'Enter a valid email' }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Phone" name="phone">
              <Input />
            </Form.Item>
            <Form.Item label="Address" name="address">
              <Input />
            </Form.Item>
            <Form.Item label="Website" name="website">
              <Input />
            </Form.Item>
            <Form.Item label="Logo" name="logo">
              <FileUploadField ref={logoFieldRef} variant="image" label="Upload Logo" />
            </Form.Item>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="Contact Person Credentials" size="small" style={{ marginBottom: 16 }}>
            <Form.Item
              label="Username"
              name="adminUsername"
              rules={[{ required: true, message: 'Username is required' }]}
            >
              <Input />
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
                  <Input.Password placeholder={isEditMode ? 'Leave blank to keep current' : ''} />
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
                  <Input.Password placeholder={isEditMode ? 'Leave blank to keep current' : ''} />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card title="Contact Person Details" size="small">
            <Form.Item
              label="Full Name"
              name="adminFullName"
              rules={[{ required: true, message: 'Full name is required' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Email"
              name="adminEmail"
              rules={[
                { required: true, message: 'Email is required' },
                { type: 'email', message: 'Enter a valid email' },
              ]}
            >
              <Input />
            </Form.Item>
          </Card>
        </Col>
      </Row>
    </Form>
  );
}