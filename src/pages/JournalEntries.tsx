import { useEffect, useState } from 'react';
import { Table, Typography, Button, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import { getJournalEntries, type JournalEntryRecord } from '../api/journalEntries';
import { useBusinessUnit } from '../context/BusinessUnitContext';
import { useAuth } from '../context/AuthContext';

const { Title } = Typography;

export default function JournalEntries() {
  const { selectedBusinessUnit } = useBusinessUnit();
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const [journals, setJournals] = useState<JournalEntryRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedBusinessUnit?.id) {
      load();
    }
  }, [selectedBusinessUnit, page]);

  const load = async () => {
    setLoading(true);
    try {
      const result = await getJournalEntries(selectedBusinessUnit?.id, page, 10);
      setJournals(result.journals);
      setTotal(result.total);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          Journal Entries ({total})
        </Title>
        {hasPermission('finance.journal-entries.add') && (
          <Button type="primary" onClick={() => navigate('/finance/journal-entries/new')}>
            New Journal Entry
          </Button>
        )}
      </div>

      <Table
        dataSource={journals}
        rowKey="id"
        loading={loading}
        pagination={{ current: page, total, pageSize: 10, onChange: setPage }}
        columns={[
          {
            title: 'Voucher No',
            dataIndex: 'voucherNo',
            render: (voucherNo: string, record: JournalEntryRecord) => (
              <Button
                type="link"
                style={{ padding: 0, height: 'auto' }}
                onClick={() => navigate(`/finance/journal-entries/${record.id}`)}
              >
                {voucherNo}
              </Button>
            ),
          },
          { title: 'Posting Date', dataIndex: 'postingDate' },
          { title: 'Description', dataIndex: 'description' },
          {
            title: 'Status',
            dataIndex: 'status',
            render: (status: string) => (
              <Tag color={status === 'Posted' ? 'green' : status === 'Cancelled' ? 'red' : 'orange'}>{status}</Tag>
            ),
          },
        ]}
      />
    </div>
  );
}