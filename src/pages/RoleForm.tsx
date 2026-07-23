import { useEffect, useState } from 'react';
import { Form, Input, Button, Card, message, Typography, Checkbox } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { getRole, createRole, updateRole } from '../api/roles';
import { getPermissionTree, type PermissionNode as PermissionNodeType } from '../api/modules';
import { useBusinessUnit } from '../context/BusinessUnitContext';

const { Title } = Typography;

function collectPermissionIds(node: PermissionNodeType): number[] {
  const ids: number[] = [node.id];
  node.children?.forEach((child) => ids.push(...collectPermissionIds(child)));
  return ids;
}

function PermissionTreeNode({
  node,
  depth,
  checkedKeys,
  onToggle,
}: {
  node: PermissionNodeType;
  depth: number;
  checkedKeys: number[];
  onToggle: (node: PermissionNodeType, checked: boolean) => void;
}) {
  const isChecked = checkedKeys.includes(node.id);

  return (
    <div style={{ marginLeft: depth * 24, marginBottom: 8 }}>
      <Checkbox checked={isChecked} onChange={(e) => onToggle(node, e.target.checked)}>
        {node.name}
      </Checkbox>
      {node.children?.map((child) => (
        <PermissionTreeNode
          key={child.id}
          node={child}
          depth={depth + 1}
          checkedKeys={checkedKeys}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}

export default function RoleForm() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { selectedBusinessUnit } = useBusinessUnit();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [moduleTree, setModuleTree] = useState<PermissionNodeType[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<number[]>([]);

  useEffect(() => {
    loadModules();
    if (isEditMode) {
      loadRole();
    }
  }, [id]);

  const loadModules = async () => {
    try {
      const tree = await getPermissionTree();
      setModuleTree(tree);
    } catch (error) {
      message.error('Failed to load permissions');
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

  const handleToggle = (node: PermissionNodeType, checked: boolean) => {
    const ids = collectPermissionIds(node);
    setCheckedKeys((prev) => {
      const set = new Set(prev);
      ids.forEach((permId) => (checked ? set.add(permId) : set.delete(permId)));
      return Array.from(set);
    });
  };

  const onFinish = async (values: { name: string; description?: string }) => {
    setLoading(true);
    try {
      if (isEditMode) {
        await updateRole(Number(id), { ...values, permissionIds: checkedKeys });
        message.success('Role updated');
      } else {
        await createRole({ ...values, permissionIds: checkedKeys }, selectedBusinessUnit?.id);
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
        <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Role name is required' }]}>
          <Input placeholder="e.g. Manager" />
        </Form.Item>
        <Form.Item label="Description" name="description">
          <Input placeholder="Optional description" />
        </Form.Item>
      </Card>

      <Card title="Permissions" size="small">
        {moduleTree.map((node) => (
          <PermissionTreeNode
            key={node.id}
            node={node}
            depth={0}
            checkedKeys={checkedKeys}
            onToggle={handleToggle}
          />
        ))}
      </Card>
    </Form>
  );
}