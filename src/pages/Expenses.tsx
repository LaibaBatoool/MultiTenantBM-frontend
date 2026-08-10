import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Col, DatePicker, Divider, Form, Input, InputNumber, Row, Select, Table, Typography, message } from 'antd';
import dayjs from 'dayjs';
import { getAccounts, type AccountRecord } from '../api/accounts';
import { createExpense, getExpenses, type ExpenseRecord } from '../api/expenses';
import { useBusinessUnit } from '../context/BusinessUnitContext';

const { Title, Text } = Typography;

export default function Expenses() {
  const { selectedBusinessUnit } = useBusinessUnit();
  const [form] = Form.useForm();

  const [accounts, setAccounts] = useState<AccountRecord[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    if (!selectedBusinessUnit?.id) {
      setAccounts([]);
      setExpenses([]);
      return;
    }

    setLoading(true);
    try {
      const [accountList, expenseList] = await Promise.all([
        getAccounts(selectedBusinessUnit.id),
        getExpenses(selectedBusinessUnit.id),
      ]);
      setAccounts(accountList);
      setExpenses(expenseList);
    } catch (error) {
      message.error('Failed to load Expenses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    form.setFieldsValue({ expenseDate: dayjs() });
  }, [selectedBusinessUnit]);

  const expenseAccounts = useMemo(
    () => accounts.filter((account) => !account.isGroup && account.accountType === 'EXPENSE'),
    [accounts],
  );
  const paymentAccounts = useMemo(() => accounts.filter((account) => !account.isGroup), [accounts]);

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
      form.resetFields();
      form.setFieldsValue({ expenseDate: dayjs() });
      loadData();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Expense cant be created.');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'expenseDate',
      key: 'expenseDate',
      render: (value: string) => dayjs(value).format('YYYY-MM-DD'),
    },
    {
      title: 'Expense Account',
      key: 'expenseAccount',
      render: (_: unknown, record: ExpenseRecord) => record.expenseAccount ? `${record.expenseAccount.code} - ${record.expenseAccount.name}` : '',
    },
    {
      title: 'Payment Account',
      key: 'paymentAccount',
      render: (_: unknown, record: ExpenseRecord) => record.paymentAccount ? `${record.paymentAccount.code} - ${record.paymentAccount.name}` : '',
    },
    { title: 'Vendor/Company', dataIndex: 'vendorName', key: 'vendorName', render: (value: string | null) => value || '' },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right' as const,
      render: (value: number) => value.toLocaleString(),
    },
    { title: 'Description', dataIndex: 'description', key: 'description', render: (value: string | null) => value || '' },
    {
      title: 'Voucher',
      key: 'voucher',
      render: (_: unknown, record: ExpenseRecord) => record.journal?.voucherNo || '',
    },
  ];

  return (
    <div>
      <Title level={3} style={{ marginTop: 0 }}>
        Expenses
      </Title>

      <Card style={{ marginBottom: 16 }} title="New Expense">
        <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ expenseDate: dayjs() }}>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="expenseDate" label="Expense Date" rules={[{ required: true, message: 'Expense date required hai.' }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="expenseAccountId" label="Expense Account" rules={[{ required: true, message: 'Expense account select karein.' }]}>
                <Select
                  showSearch
                  placeholder="Select expense account"
                  options={expenseAccounts.map((account) => ({
                    value: account.id,
                    label: `${account.code} - ${account.name}`,
                  }))}
                  filterOption={(input, option) => String(option?.label || '').toLowerCase().includes(input.toLowerCase())}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="paymentAccountId" label="Payment Account" rules={[{ required: true, message: 'Payment account select karein.' }]}>
                <Select
                  showSearch
                  placeholder="Select payment account"
                  options={paymentAccounts.map((account) => ({
                    value: account.id,
                    label: `${account.code} - ${account.name}`,
                  }))}
                  filterOption={(input, option) => String(option?.label || '').toLowerCase().includes(input.toLowerCase())}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="amount" label="Amount" rules={[{ required: true, message: 'Amount required hai.' }]}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="vendorName" label="Vendor / Company">
                <Input placeholder="Optional" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="projectId" label="Project ID">
                <InputNumber style={{ width: '100%' }} min={0} placeholder="Optional" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="attachmentPath" label="Attachment Path">
                <Input placeholder="Optional" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="description" label="Description">
                <Input.TextArea rows={3} placeholder="Optional" />
              </Form.Item>
            </Col>
          </Row>

          <Button type="primary" htmlType="submit" loading={saving}>
            Save Expense
          </Button>
        </Form>
      </Card>

      <Divider />

      <Card title={`Expense Entries (${expenses.length})`}>
        <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
          Saved expenses will post a journal entry and appear in Profit &amp; Loss under Operating Expenses.
        </Text>
        <Table columns={columns} dataSource={expenses} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
      </Card>
    </div>
  );
}