import { useEffect, useState } from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { getExpenseType, createExpenseType, updateExpenseType } from '../api/expenseTypes';
import { useBusinessUnit } from '../context/BusinessUnitContext';

const { Title } = Typography;

export default function ExpenseTypeForm() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { selectedBusinessUnit } = useBusinessUnit();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      loadRecord();
    }
  }, [id]);

  const loadRecord = async () => {
    try {
      const expenseType = await getExpenseType(Number(id), selectedBusinessUnit?.id);
      form.setFieldsValue({ name: expenseType.name, description: expenseType.description });
    } catch (error) {
      message.error('Failed to load expense type');
    }
  };

  const onFinish = async (values: { name: string; description?: string }) => {
    setLoading(true);
    try {
      if (isEditMode) {
        await updateExpenseType(Number(id), values, selectedBusinessUnit?.id);
        message.success('Expense type updated');
      } else {
        await createExpenseType(values, selectedBusinessUnit?.id);
        message.success('Expense type created');
      }
      navigate('/master-data/expense-types');
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Something went wrong');
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
          {isEditMode ? 'Edit Expense Type' : 'Add Expense Type'}
        </Title>
        <div>
          <Button type="primary" htmlType="submit" loading={loading} style={{ marginRight: 8 }}>
            Save
          </Button>
          <Button onClick={() => navigate('/master-data/expense-types')}>Cancel</Button>
        </div>
      </div>

      <Card title="Expense Type Details" size="small" style={{ maxWidth: 500 }}>
        <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Name is required' }]}>
          <Input placeholder="e.g. Fuel" />
        </Form.Item>
        <Form.Item label="Description" name="description">
          <Input.TextArea rows={3} placeholder="Optional description" />
        </Form.Item>
      </Card>
    </Form>
  );
}