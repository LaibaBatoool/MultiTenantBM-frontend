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
import { createReceipt } from '../api/receipts';
import { useBusinessUnit } from '../context/BusinessUnitContext';

const { Title } = Typography;

export default function ReceiptsForm() {
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
      receiptDate: dayjs(),
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

  const otherAccounts = useMemo(() => accounts.filter((account) => !account.isGroup), [accounts]);

  const handleSubmit = async (values: any) => {
    if (!selectedBusinessUnit?.id) {
      message.warning('Select a business unit first.');
      return;
    }

    setSaving(true);

    try {
      await createReceipt(
        {
          receiptDate: values.receiptDate.format('YYYY-MM-DD'),
          receivingAccountId: values.receivingAccountId,
          againstAccountId: values.againstAccountId,
          amount: values.amount,
          receivedFrom: values.receivedFrom || undefined,
          description: values.description || undefined,
          attachmentPath: values.attachmentPath || undefined,
        },
        selectedBusinessUnit.id,
      );

      message.success('Receipt created successfully.');

      navigate('/finance/cash-bank/receipts');
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Receipt cant be created.');
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
          Add Receipt
        </Title>

        <Button onClick={() => navigate(-1)}>Back</Button>
      </div>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            receiptDate: dayjs(),
          }}
        >
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name="receiptDate"
                label="Receipt Date"
                rules={[{ required: true, message: 'Receipt date is required.' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                name="receivingAccountId"
                label="Receiving Account (Cash/Bank)"
                rules={[{ required: true, message: 'Receiving account is required.' }]}
              >
                <Select
                  showSearch
                  placeholder="Select receiving account"
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
                name="againstAccountId"
                label="Against Account"
                rules={[{ required: true, message: 'Against account is required.' }]}
              >
                <Select
                  showSearch
                  placeholder="Select against account"
                  options={otherAccounts.map((account) => ({
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

            <Col xs={24} md={8}>
              <Form.Item name="receivedFrom" label="Received From">
                <Input placeholder="Optional" />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item name="attachmentPath" label="Attachment Path">
                <Input placeholder="Optional" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item name="description" label="Description">
                <Input.TextArea rows={3} placeholder="Optional" />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => navigate(-1)}>Cancel</Button>

            <Button type="primary" htmlType="submit" loading={saving}>
              Save Receipt
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}