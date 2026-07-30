import { useEffect, useState } from 'react';
import { Form, Input, Button, Card, message, Typography, Select, Checkbox } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { getBankAccount, createBankAccount, updateBankAccount } from '../api/bankAccounts';
import { getCompaniesByType, type CompanyRecord } from '../api/companies';
import { useBusinessUnit } from '../context/BusinessUnitContext';

const { Title } = Typography;

const COMPANY_TYPES = [
  { value: 'vendor', label: 'Vendor' },
  { value: 'supplier', label: 'Supplier' },
  { value: 'contractor', label: 'Contractor' },
  { value: 'consultant', label: 'Consultant' },
  { value: 'customer', label: 'Customer' },
];

export default function BankAccountForm() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { selectedBusinessUnit } = useBusinessUnit();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<string | undefined>();
  const [companies, setCompanies] = useState<CompanyRecord[]>([]);

  useEffect(() => {
    if (isEditMode) {
      loadRecord();
    }
  }, [id]);

  useEffect(() => {
    if (selectedType && selectedBusinessUnit) {
      getCompaniesByType(selectedType, selectedBusinessUnit.id, 'active').then(setCompanies).catch(() => setCompanies([]));
    } else {
      setCompanies([]);
    }
  }, [selectedType, selectedBusinessUnit]);

  const loadRecord = async () => {
    try {
      const account = await getBankAccount(Number(id), selectedBusinessUnit?.id);
      form.setFieldsValue({
        bankName: account.bankName,
        branch: account.branch,
        accountTitle: account.accountTitle,
        accountNumber: account.accountNumber,
        iban: account.iban,
        isDefault: account.isDefault,
        companyId: account.company?.id,
      });
    } catch (error) {
      message.error('Failed to load bank account');
    }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      if (isEditMode) {
        await updateBankAccount(Number(id), values, selectedBusinessUnit?.id);
        message.success('Bank account updated');
      } else {
        await createBankAccount(values, selectedBusinessUnit?.id);
        message.success('Bank account created');
      }
      navigate('/master-data/bank-accounts');
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
          {isEditMode ? 'Edit Bank Account' : 'Add Bank Account'}
        </Title>
        <div>
          <Button type="primary" htmlType="submit" loading={loading} style={{ marginRight: 8 }}>
            Save
          </Button>
          <Button onClick={() => navigate('/master-data/bank-accounts')}>Cancel</Button>
        </div>
      </div>

      <Card title="Company Selection" size="small" style={{ maxWidth: 600, marginBottom: 16 }}>
        <Form.Item label="Company Type" required>
          <Select
            placeholder="Select company type"
            value={selectedType}
            onChange={(value) => {
              setSelectedType(value);
              form.setFieldValue('companyId', undefined);
            }}
            options={COMPANY_TYPES}
          />
        </Form.Item>
        <Form.Item
          label="Company"
          name="companyId"
          rules={[{ required: true, message: 'Company is required' }]}
        >
          <Select
            placeholder="Select company"
            options={companies.map((c) => ({ value: c.id, label: c.name }))}
          />
        </Form.Item>
      </Card>

      <Card title="Bank Account Details" size="small" style={{ maxWidth: 600 }}>
        <Form.Item label="Bank Name" name="bankName" rules={[{ required: true, message: 'Bank name is required' }]}>
          <Input placeholder="e.g. HBL" />
        </Form.Item>
        <Form.Item label="Branch" name="branch">
          <Input />
        </Form.Item>
        <Form.Item label="Account Title" name="accountTitle">
          <Input />
        </Form.Item>
        <Form.Item
          label="Account Number"
          name="accountNumber"
          rules={[{ required: true, message: 'Account number is required' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item label="IBAN" name="iban">
          <Input />
        </Form.Item>
        <Form.Item name="isDefault" valuePropName="checked">
          <Checkbox>Set as default account</Checkbox>
        </Form.Item>
      </Card>
    </Form>
  );
}