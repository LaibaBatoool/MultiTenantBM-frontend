import { useEffect, useRef, useState } from 'react';
import { Form, Input, Button, Card, message, Typography, Row, Col, Select } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { getStaffOne, createStaff, updateStaff } from '../api/staff';
import { getRoles, getUserRoles, assignRolesToUser, type Role } from '../api/roles';
import { useBusinessUnit } from '../context/BusinessUnitContext';
import { useAuth } from '../context/AuthContext';
import FileUploadField, { type FileUploadFieldHandle } from '../components/FileUploadField';

const { Title } = Typography;

export default function UserForm() {
    const { id } = useParams();
    const isEditMode = Boolean(id);
    const navigate = useNavigate();
    const { selectedBusinessUnit } = useBusinessUnit();
    const { hasPermission } = useAuth();
    const [form] = Form.useForm();
    const profilePicRef = useRef<FileUploadFieldHandle>(null);
    const [loading, setLoading] = useState(false);
    const [allRoles, setAllRoles] = useState<Role[]>([]);
    const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);

    useEffect(() => {
        if (hasPermission('staff.roles.view')) {
            getRoles(selectedBusinessUnit?.id).then(setAllRoles).catch(() => { });
        }
        if (isEditMode) {
            loadUser();
        }
    }, [id]);

    const loadUser = async () => {
        try {
            const staff = await getStaffOne(Number(id), selectedBusinessUnit?.id);
            form.setFieldsValue({
                fullName: staff.fullName,
                username: staff.username,
                email: staff.email,
                profilePicture: staff.profilePicture
                ? { url: staff.profilePicture, originalName: staff.profilePicture.split('/').pop() }
                : null,
            });
            const roles = await getUserRoles(Number(id));
            setSelectedRoleIds(roles.map((r) => r.id));
        } catch (error) {
            message.error('Failed to load user');
        }
    };

    const onFinish = async (values: any) => {
        const { confirmPassword, profilePicture, ...rest } = values;
        setLoading(true);
        try {
            let userId = Number(id);
            if (isEditMode) {
                await updateStaff(
                    userId,
                    { fullName: rest.fullName, email: rest.email, profilePicture: profilePicture?.url, },
                    selectedBusinessUnit?.id,
                );
            } else {
                const result = await createStaff(
                    {
                        fullName: rest.fullName,
                        username: rest.username,
                        email: rest.email,
                        password: rest.password,
                        profilePicture: profilePicture?.url,
                    },
                    selectedBusinessUnit?.id,
                );
                userId = result?.staff?.id;
            }

            if (hasPermission('staff.roles.view')) {
                await assignRolesToUser(userId, selectedRoleIds);
            }

            message.success(isEditMode ? 'User updated' : 'User created');
            navigate('/staff/users');
        } catch (error: any) {
            message.error(error?.response?.data?.message?.[0] || error?.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        profilePicRef.current?.discardUnsavedUpload();
        navigate('/staff/users');
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
                    {isEditMode ? 'Edit User' : 'Add User'}
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
                    <Card title="User Details" size="small">
                        <Form.Item
                            label="Full Name"
                            name="fullName"
                            rules={[{ required: true, message: 'Full name is required' }]}
                        >
                            <Input placeholder="e.g. Sara Khan" />
                        </Form.Item>
                        <Form.Item label="Profile Picture" name="profilePicture">
                            <FileUploadField ref={profilePicRef} variant="image" label="Upload Profile Picture" />
                        </Form.Item>
                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[
                                { required: true, message: 'Email is required' },
                                { type: 'email', message: 'Enter a valid email' },
                            ]}
                        >
                            <Input placeholder="e.g. sara@example.com" />
                        </Form.Item>
                    </Card>
                </Col>

                <Col span={12}>
                    <Card title="Credentials" size="small" style={{ marginBottom: 16 }}>
                        <Form.Item
                            label="Username"
                            name="username"
                            rules={[{ required: true, message: 'Username is required' }]}
                        >
                            <Input placeholder="e.g. sara.staff" disabled={isEditMode} />
                        </Form.Item>

                        {!isEditMode && (
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        label="Password"
                                        name="password"
                                        rules={[
                                            { required: true, message: 'Password is required' },
                                            { min: 6, message: 'Minimum 6 characters' },
                                        ]}
                                    >
                                        <Input.Password placeholder="Password" />
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
                                                    if (getFieldValue('password') === value) return Promise.resolve();
                                                    return Promise.reject(new Error('Passwords do not match'));
                                                },
                                            }),
                                        ]}
                                    >
                                        <Input.Password placeholder="Confirm Password" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        )}
                    </Card>

                    {hasPermission('staff.roles.view') && (
                        <Card title="Assign Roles" size="small">
                            <Form.Item label="Select Roles">
                                <Select
                                    mode="multiple"
                                    placeholder="Roles"
                                    value={selectedRoleIds}
                                    onChange={(values) => setSelectedRoleIds(values)}
                                    style={{ width: '100%' }}
                                    options={allRoles.map((role) => ({ value: role.id, label: role.name }))}
                                />
                            </Form.Item>
                        </Card>
                    )}
                </Col>
            </Row>
        </Form>
    );
}