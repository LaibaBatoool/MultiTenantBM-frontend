import { useEffect, useMemo, useState } from 'react';
import { Form, Input, Button, Card, message, Typography, InputNumber, DatePicker, Select } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { getAsset, createAsset, updateAsset } from '../api/assets';
import { getAccounts, type AccountRecord } from '../api/accounts';
import { useBusinessUnit } from '../context/BusinessUnitContext';

const { Title } = Typography;

export default function AssetForm() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { selectedBusinessUnit } = useBusinessUnit();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<AccountRecord[]>([]);

  useEffect(() => {
    if (selectedBusinessUnit?.id) {
      loadAccounts();
    }
  }, [selectedBusinessUnit]);

  useEffect(() => {
    if (isEditMode) {
      loadAsset();
    }
  }, [id]);

  const loadAccounts = async () => {
    const data = await getAccounts(selectedBusinessUnit?.id);
    setAccounts(data);
  };

  const loadAsset = async () => {
    try {
      const asset = await getAsset(Number(id), selectedBusinessUnit?.id);
      form.setFieldsValue({
        name: asset.name,
        assetCode: asset.assetCode,
        assetCategory: asset.assetCategory,
        serialNumber: asset.serialNumber,
        purchaseDate: asset.purchaseDate ? dayjs(asset.purchaseDate) : null,
        purchasePrice: asset.purchasePrice != null ? Number(asset.purchasePrice) : undefined,
        currentBookValue: asset.currentBookValue != null ? Number(asset.currentBookValue) : undefined, assetAccountId: asset.assetAccountId,
        paymentAccountId: asset.paymentAccountId,
      });
    } catch (error) {
      message.error('Failed to load asset');
    }
  };

  const assetAccountOptions = useMemo(() => {
    const fixedAssetsGroup = accounts.find((a) => a.isGroup && a.name === 'Fixed Assets');
    if (!fixedAssetsGroup) return [];
    return accounts
      .filter((a) => !a.isGroup && a.parentAccountId === fixedAssetsGroup.id)
      .map((a) => ({ value: a.id, label: `${a.code} - ${a.name}` }));
  }, [accounts]);

  const paymentAccountOptions = useMemo(() => {
    const groupIds = accounts
      .filter((a) => a.isGroup && (a.name === 'Cash' || a.name === 'Bank'))
      .map((a) => a.id);
    return accounts
      .filter((a) => !a.isGroup && groupIds.includes(a.parentAccountId as number))
      .map((a) => ({ value: a.id, label: `${a.code} - ${a.name}` }));
  }, [accounts]);

  const onFinish = async (values: any) => {
    const { purchaseDate, ...rest } = values;
    const payload = {
      ...rest,
      purchasePrice: rest.purchasePrice != null ? Number(rest.purchasePrice) : rest.purchasePrice,
      currentBookValue: rest.currentBookValue != null ? Number(rest.currentBookValue) : rest.currentBookValue,
      assetAccountId: rest.assetAccountId != null ? Number(rest.assetAccountId) : rest.assetAccountId,
      paymentAccountId: rest.paymentAccountId != null ? Number(rest.paymentAccountId) : rest.paymentAccountId,
      purchaseDate: purchaseDate ? purchaseDate.format('YYYY-MM-DD') : undefined,
    };
    setLoading(true);
    try {
      if (isEditMode) {
        await updateAsset(Number(id), payload, selectedBusinessUnit?.id);
        message.success('Asset updated');
      } else {
        await createAsset(payload, selectedBusinessUnit?.id);
        message.success('Asset created');
      }
      navigate('/finance/assets');
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
          {isEditMode ? 'Edit Asset' : 'Add Asset'}
        </Title>
        <div>
          <Button type="primary" htmlType="submit" loading={loading} style={{ marginRight: 8 }}>
            Save
          </Button>
          <Button onClick={() => navigate('/finance/assets')}>Cancel</Button>
        </div>
      </div>

      <Card title="Asset Details" size="small" style={{ maxWidth: 600 }}>
        <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Name is required' }]}>
          <Input placeholder="e.g. Dell Laptop" />
        </Form.Item>
        <Form.Item label="Asset Code" name="assetCode">
          <Input />
        </Form.Item>
        <Form.Item label="Category" name="assetCategory">
          <Input placeholder="e.g. Computer Equipment" />
        </Form.Item>
        <Form.Item label="Serial Number" name="serialNumber">
          <Input />
        </Form.Item>
        <Form.Item label="Purchase Date" name="purchaseDate">
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          label="Purchase Price"
          name="purchasePrice"
          rules={[{ required: true, message: 'Purchase Price is required' }]}
        >
          <InputNumber style={{ width: '100%' }} min={0} />
        </Form.Item>
        <Form.Item label="Current Book Value" name="currentBookValue">
          <InputNumber style={{ width: '100%' }} min={0} />
        </Form.Item>
        <Form.Item
          label="Asset Account"
          name="assetAccountId"
          rules={[{ required: true, message: 'Asset Account is required' }]}
        >
          <Select
            placeholder="Select the Chart of Accounts asset account"
            options={assetAccountOptions}
            showSearch
            optionFilterProp="label"
            disabled={isEditMode}
          />
        </Form.Item>
        <Form.Item
          label="Paid Via"
          name="paymentAccountId"
          rules={[{ required: true, message: 'Payment Account is required' }]}
        >
          <Select
            placeholder="Select Cash or Bank account"
            options={paymentAccountOptions}
            showSearch
            optionFilterProp="label"
            disabled={isEditMode}
          />
        </Form.Item>
      </Card>
    </Form>
  );
}