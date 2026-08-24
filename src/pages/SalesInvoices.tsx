import { useEffect, useState } from 'react';
import { Button, Table, Typography, message, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { getSalesInvoices, type SalesInvoiceRecord } from '../api/salesInvoices';
import { useBusinessUnit } from '../context/BusinessUnitContext';

const { Title } = Typography;

export default function SalesInvoices() {
  const { selectedBusinessUnit } = useBusinessUnit();
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState<SalesInvoiceRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const loadInvoices = async () => {
    if (!selectedBusinessUnit?.id) {
      setInvoices([]);
      return;
    }

    setLoading(true);
    try {
      const invoiceList = await getSalesInvoices(selectedBusinessUnit.id);
      setInvoices(invoiceList);
    } catch (error) {
      message.error('Failed to load Sales Invoices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [selectedBusinessUnit]);

  const columns = [
    { title: 'Voucher', key: 'voucher', render: (_: unknown, record: SalesInvoiceRecord) => record.journal?.voucherNo || '' },
    {
      title: 'Date',
      dataIndex: 'invoiceDate',
      key: 'invoiceDate',
      render: (value: string) => dayjs(value).format('YYYY-MM-DD'),
    },
    { title: 'Customer', key: 'customer', render: (_: unknown, record: SalesInvoiceRecord) => record.customer?.name || '' },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (value: string | null) => (value ? dayjs(value).format('YYYY-MM-DD') : ''),
    },
    {
      title: 'Subtotal',
      dataIndex: 'subtotal',
      key: 'subtotal',
      align: 'right' as const,
      render: (value: number) => value.toLocaleString(),
    },
    {
      title: 'Tax',
      key: 'tax',
      align: 'right' as const,
      render: (_: unknown, record: SalesInvoiceRecord) => `${record.taxAmount.toLocaleString()} (${record.taxRate}%)`,
    },
    {
      title: 'Total',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      align: 'right' as const,
      render: (value: number) => <Tag color="blue">{value.toLocaleString()}</Tag>,
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          Sales Invoices ({invoices.length})
        </Title>

        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('new')}>
          Add New
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={invoices}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        onRow={(record) => ({
          onClick: () => navigate(`${record.id}`),
          style: { cursor: 'pointer' },
        })}
      />
    </div>
  );
}