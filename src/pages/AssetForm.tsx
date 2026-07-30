import { useEffect, useState } from 'react';
import { Form, Input, Button, Card, message, Typography, InputNumber, DatePicker } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { getAsset, createAsset, updateAsset } from '../api/assets';
import { useBusinessUnit } from '../context/BusinessUnitContext';

const { Title } = Typography;

export default function AssetForm() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { selectedBusinessUnit } = useBusinessUnit();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      loadAsset();
    }
  }, [id]);

  const loadAsset = async () => {
    try {
      const asset = await getAsset(Number(id), selectedBusinessUnit?.id);
      form.setFieldsValue({
        name: asset.name,
        assetCode: asset.assetCode,
        assetCategory: asset.assetCategory,
        serialNumber: asset.serialNumber,
        purchaseDate: asset.purchaseDate ? dayjs(asset.purchaseDate) : null,
        purchasePrice: asset.purchasePrice,
        currentBookValue: asset.currentBookValue,
      });
    } catch (error) {
      message.error('Failed to load asset');
    }
  };

  const onFinish = async (values: any) => {
    const { purchaseDate, ...rest } = values;
    const payload = { ...rest, purchaseDate: purchaseDate ? purchaseDate.format('YYYY-MM-DD') : undefined };
    setLoading(true);
    try {
      if (isEditMode) {
        await updateAsset(Number(id), payload, selectedBusinessUnit?.id);
        message.success('Asset updated');
      } else {
        await createAsset(payload, selectedBusinessUnit?.id);
        message.success('Asset created');
      }
      navigate('/master-data/assets');
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
          <Button onClick={() => navigate('/master-data/assets')}>Cancel</Button>
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
        <Form.Item label="Purchase Price" name="purchasePrice">
          <InputNumber style={{ width: '100%' }} min={0} />
        </Form.Item>
        <Form.Item label="Current Book Value" name="currentBookValue">
          <InputNumber style={{ width: '100%' }} min={0} />
        </Form.Item>
      </Card>
    </Form>
  );
}