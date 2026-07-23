import { useEffect, useState } from 'react';
import { Form, Input, Button, Card, message, Typography, Row, Col, Select } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { getStaffOne, createStaff, updateStaff } from '../api/staff';
import { getRoles, getUserRoles, assignRolesToUser, type Role } from '../api/roles';
import { useBusinessUnit } from '../context/BusinessUnitContext';
import { useAuth } from '../context/AuthContext';

const { Title } = Typography;

export default function UserForm() {
    const { id } = useParams();
    const isEditMode = Boolean(id);
    const navigate = useNavigate();
    const { selectedBusinessUnit } = useBusinessUnit();
    const { hasPermission } = useAuth();
    const [form] = Form.useForm();
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
            form.setFieldsValue({ fullName: staff.fullName, username: staff.username, email: staff.email });
            const roles = await getUserRoles(Number(id));
            setSelectedRoleIds(roles.map((r) => r.id));
        } catch (error) {
            message.error('Failed to load user');
        }
    };

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            let userId = Number(id);
            if (isEditMode) {
                await updateStaff(userId, { fullName: values.fullName, email: values.email }, selectedBusinessUnit?.id);
            } else {
                const result = await createStaff(
                    { fullName: values.fullName, username: values.username, email: values.email, password: values.password },
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
                    <Button onClick={() => navigate('/staff/users')}>Cancel</Button>
                </div>
            </div>

            <Row gutter={16}>
                <Col span={12}>
                    <Card title="User Details" size="small">
                        <Form.Item label="Full Name" name="fullName" rules={[{ required: true, message: 'Full name is required' }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item label="Username" name="username" rules={[{ required: true, message: 'Username is required' }]}>
                            <Input disabled={isEditMode} />
                        </Form.Item>
                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[{ required: true, message: 'Email is required' }, { type: 'email', message: 'Enter a valid email' }]}
                        >
                            <Input />
                        </Form.Item>
                        {!isEditMode && (
                            <Form.Item
                                label="Password"
                                name="password"
                                rules={[{ required: true, message: 'Password is required' }, { min: 6, message: 'Minimum 6 characters' }]}
                            >
                                <Input.Password />
                            </Form.Item>
                        )}
                    </Card>
                </Col>

                {hasPermission('staff.roles.view') && (
                    <Col span={12}>
                        <Card title="Assign Roles" size="small">
                            <Select
                                mode="multiple"
                                placeholder="Select roles"
                                value={selectedRoleIds}
                                onChange={(values) => setSelectedRoleIds(values)}
                                style={{ width: '100%' }}
                                options={allRoles.map((role) => ({ value: role.id, label: role.name }))}
                            />
                        </Card>
                    </Col>
                )}
            </Row>
        </Form>
    );
}