import { useEffect, useState } from 'react';
import { Form, Input, Button, Card, message, Typography, Tree } from 'antd';
import type { DataNode } from 'antd/es/tree';
import { useNavigate, useParams } from 'react-router-dom';
import { getRole, createRole, updateRole } from '../api/roles';
import { getModuleTree, type ModuleNode } from '../api/modules';

const { Title } = Typography;

function buildTreeData(modules: ModuleNode[]): DataNode[] {
  return modules.map((mod) => ({
    key: mod.permissions?.[0]?.id ?? `module-${mod.id}`,
    title: mod.name,
    children: mod.children && mod.children.length > 0 ? buildTreeData(mod.children) : undefined,
  }));
}

export default function RoleForm() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [treeData, setTreeData] = useState<DataNode[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);

  useEffect(() => {
    loadModules();
    if (isEditMode) {
      loadRole();
    }
  }, [id]);

  const loadModules = async () => {
    try {
      const modules = await getModuleTree();
      setTreeData(buildTreeData(modules));
    } catch (error) {
      message.error('Failed to load modules');
    }
  };

  const loadRole = async () => {
    try {
      const role = await getRole(Number(id));
      form.setFieldsValue({ name: role.name, description: role.description });
      setCheckedKeys(role.permissions.map((p) => p.id));
    } catch (error) {
      message.error('Failed to load role');
    }
  };

  const onFinish = async (values: { name: string; description?: string }) => {
    const permissionIds = checkedKeys
      .filter((key) => typeof key === 'number')
      .map((key) => Number(key));

    setLoading(true);
    try {
      if (isEditMode) {
        await updateRole(Number(id), { ...values, permissionIds });
        message.success('Role updated');
      } else {
        await createRole({ ...values, permissionIds });
        message.success('Role created');
      }
      navigate('/staff/roles');
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
          {isEditMode ? 'Edit Role' : 'Add Role'}
        </Title>
        <div>
          <Button type="primary" htmlType="submit" loading={loading} style={{ marginRight: 8 }}>
            Save
          </Button>
          <Button onClick={() => navigate('/staff/roles')}>Cancel</Button>
        </div>
      </div>

      <Card title="Role Details" size="small" style={{ marginBottom: 16 }}>
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: 'Role name is required' }]}
        >
          <Input placeholder="e.g. Manager" />
        </Form.Item>
        <Form.Item label="Description" name="description">
          <Input placeholder="Optional description" />
        </Form.Item>
      </Card>

      <Card title="Permissions" size="small">
        <Tree
          checkable
          checkedKeys={checkedKeys}
          onCheck={(keys) => setCheckedKeys(keys as React.Key[])}
          treeData={treeData}
          defaultExpandAll
        />
      </Card>
    </Form>
  );
}