import { useEffect, useState } from 'react';
import { Table, Typography, Button, message, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate, useParams } from 'react-router-dom';
import { getAccountsPayableLedger, type AccountsPayableLedgerResult } from '../api/accountsPayable';
import { useBusinessUnit } from '../context/BusinessUnitContext';

const { Title, Text } = Typography;

export default function AccountsPayableLedger() {
  const { id } = useParams();
  const { selectedBusinessUnit } = useBusinessUnit();
  const navigate = useNavigate();

  const [ledger, setLedger] = useState<AccountsPayableLedgerResult | null>(null);
  const [loading, setLoading] = useState(false);

  const loadLedger = async () => {
    if (!selectedBusinessUnit?.id || !id) return;
    setLoading(true);
    try {
      const data = await getAccountsPayableLedger(+id, selectedBusinessUnit.id);
      setLedger(data);
    } catch (error) {
      message.error('Customer ledger load nahi ho saka.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLedger();
  }, [selectedBusinessUnit, id]);

  if (loading) return <Spin />;
  if (!ledger) return null;

  return (
    <div>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/reports/accounts-payable')} style={{ marginBottom: 16 }}>
        Back
      </Button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          {ledger.vendor.name} — Ledger
        </Title>
        <Text strong>
          Closing Balance: {ledger.closingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
      </div>

      <Table
        columns={[
          { title: 'Date', dataIndex: 'postingDate', key: 'postingDate', render: (value: string) => dayjs(value).format('YYYY-MM-DD') },
          { title: 'Voucher', dataIndex: 'voucherNo', key: 'voucherNo' },
          { title: 'Description', dataIndex: 'description', key: 'description', render: (value: string | null) => value || '' },
          {
            title: 'Debit',
            dataIndex: 'debit',
            key: 'debit',
            align: 'right' as const,
            render: (value: number) => (value ? value.toLocaleString() : ''),
          },
          {
            title: 'Credit',
            dataIndex: 'credit',
            key: 'credit',
            align: 'right' as const,
            render: (value: number) => (value ? value.toLocaleString() : ''),
          },
          {
            title: 'Balance',
            dataIndex: 'balance',
            key: 'balance',
            align: 'right' as const,
            render: (value: number) => value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          },
        ]}
        dataSource={ledger.lines}
        rowKey="id"
        pagination={{ pageSize: 15 }}
      />
    </div>
  );
}