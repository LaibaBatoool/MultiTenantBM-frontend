import { useEffect, useState } from 'react';
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
  Table,
  Typography,
  message,
  Popconfirm,
  Spin,
  Tag,
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate, useParams } from 'react-router-dom';
import { createSalesInvoice, getSalesInvoice, type SalesInvoiceRecord } from '../api/salesInvoices';
import { getCompaniesByType, type CompanyRecord } from '../api/companies';
import { getProjects, type ProjectRecord } from '../api/projects';
import { useBusinessUnit } from '../context/BusinessUnitContext';

const { Title, Text } = Typography;

interface ItemRow {
  key: string;
  description?: string;
  quantity?: number;
  unitPrice?: number;
}

let rowCounter = 0;
const newRow = (): ItemRow => ({ key: `row-${rowCounter++}`, quantity: 1 });

export default function SalesInvoiceForm() {
  const { id } = useParams();
  const isViewMode = Boolean(id);
  const navigate = useNavigate();
  const { selectedBusinessUnit } = useBusinessUnit();
  const [form] = Form.useForm();

  const [customers, setCustomers] = useState<CompanyRecord[]>([]);
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [rows, setRows] = useState<ItemRow[]>([newRow()]);
  const [taxRate, setTaxRate] = useState<number>(0);
  const [invoice, setInvoice] = useState<SalesInvoiceRecord | null>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (selectedBusinessUnit?.id) {
      loadCustomers();
      loadProjects();
      form.setFieldsValue({ invoiceDate: dayjs() });
    }
  }, [selectedBusinessUnit]);

  useEffect(() => {
    if (isViewMode && selectedBusinessUnit?.id) {
      loadInvoice();
    }
  }, [id, selectedBusinessUnit]);

  const loadCustomers = async () => {
    try {
      const list = await getCompaniesByType('customer', selectedBusinessUnit?.id);
      setCustomers(list);
    } catch (error) {
      message.error('Failed to load customers.');
    }
  };

  const loadProjects = async () => {
    try {
      const list = await getProjects(selectedBusinessUnit?.id);
      setProjects(list);
    } catch (error) {
      message.error('Failed to load projects.');
    }
  };

  const loadInvoice = async () => {
    setLoading(true);
    try {
      const data = await getSalesInvoice(Number(id), selectedBusinessUnit?.id);
      setInvoice(data);
      setTaxRate(Number(data.taxRate));
      setRows(
        (data.items || []).map((item) => ({
          key: `row-${item.id}`,
          description: item.description,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
        })),
      );
    } catch (error) {
      message.error('Failed to load invoice.');
    } finally {
      setLoading(false);
    }
  };

  const updateRow = (key: string, patch: Partial<ItemRow>) => {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  };

  const addRow = () => setRows((prev) => [...prev, newRow()]);
  const removeRow = (key: string) => setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.key !== key) : prev));

  const subtotal = rows.reduce((sum, r) => sum + (r.quantity || 0) * (r.unitPrice || 0), 0);
  const taxAmount = Number((subtotal * (taxRate / 100)).toFixed(2));
  const totalAmount = Number((subtotal + taxAmount).toFixed(2));

  const handleSubmit = async (values: any) => {
    if (!selectedBusinessUnit?.id) {
      message.warning('Select a business unit first.');
      return;
    }

    const items = rows
      .filter((r) => r.description && r.quantity && r.unitPrice)
      .map((r) => ({ description: r.description!, quantity: r.quantity!, unitPrice: r.unitPrice! }));

    if (items.length < 1) {
      message.warning('Kam az kam 1 item add karein.');
      return;
    }

    setSaving(true);
    try {
      await createSalesInvoice(
        {
          invoiceDate: values.invoiceDate.format('YYYY-MM-DD'),
          dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : undefined,
          customerId: values.customerId,
          taxRate,
          description: values.description || undefined,
          projectId: values.projectId || undefined,
          items,
        },
        selectedBusinessUnit.id,
      );

      message.success('Sales invoice created successfully.');
      navigate('/finance/sales-invoices');
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Invoice cant be created.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          {isViewMode ? `Invoice ${invoice?.journal?.voucherNo || ''}` : 'New Sales Invoice'}
        </Title>
        <Button onClick={() => navigate(-1)}>Back</Button>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            invoiceDate: isViewMode ? dayjs(invoice?.invoiceDate) : dayjs(),
            dueDate: isViewMode && invoice?.dueDate ? dayjs(invoice.dueDate) : undefined,
            customerId: invoice?.customerId,
            description: invoice?.description || undefined,
          }}
        >
          <Row gutter={16}>
            <Col xs={24} md={6}>
              <Form.Item name="invoiceDate" label="Invoice Date" rules={[{ required: true, message: 'Invoice date is required.' }]}>
                <DatePicker style={{ width: '100%' }} disabled={isViewMode} />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item name="dueDate" label="Due Date">
                <DatePicker style={{ width: '100%' }} disabled={isViewMode} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="customerId" label="Customer" rules={[{ required: true, message: 'Customer is required.' }]}>
                <Select
                  showSearch
                  placeholder="Select customer"
                  disabled={isViewMode}
                  options={customers.map((c) => ({ value: c.id, label: c.name }))}
                  filterOption={(input, option) => String(option?.label || '').toLowerCase().includes(input.toLowerCase())}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={4}>
              <Form.Item label="Tax Rate (%)">
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  value={taxRate}
                  disabled={isViewMode}
                  onChange={(v) => setTaxRate(v || 0)}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="projectId" label="Project">
                <Select
                  allowClear
                  showSearch
                  placeholder="Optional"
                  disabled={isViewMode}
                  options={projects.map((p) => ({ value: p.id, label: `${p.code} - ${p.name}` }))}
                  filterOption={(input, option) => String(option?.label || '').toLowerCase().includes(input.toLowerCase())}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={16}>
              <Form.Item name="description" label="Description">
                <Input.TextArea rows={1} placeholder="Optional" disabled={isViewMode} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card size="small">
        <Table
          dataSource={rows}
          rowKey="key"
          pagination={false}
          columns={[
            {
              title: 'Description',
              render: (_, row: ItemRow) => (
                <Input
                  value={row.description}
                  disabled={isViewMode}
                  onChange={(e) => updateRow(row.key, { description: e.target.value })}
                />
              ),
            },
            {
              title: 'Quantity',
              width: 120,
              render: (_, row: ItemRow) => (
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  value={row.quantity}
                  disabled={isViewMode}
                  onChange={(v) => updateRow(row.key, { quantity: v ?? undefined })}
                />
              ),
            },
            {
              title: 'Unit Price',
              width: 160,
              render: (_, row: ItemRow) => (
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  value={row.unitPrice}
                  disabled={isViewMode}
                  onChange={(v) => updateRow(row.key, { unitPrice: v ?? undefined })}
                />
              ),
            },
            {
              title: 'Amount',
              width: 140,
              align: 'right' as const,
              render: (_, row: ItemRow) => ((row.quantity || 0) * (row.unitPrice || 0)).toLocaleString(),
            },
            ...(isViewMode
              ? []
              : [
                {
                  title: '',
                  width: 50,
                  render: (_: unknown, row: ItemRow) => (
                    <Popconfirm title="Remove this item?" onConfirm={() => removeRow(row.key)}>
                      <Button icon={<DeleteOutlined />} danger type="text" disabled={rows.length <= 1} />
                    </Popconfirm>
                  ),
                },
              ]),
          ]}
        />

        {!isViewMode && (
          <Button icon={<PlusOutlined />} onClick={addRow} style={{ marginTop: 12 }}>
            Add Item
          </Button>
        )}
      </Card>

      <div
        style={{
          marginTop: 16,
          padding: '12px 16px',
          background: '#fafafa',
          border: '1px solid #f0f0f0',
          borderRadius: 8,
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 24,
          alignItems: 'center',
        }}
      >
        <Text>Subtotal: <strong>{subtotal.toLocaleString()}</strong></Text>
        <Text>Tax ({taxRate}%): <strong>{taxAmount.toLocaleString()}</strong></Text>
        <Tag color="blue" style={{ fontSize: 14, padding: '4px 10px' }}>
          Total: {totalAmount.toLocaleString()}
        </Tag>
      </div>

      {!isViewMode && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          <Button onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="primary" loading={saving} onClick={() => form.submit()}>
            Save Invoice
          </Button>
        </div>
      )}
    </div>
  );
}