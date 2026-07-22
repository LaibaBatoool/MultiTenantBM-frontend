import { useEffect, useState } from 'react';
import { Table, Typography, message, Button, Modal, Checkbox, Space, Form, Input } from 'antd';
import { SafetyCertificateOutlined, PlusOutlined } from '@ant-design/icons';
import { getStaff, createStaff, type Staff } from '../api/staff';
import { getRoles, getUserRoles, assignRolesToUser, type Role } from '../api/roles';
import { useBusinessUnit } from '../context/BusinessUnitContext';

const { Title } = Typography;

export default function Users() {
  const { selectedBusinessUnit } = useBusinessUnit();
  const [data, setData] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [allRoles, setAllRoles] = useState<Role[]>([]);

  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addForm] = Form.useForm();
  const [newUserRoleIds, setNewUserRoleIds] = useState<number[]>([]);
  const [creating, setCreating] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const staff = await getStaff(selectedBusinessUnit?.id);
      setData(staff);
    } catch (error) {
      message.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    getRoles().then(setAllRoles).catch(() => {});
  }, [selectedBusinessUnit]);

  const openRoleModal = async (staff: Staff) => {
    setSelectedStaff(staff);
    setRoleModalOpen(true);
    try {
      const roles = await getUserRoles(staff.id);
      setSelectedRoleIds(roles.map((r) => r.id));
    } catch (error) {
      setSelectedRoleIds([]);
    }
  };

  const handleSaveRoles = async () => {
    if (!selectedStaff) return;
    setSaving(true);
    try {
      await assignRolesToUser(selectedStaff.id, selectedRoleIds);
      message.success('Roles updated');
      setRoleModalOpen(false);
    } catch (error) {
      message.error('Failed to update roles');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateUser = async (values: any) => {
    setCreating(true);
    try {
      const result = await createStaff(
        {
          fullName: values.fullName,
          username: values.username,
          email: values.email,
          password: values.password,
        },
        selectedBusinessUnit?.id,
      );

      if (newUserRoleIds.length > 0 && result?.staff?.id) {
        await assignRolesToUser(result.staff.id, newUserRoleIds);
      }

      message.success('User created');
      setAddModalOpen(false);
      addForm.resetFields();
      setNewUserRoleIds([]);
      fetchData();
    } catch (error: any) {
      message.error(error?.response?.data?.message?.[0] || error?.response?.data?.message || 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  const columns = [
    { title: 'Full Name', dataIndex: 'fullName', key: 'fullName' },
    { title: 'Username', dataIndex: 'username', key: 'username' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: Staff) => (
        <Button icon={<SafetyCertificateOutlined />} size="small" onClick={() => openRoleModal(record)}>
          Manage Roles
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          Users ({data.length})
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddModalOpen(true)}>
          Add New
        </Button>
      </div>

      <Table columns={columns} dataSource={data} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />

      <Modal
        title={`Manage Roles — ${selectedStaff?.fullName || ''}`}
        open={roleModalOpen}
        onCancel={() => setRoleModalOpen(false)}
        onOk={handleSaveRoles}
        confirmLoading={saving}
      >
        <Checkbox.Group
          value={selectedRoleIds}
          onChange={(values) => setSelectedRoleIds(values as number[])}
          style={{ width: '100%' }}
        >
          <Space orientation="vertical">
            {allRoles.map((role) => (
              <Checkbox key={role.id} value={role.id}>
                {role.name}
              </Checkbox>
            ))}
          </Space>
        </Checkbox.Group>
      </Modal>

      <Modal
        title="Add User"
        open={addModalOpen}
        onCancel={() => {
          setAddModalOpen(false);
          addForm.resetFields();
          setNewUserRoleIds([]);
        }}
        onOk={() => addForm.submit()}
        confirmLoading={creating}
      >
        <Form form={addForm} layout="vertical" onFinish={handleCreateUser}>
          <Form.Item label="Full Name" name="fullName" rules={[{ required: true, message: 'Full name is required' }]}>
            <Input />
          </Form.Item>
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
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Password is required' }, { min: 6, message: 'Minimum 6 characters' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item label="Assign Roles">
            <Checkbox.Group
              value={newUserRoleIds}
              onChange={(values) => setNewUserRoleIds(values as number[])}
              style={{ width: '100%' }}
            >
              <Space orientation="vertical">
                {allRoles.map((role) => (
                  <Checkbox key={role.id} value={role.id}>
                    {role.name}
                  </Checkbox>
                ))}
              </Space>
            </Checkbox.Group>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}