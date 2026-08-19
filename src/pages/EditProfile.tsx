import { useEffect, useRef, useState } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  message,
  Typography,
  Row,
  Col,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateMyProfile } from '../api/auth';
import FileUploadField, {
  type FileUploadFieldHandle,
} from '../components/FileUploadField';

const { Title } = Typography;

export default function EditProfile() {
  const navigate = useNavigate();

  const { currentUser, refreshCurrentUser } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const profilePicRef = useRef<FileUploadFieldHandle>(null);

  useEffect(() => {
    if (currentUser) {
      form.setFieldsValue({
        fullName: currentUser.name,
        username: currentUser.username,
        email: currentUser.email,
        profilePicture: currentUser.profilePic
          ? { url: currentUser.profilePic }
          : null,
      });
    }
  }, [currentUser]);

  const onFinish = async (values: any) => {
    const {
      confirmPassword,
      profilePicture,
      username,
      ...rest
    } = values;

    setLoading(true);

    try {
      await updateMyProfile({
        fullName: rest.fullName,
        email: rest.email,
        password: rest.password || undefined,
        profilePicture: profilePicture?.url,
      });

      message.success('Profile updated');

      form.setFieldsValue({
        password: '',
        confirmPassword: '',
      });

      await refreshCurrentUser();
    } catch (error: any) {
      message.error(
        error?.response?.data?.message?.[0] ||
        error?.response?.data?.message ||
        'Failed to update profile',
      );
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
          Edit Profile
        </Title>

        <div>
          <Button
            htmlType="button"
            onClick={() => navigate(-1)}
            style={{ marginRight: 8 }}
          >
            Back
          </Button>

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
          >
            Save
          </Button>
        </div>
      </div>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="User Details" size="small">
            <Form.Item
              label="Full Name"
              name="fullName"
              rules={[
                {
                  required: true,
                  message: 'Full name is required',
                },
              ]}
            >
              <Input placeholder="e.g. Sara Khan" />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                {
                  required: true,
                  message: 'Email is required',
                },
                {
                  type: 'email',
                  message: 'Enter a valid email',
                },
              ]}
            >
              <Input placeholder="e.g. sara@example.com" />
            </Form.Item>

            <Form.Item
              label="Profile Picture"
              name="profilePicture"
            >
              <FileUploadField
                ref={profilePicRef}
                variant="image"
                label="Upload Profile Picture"
              />
            </Form.Item>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="Credentials" size="small">
            <Form.Item label="Username" name="username">
              <Input disabled />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="New Password"
                  name="password"
                  rules={[
                    {
                      min: 6,
                      message: 'Minimum 6 characters',
                    },
                  ]}
                >
                  <Input.Password placeholder="Leave blank to keep current" />
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

                        if (!pwd && !value) {
                          return Promise.resolve();
                        }

                        if (pwd === value) {
                          return Promise.resolve();
                        }

                        return Promise.reject(
                          new Error('Passwords do not match'),
                        );
                      },
                    }),
                  ]}
                >
                  <Input.Password placeholder="Leave blank to keep current" />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </Form>
  );
}