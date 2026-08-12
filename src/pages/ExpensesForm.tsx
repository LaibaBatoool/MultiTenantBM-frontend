import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Typography,
  message,
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

import { getAccounts, type AccountRecord } from '../api/accounts';
import { createExpense } from '../api/expenses';
import { useBusinessUnit } from '../context/BusinessUnitContext';

const { Title } = Typography;

export default function ExpensesForm() {
  const { selectedBusinessUnit } = useBusinessUnit();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [accounts, setAccounts] = useState<AccountRecord[]>([]);
  const [saving, setSaving] = useState(false);

  const loadAccounts = async () => {
    if (!selectedBusinessUnit?.id) {
      setAccounts([]);
      return;
    }

    try {
      const accountList = await getAccounts(selectedBusinessUnit.id);
      setAccounts(accountList);
    } catch (error) {
      message.error('Failed to load accounts.');
    }
  };

  useEffect(() => {
    loadAccounts();
    form.setFieldsValue({
      expenseDate: dayjs(),
    });
  }, [selectedBusinessUnit]);

  const expenseAccounts = useMemo(
    () =>
      accounts.filter(
        (account) =>
          !account.isGroup &&
          (account.accountType === 'EXPENSE' ||
            account.accountType === 'COGS'),
      ),
    [accounts],
  );

  const paymentAccounts = useMemo(() => {
    const cashBankGroupIds = accounts
      .filter(
        (account) =>
          account.isGroup &&
          (account.name === 'Cash' || account.name === 'Bank'),
      )
      .map((account) => account.id);

    return accounts.filter(
      (account) =>
        !account.isGroup &&
        cashBankGroupIds.includes(account.parentAccountId as number),
    );
  }, [accounts]);

  const handleSubmit = async (values: any) => {
    if (!selectedBusinessUnit?.id) {
      message.warning('Select a business unit first.');
      return;
    }

    setSaving(true);

    try {
      await createExpense(
        {
          expenseDate: values.expenseDate.format('YYYY-MM-DD'),
          expenseAccountId: values.expenseAccountId,
          paymentAccountId: values.paymentAccountId,
          amount: values.amount,
          vendorName: values.vendorName || undefined,
          description: values.description || undefined,
          attachmentPath: values.attachmentPath || undefined,
          projectId: values.projectId || undefined,
        },
        selectedBusinessUnit.id,
      );

      message.success('Expense created successfully.');

      navigate('/expenses');
    } catch (error: any) {
      message.error(
        error?.response?.data?.message || 'Expense cant be created.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
      <div>
      <div
  style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  }}
>
  <Title level={3} style={{ margin: 0 }}>
    Add Expense
  </Title>

  <Button
    onClick={() => navigate('/finance/expenses')}
  >
    Back
  </Button>
</div>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            expenseDate: dayjs(),
          }}
        >
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name="expenseDate"
                label="Expense Date"
                rules={[
                  {
                    required: true,
                    message: 'Expense date is required.',
                  },
                ]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                name="expenseAccountId"
                label="Expense Account"
                rules={[
                  {
                    required: true,
                    message: 'Expense account is required.',
                  },
                ]}
              >
                <Select
                  showSearch
                  placeholder="Select expense account"
                  options={expenseAccounts.map((account) => ({
                    value: account.id,
                    label: `${account.code} - ${account.name}`,
                  }))}
                  filterOption={(input, option) =>
                    String(option?.label || '')
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                name="paymentAccountId"
                label="Payment Account"
                rules={[
                  {
                    required: true,
                    message: 'Payment account is required.',
                  },
                ]}
              >
                <Select
                  showSearch
                  placeholder="Select payment account"
                  options={paymentAccounts.map((account) => ({
                    value: account.id,
                    label: `${account.code} - ${account.name}`,
                  }))}
                  filterOption={(input, option) =>
                    String(option?.label || '')
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name="amount"
                label="Amount"
                rules={[
                  {
                    required: true,
                    message: 'Amount is required.',
                  },
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                name="vendorName"
                label="Vendor / Company"
              >
                <Input placeholder="Optional" />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                name="projectId"
                label="Project ID"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  placeholder="Optional"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="attachmentPath"
                label="Attachment Path"
              >
                <Input placeholder="Optional" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="description"
                label="Description"
              >
                <Input.TextArea
                  rows={3}
                  placeholder="Optional"
                />
              </Form.Item>
            </Col>
          </Row>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 8,
            }}
          >
            <Button onClick={() => navigate('/finance/expenses')}>
              Cancel
            </Button>

            <Button
              type="primary"
              htmlType="submit"
              loading={saving}
            >
              Save Expense
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}