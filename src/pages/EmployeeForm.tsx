import { useEffect, useState } from 'react';
import { Form, Input, Button, Card, message, Typography, Row, Col, DatePicker, InputNumber } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { getEmployee, createEmployee, updateEmployee } from '../api/employees';
import { useBusinessUnit } from '../context/BusinessUnitContext';
import FileUploadField from '../components/FileUploadField';

const { Title } = Typography;

export default function EmployeeForm() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { selectedBusinessUnit } = useBusinessUnit();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      loadEmployee();
    }
  }, [id]);

  const loadEmployee = async () => {
    try {
      const employee = await getEmployee(Number(id), selectedBusinessUnit?.id);
      form.setFieldsValue({
        profilePicture: employee.user?.profilePicture
          ? { id: employee.user.profilePicture.id, url: employee.user.profilePicture.url }
          : null,
        fullName: employee.user?.fullName,
        username: employee.user?.username,
        email: employee.user?.email,
        employeeCode: employee.employeeCode,
        designation: employee.designation,
        department: employee.department,
        joiningDate: employee.joiningDate ? dayjs(employee.joiningDate) : null,
        basicSalary: employee.basicSalary,
        phone: employee.phone,
      });
    } catch (error) {
      message.error('Failed to load employee');
    }
  };

  const onFinish = async (values: any) => {
    const { confirmPassword, joiningDate, profilePicture, ...rest } = values;
    const payload = {
      ...rest,
      joiningDate: joiningDate ? joiningDate.format('YYYY-MM-DD') : undefined,
      profilePictureId: profilePicture?.id,
    };
    if (isEditMode && !payload.password) delete payload.password;

    setLoading(true);
    try {
      if (isEditMode) {
        await updateEmployee(Number(id), payload, selectedBusinessUnit?.id);
        message.success('Employee updated');
      } else {
        await createEmployee(payload, selectedBusinessUnit?.id);
        message.success('Employee created');
      }
      navigate('/master-data/employees');
    } catch (error: any) {
      message.error(error?.response?.data?.message?.[0] || error?.response?.data?.message || 'Something went wrong');
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
          {isEditMode ? 'Edit Employee' : 'Add Employee'}
        </Title>
        <div>
          <Button type="primary" htmlType="submit" loading={loading} style={{ marginRight: 8 }}>
            Save
          </Button>
          <Button onClick={() => navigate('/master-data/employees')}>Cancel</Button>
        </div>
      </div>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="Employee Details" size="small">
            <Form.Item label="Full Name" name="fullName" rules={[{ required: true, message: 'Full name is required' }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Profile Picture" name="profilePicture">
              <FileUploadField variant="image" label="Upload Profile Picture" />
            </Form.Item>
            <Form.Item label="Employee Code" name="employeeCode">
              <Input />
            </Form.Item>
            <Form.Item label="Designation" name="designation">
              <Input />
            </Form.Item>
            <Form.Item label="Department" name="department">
              <Input />
            </Form.Item>
            <Form.Item label="Joining Date" name="joiningDate">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label="Basic Salary" name="basicSalary">
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
            <Form.Item label="Phone" name="phone">
              <Input />
            </Form.Item>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="Credentials" size="small">
            <Form.Item label="Username" name="username" rules={[{ required: true, message: 'Username is required' }]}>
              <Input />
            </Form.Item>
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: 'Email is required' }, { type: 'email', message: 'Enter a valid email' }]}
            >
              <Input />
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Password"
                  name="password"
                  rules={
                    isEditMode
                      ? [{ min: 6, message: 'Minimum 6 characters' }]
                      : [{ required: true, message: 'Password is required' }, { min: 6, message: 'Minimum 6 characters' }]
                  }
                >
                  <Input.Password placeholder={isEditMode ? 'Leave blank to keep current' : ''} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Confirm Password"
                  name="confirmPassword"
                  dependencies={['password']}
                  rules={[
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        const pwd = getFieldValue('password');
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
        </Col>
      </Row>
    </Form>
  );
}