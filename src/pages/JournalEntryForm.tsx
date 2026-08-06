import { useEffect, useMemo, useState } from 'react';
import {
  Input,
  Button,
  Card,
  message,
  Typography,
  DatePicker,
  Table,
  InputNumber,
  Select,
  Tag,
  Popconfirm,
  Spin,
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import dayjs, { type Dayjs } from 'dayjs';
import { createJournalEntry, getJournalEntry } from '../api/journalEntries';
import { getAccounts, type AccountRecord } from '../api/accounts';
import { getFiscalYears, type FiscalYearRecord } from '../api/fiscalYears';
import { useBusinessUnit } from '../context/BusinessUnitContext';

const { Title, Text } = Typography;

interface LineRow {
  key: string;
  accountId?: number;
  description?: string;
  debit?: number;
  credit?: number;
}

let rowCounter = 0;
const newRow = (): LineRow => ({ key: `row-${rowCounter++}` });

export default function JournalEntryForm() {
  const { id } = useParams();
  const isViewMode = Boolean(id);
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedBusinessUnit } = useBusinessUnit();
  const backPath = (location.state as { from?: string } | null)?.from || '/finance/journal-entries';

  const [accounts, setAccounts] = useState<AccountRecord[]>([]);
  const [fiscalYears, setFiscalYears] = useState<FiscalYearRecord[]>([]);
  const [postingDate, setPostingDate] = useState<Dayjs | null>(dayjs());
  const [description, setDescription] = useState('');
  const [rows, setRows] = useState<LineRow[]>([newRow(), newRow()]);
  const [voucherInfo, setVoucherInfo] = useState<{ voucherNo: string; status: string } | null>(null);

  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (selectedBusinessUnit?.id) {
      loadAccounts();
      loadFiscalYears();
    }
  }, [selectedBusinessUnit]);

  useEffect(() => {
    if (isViewMode && selectedBusinessUnit?.id) {
      loadJournal();
    }
  }, [id, selectedBusinessUnit]);

  const loadAccounts = async () => {
    try {
      const acc = await getAccounts(selectedBusinessUnit?.id);
      setAccounts(acc.filter((a) => !a.isGroup));
    } catch (error) {
      message.error('Failed to load accounts');
    }
  };

  const loadFiscalYears = async () => {
    try {
      const years = await getFiscalYears(selectedBusinessUnit?.id);
      setFiscalYears(years);
    } catch (error) {
      message.error('Failed to load fiscal years');
    }
  };

  const loadJournal = async () => {
    setLoading(true);
    try {
      const journal = await getJournalEntry(Number(id), selectedBusinessUnit?.id);
      setPostingDate(dayjs(journal.postingDate));
      setDescription(journal.description || '');
      setVoucherInfo({ voucherNo: journal.voucherNo, status: journal.status });
      setRows(
        (journal.lines || []).map((line: any) => ({
          key: `row-${line.id}`,
          accountId: line.accountId ?? line.account?.id,
          description: line.description,
          debit: Number(line.debit) > 0 ? Number(line.debit) : undefined,
          credit: Number(line.credit) > 0 ? Number(line.credit) : undefined,
        })),
      );
    } catch (error) {
      message.error('Failed to load journal entry');
    } finally {
      setLoading(false);
    }
  };

  const updateRow = (key: string, patch: Partial<LineRow>) => {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  };

  const addRow = () => setRows((prev) => [...prev, newRow()]);
  const removeRow = (key: string) => setRows((prev) => (prev.length > 2 ? prev.filter((r) => r.key !== key) : prev));

  const totals = rows.reduce(
    (acc, r) => ({ debit: acc.debit + (r.debit || 0), credit: acc.credit + (r.credit || 0) }),
    { debit: 0, credit: 0 },
  );
  const balanced = totals.debit > 0 && totals.debit === totals.credit;

  const validation = useMemo(() => {
    const postingDateValue = postingDate?.format('YYYY-MM-DD');
    const fiscalYear = postingDateValue
      ? fiscalYears.find((year) => postingDateValue >= year.startDate && postingDateValue <= year.endDate)
      : undefined;
    const period = fiscalYear?.periods?.find(
      (entry) => postingDateValue && postingDateValue >= entry.startDate && postingDateValue <= entry.endDate,
    );

    const nonEmptyRows = rows.filter((row) => row.accountId || row.debit || row.credit);
    const lineChecks = nonEmptyRows.map((row) => {
      const debit = row.debit || 0;
      const credit = row.credit || 0;
      const hasSingleAmount = (debit > 0) !== (credit > 0);

      return {
        hasAccount: Boolean(row.accountId),
        hasSingleAmount,
        isComplete: Boolean(row.accountId) && hasSingleAmount,
      };
    });

    const hasAtLeastTwoLines = nonEmptyRows.length >= 2;
    const hasAtLeastOneDebitLine = nonEmptyRows.some((row) => (row.debit || 0) > 0 && !(row.credit || 0));
    const hasAtLeastOneCreditLine = nonEmptyRows.some((row) => (row.credit || 0) > 0 && !(row.debit || 0));
    const everyLineHasAccount = lineChecks.every((line) => line.hasAccount);
    const everyLineHasSingleAmount = lineChecks.every((line) => line.hasSingleAmount);
    const allLinesComplete = lineChecks.every((line) => line.isComplete);
    const hasOpenPostingPeriod = Boolean(
      postingDateValue && fiscalYear && period && fiscalYear.status === 'Open' && period.status === 'Open',
    );

    let reason = '';
    if (!postingDateValue) {
      reason = 'Please select a posting date';
    } else if (!fiscalYear) {
      reason = 'Posting date must belong to an open accounting period';
    } else if (fiscalYear.status !== 'Open') {
      reason = 'Posting date must belong to an open fiscal year';
    } else if (!period) {
      reason = 'Posting date must belong to an accounting period';
    } else if (period.status !== 'Open') {
      reason = 'Posting date must belong to an open accounting period';
    } else if (!hasAtLeastTwoLines) {
      reason = 'At least 2 journal lines are required';
    } else if (!everyLineHasAccount) {
      reason = 'Every line must have a posting account';
    } else if (!everyLineHasSingleAmount) {
      reason = 'Each line must have either a debit or a credit';
    } else if (!hasAtLeastOneDebitLine) {
      reason = 'At least 1 debit line is required';
    } else if (!hasAtLeastOneCreditLine) {
      reason = 'At least 1 credit line is required';
    } else if (totals.debit <= 0) {
      reason = 'Total Debit must be greater than 0';
    } else if (totals.credit <= 0) {
      reason = 'Total Credit must be greater than 0';
    } else if (totals.debit !== totals.credit) {
      reason = 'Total Debit must equal Total Credit';
    }

    return {
      canPost:
        hasOpenPostingPeriod &&
        hasAtLeastTwoLines &&
        allLinesComplete &&
        everyLineHasAccount &&
        everyLineHasSingleAmount &&
        hasAtLeastOneDebitLine &&
        hasAtLeastOneCreditLine &&
        totals.debit > 0 &&
        totals.credit > 0 &&
        totals.debit === totals.credit,
      reason,
    };
  }, [fiscalYears, postingDate, rows, totals.credit, totals.debit]);

  const handlePost = async () => {
    if (!validation.canPost) {
      message.error(validation.reason || 'Please complete all posting rules before posting');
      return;
    }

    setPosting(true);
    try {
      await createJournalEntry(
        {
          postingDate: postingDate!.format('YYYY-MM-DD'),
          description: description || undefined,
          lines: rows
            .filter((r) => r.accountId || r.debit || r.credit)
            .map((r) => ({
              accountId: r.accountId!,
              description: r.description,
              debit: r.debit || 0,
              credit: r.credit || 0,
            })),
        },
        selectedBusinessUnit?.id,
      );
      message.success('Journal entry posted successfully');
      navigate('/finance/journal-entries');
    } catch (error: any) {
      message.error(
        error?.response?.data?.message?.[0] || error?.response?.data?.message || 'Failed to post journal entry',
      );
    } finally {
      setPosting(false);
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
          {isViewMode ? `Journal Entry ${voucherInfo?.voucherNo || ''}` : 'New Journal Entry'}
        </Title>
        <div>
          {!isViewMode && (
            <Button type="primary" loading={posting} onClick={handlePost} disabled={!validation.canPost} style={{ marginRight: 8 }}>
              Post
            </Button>
          )}
          <Button onClick={() => navigate(backPath)}>Back</Button>
        </div>
      </div>

      <Card size="small" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <Text strong>Posting Date</Text>
            <div>
              <DatePicker value={postingDate} onChange={setPostingDate} disabled={isViewMode} />
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 280 }}>
            <Text strong>Description</Text>
            <div>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isViewMode}
                placeholder="e.g. Year-end depreciation adjustment"
              />
            </div>
          </div>
          {voucherInfo && <Tag color={voucherInfo.status === 'Posted' ? 'green' : 'red'}>{voucherInfo.status}</Tag>}
        </div>
      </Card>

      <Card size="small">
        <Table
          dataSource={rows}
          rowKey="key"
          pagination={false}
          columns={[
            {
              title: 'Account',
              width: 260,
              render: (_, row: LineRow) => (
                <Select
                  showSearch
                  style={{ width: '100%' }}
                  placeholder="Select account"
                  value={row.accountId}
                  disabled={isViewMode}
                  optionFilterProp="label"
                  onChange={(v) => updateRow(row.key, { accountId: v })}
                  options={accounts.map((a) => ({ value: a.id, label: `${a.code} — ${a.name}` }))}
                />
              ),
            },
            {
              title: 'Description',
              render: (_, row: LineRow) => (
                <Input
                  value={row.description}
                  disabled={isViewMode}
                  onChange={(e) => updateRow(row.key, { description: e.target.value })}
                />
              ),
            },
            {
              title: 'Debit',
              width: 140,
              render: (_, row: LineRow) => (
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  value={row.debit}
                  disabled={isViewMode || !!row.credit}
                  onChange={(v) => updateRow(row.key, { debit: v ?? undefined })}
                />
              ),
            },
            {
              title: 'Credit',
              width: 140,
              render: (_, row: LineRow) => (
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  value={row.credit}
                  disabled={isViewMode || !!row.debit}
                  onChange={(v) => updateRow(row.key, { credit: v ?? undefined })}
                />
              ),
            },
            ...(isViewMode
              ? []
              : [
                  {
                    title: '',
                    width: 50,
                    render: (_: unknown, row: LineRow) => (
                      <Popconfirm title="Remove this row?" onConfirm={() => removeRow(row.key)}>
                        <Button icon={<DeleteOutlined />} danger type="text" disabled={rows.length <= 2} />
                      </Popconfirm>
                    ),
                  },
                ]),
          ]}
        />

        {!isViewMode && (
          <Button icon={<PlusOutlined />} onClick={addRow} style={{ marginTop: 12 }}>
            Add Row
          </Button>
        )}
      </Card>

      <div
        style={{
          marginTop: 16,
          padding: '10px 16px',
          background: balanced ? '#f6ffed' : '#fff2e8',
          border: `1px solid ${balanced ? '#b7eb8f' : '#ffbb96'}`,
          borderRadius: 8,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          <Text style={{ fontSize: 13 }}>
            Total Debit: <strong>{totals.debit.toLocaleString()}</strong>
          </Text>
          <Text style={{ fontSize: 13 }}>
            Total Credit: <strong>{totals.credit.toLocaleString()}</strong>
          </Text>
          <Tag color={balanced ? 'success' : 'warning'} style={{ margin: 0 }}>
            {balanced ? '✓ Balanced' : 'Not Balanced'}
          </Tag>
          {!validation.canPost && <Text type="secondary" style={{ fontSize: 13 }}>{validation.reason}</Text>}
        </div>
      </div>
    </div>
  );
}