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
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

import { getAccounts, type AccountRecord } from '../api/accounts';
import { createTransfer } from '../api/transfers';
import { useBusinessUnit } from '../context/BusinessUnitContext';

const { Title } = Typography;

export default function TransfersForm() {
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
      transferDate: dayjs(),
    });
  }, [selectedBusinessUnit]);

  const cashBankAccounts = useMemo(() => {
    const cashBankGroupIds = accounts
      .filter((account) => account.isGroup && (account.name === 'Cash' || account.name === 'Bank'))
      .map((account) => account.id);

    return accounts.filter(
      (account) => !account.isGroup && cashBankGroupIds.includes(account.parentAccountId as number),
    );
  }, [accounts]);

  const handleSubmit = async (values: any) => {
    if (!selectedBusinessUnit?.id) {
      message.warning('Select a business unit first.');
      return;
    }

    if (values.fromAccountId === values.toAccountId) {
      message.error('From account and to account cannot be the same.');
      return;
    }

    setSaving(true);

    try {
      await createTransfer(
        {
          transferDate: values.transferDate.format('YYYY-MM-DD'),
          fromAccountId: values.fromAccountId,
          toAccountId: values.toAccountId,
          amount: values.amount,
          description: values.description || undefined,
        },
        selectedBusinessUnit.id,
      );

      message.success('Transfer created successfully.');

      navigate('/finance/cash-bank/transfers');
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Transfer cant be created.');
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
          Add Transfer
        </Title>

        <Button onClick={() => navigate(-1)}>Back</Button>
      </div>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            transferDate: dayjs(),
          }}
        >
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name="transferDate"
                label="Transfer Date"
                rules={[{ required: true, message: 'Transfer date is required.' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                name="fromAccountId"
                label="From Account"
                rules={[{ required: true, message: 'From account is required.' }]}
              >
                <Select
                  showSearch
                  placeholder="Select from account"
                  options={cashBankAccounts.map((account) => ({
                    value: account.id,
                    label: `${account.code} - ${account.name}`,
                  }))}
                  filterOption={(input, option) =>
                    String(option?.label || '').toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                name="toAccountId"
                label="To Account"
                rules={[{ required: true, message: 'To account is required.' }]}
              >
                <Select
                  showSearch
                  placeholder="Select to account"
                  options={cashBankAccounts.map((account) => ({
                    value: account.id,
                    label: `${account.code} - ${account.name}`,
                  }))}
                  filterOption={(input, option) =>
                    String(option?.label || '').toLowerCase().includes(input.toLowerCase())
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
                rules={[{ required: true, message: 'Amount is required.' }]}
              >
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>

            <Col xs={24} md={16}>
              <Form.Item name="description" label="Description">
                <Input placeholder="Optional" />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => navigate(-1)}>Cancel</Button>

            <Button type="primary" htmlType="submit" loading={saving}>
              Save Transfer
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}