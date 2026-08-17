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
import { createCapitalContribution } from '../api/capital-contributions';
import { useBusinessUnit } from '../context/BusinessUnitContext';

const { Title } = Typography;

export default function CapitalContributionForm() {
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
      contributionDate: dayjs(),
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

  const capitalAccounts = useMemo(
    () => accounts.filter((account) => !account.isGroup && account.accountType === 'EQUITY'),
    [accounts],
  );

  const handleSubmit = async (values: any) => {
    if (!selectedBusinessUnit?.id) {
      message.warning('Select a business unit first.');
      return;
    }

    setSaving(true);

    try {
      await createCapitalContribution(
        {
          contributionDate: values.contributionDate.format('YYYY-MM-DD'),
          receivingAccountId: values.receivingAccountId,
          capitalAccountId: values.capitalAccountId,
          amount: values.amount,
          contributor: values.contributor || undefined,
          description: values.description || undefined,
          attachmentPath: values.attachmentPath || undefined,
        },
        selectedBusinessUnit.id,
      );

      message.success('Capital contribution created successfully.');

      navigate('/finance/capital-contributions');
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Capital contribution cant be created.');
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
          Add Capital Contribution
        </Title>

        <Button onClick={() => navigate(-1)}>Back</Button>
      </div>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            contributionDate: dayjs(),
          }}
        >
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name="contributionDate"
                label="Contribution Date"
                rules={[{ required: true, message: 'Contribution date is required.' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item name="contributor" label="Contributor / Owner">
                <Input placeholder="e.g. Owner, Partner" />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                name="amount"
                label="Amount"
                rules={[{ required: true, message: 'Amount is required.' }]}
              >
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
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
                name="capitalAccountId"
                label="Capital Account"
                rules={[{ required: true, message: 'Capital account is required.' }]}
              >
                <Select
                  showSearch
                  placeholder="Select capital account"
                  options={capitalAccounts.map((account) => ({
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
              Save Contribution
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}