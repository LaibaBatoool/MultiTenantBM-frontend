import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Checkbox,
  Col,
  Form,
  Input,
  Row,
  Select,
  Typography,
  message,
} from 'antd';
import { useNavigate } from 'react-router-dom';

import { getAccounts, createAccount, type AccountRecord } from '../api/accounts';
import { useBusinessUnit } from '../context/BusinessUnitContext';

const { Title } = Typography;

const ACCOUNT_TYPES = ['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE', 'COGS'];

export default function AccountForm() {
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
  }, [selectedBusinessUnit]);

  const groupAccounts = useMemo(() => accounts.filter((account) => account.isGroup), [accounts]);

  const selectedParentId = Form.useWatch('parentAccountId', form);

  const selectedParent = useMemo(
    () => groupAccounts.find((account) => account.id === selectedParentId),
    [groupAccounts, selectedParentId],
  );

  const handleSubmit = async (values: any) => {
    if (!selectedBusinessUnit?.id) {
      message.warning('Select a business unit first.');
      return;
    }

    setSaving(true);

    try {
      await createAccount(
        {
          code: values.code,
          name: values.name,
          accountType: values.parentAccountId ? undefined : values.accountType,
          parentAccountId: values.parentAccountId || undefined,
          isGroup: values.isGroup || false,
        },
        selectedBusinessUnit.id,
      );

      message.success('Account created successfully.');

      navigate('/master-data/accounts');
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Account cant be created.');
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
          Add Account
        </Title>

        <Button onClick={() => navigate(-1)}>Back</Button>
      </div>

      <Card>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name="code"
                label="Account Code"
                rules={[{ required: true, message: 'Account code is required.' }]}
              >
                <Input placeholder="e.g. 1113" />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                name="name"
                label="Account Name"
                rules={[{ required: true, message: 'Account name is required.' }]}
              >
                <Input placeholder="e.g. Advance Salary Account" />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                name="parentAccountId"
                label="Parent Account"
              >
                <Select
                  allowClear
                  showSearch
                  placeholder="Select parent account (optional)"
                  options={groupAccounts.map((account) => ({
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
                name="accountType"
                label="Account Type"
                rules={[
                  {
                    required: !selectedParentId,
                    message: 'Account type is required for a root-level account.',
                  },
                ]}
              >
                <Select
                  placeholder={selectedParent ? selectedParent.accountType : 'Select account type'}
                  disabled={Boolean(selectedParentId)}
                  options={ACCOUNT_TYPES.map((type) => ({ value: type, label: type }))}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item name="isGroup" valuePropName="checked" label=" ">
                <Checkbox>This is a group account (can have child accounts)</Checkbox>
              </Form.Item>
            </Col>
          </Row>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => navigate(-1)}>Cancel</Button>

            <Button type="primary" htmlType="submit" loading={saving}>
              Save Account
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}