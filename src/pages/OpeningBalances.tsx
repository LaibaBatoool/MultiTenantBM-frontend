import { useEffect, useMemo, useState } from 'react';
import { Card, Select, DatePicker, Button, Typography, message, Table, Tag, InputNumber, Spin, Empty } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { getFiscalYears, type FiscalYearRecord } from '../api/fiscalYears';
import { getAccounts, type AccountRecord } from '../api/accounts';
import { postOpeningBalance, getOpeningBalance } from '../api/openingBalance';
import { useBusinessUnit } from '../context/BusinessUnitContext';

const { Title, Text } = Typography;

interface AccountTreeNode extends AccountRecord {
  children: AccountTreeNode[];
  depth: number;
}

function buildTree(accounts: AccountRecord[]): AccountTreeNode[] {
  const map = new Map<number, AccountTreeNode>();
  accounts.forEach((a) => map.set(a.id, { ...a, children: [], depth: 0 }));

  const roots: AccountTreeNode[] = [];
  map.forEach((node) => {
    if (node.parentAccountId && map.has(node.parentAccountId)) {
      map.get(node.parentAccountId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  const setDepth = (nodes: AccountTreeNode[], depth: number) => {
    for (const n of nodes) {
      n.depth = depth;
      setDepth(n.children, depth + 1);
    }
  };
  setDepth(roots, 0);

  return roots;
}

function flattenTree(nodes: AccountTreeNode[]): AccountTreeNode[] {
  const result: AccountTreeNode[] = [];
  const walk = (list: AccountTreeNode[]) => {
    for (const n of list) {
      result.push(n);
      if (n.children.length) walk(n.children);
    }
  };
  walk(nodes);
  return result;
}

export default function OpeningBalances() {
  const { selectedBusinessUnit } = useBusinessUnit();
  const [fiscalYears, setFiscalYears] = useState<FiscalYearRecord[]>([]);
  const [accounts, setAccounts] = useState<AccountRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);

  const [selectedFiscalYearId, setSelectedFiscalYearId] = useState<number | null>(null);
  const [openingDate, setOpeningDate] = useState<Dayjs | null>(null);
  const [values, setValues] = useState<Record<number, { debit?: number; credit?: number }>>({});
  const [alreadyPosted, setAlreadyPosted] = useState(false);

  useEffect(() => {
    if (selectedBusinessUnit?.id) {
      loadInitialData();
    }
  }, [selectedBusinessUnit]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [fy, acc] = await Promise.all([
        getFiscalYears(selectedBusinessUnit?.id),
        getAccounts(selectedBusinessUnit?.id),
      ]);
      setFiscalYears(fy);
      setAccounts(acc);
    } catch (error) {
      message.error('Failed to load fiscal years or accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleFiscalYearChange = async (id: number) => {
    setSelectedFiscalYearId(id);
    setValues({});

    const fy = fiscalYears.find((f) => f.id === id);
    if (!fy) return;

    setOpeningDate(dayjs(fy.startDate));
    setAlreadyPosted(fy.openingBalancePosted);

    if (fy.openingBalancePosted) {
      setCheckingStatus(true);
      try {
        const result = await getOpeningBalance(id, selectedBusinessUnit?.id);
        if (result.journal) {
          const prefill: Record<number, { debit?: number; credit?: number }> = {};
          result.journal.lines.forEach((line: any) => {
            const accId = line.accountId ?? line.account?.id;
            if (!accId) return;
            prefill[accId] = {
              debit: Number(line.debit) > 0 ? Number(line.debit) : undefined,
              credit: Number(line.credit) > 0 ? Number(line.credit) : undefined,
            };
          });
          setValues(prefill);
        }
      } catch (error) {
        message.error('Failed to load existing opening balance');
      } finally {
        setCheckingStatus(false);
      }
    }
  };

  const postingAccountTree = useMemo(() => buildTree(accounts), [accounts]);
  const flatRows = useMemo(() => flattenTree(postingAccountTree), [postingAccountTree]);

  const handleAmountChange = (accountId: number, field: 'debit' | 'credit', value: number | null) => {
    if (alreadyPosted) return;
    setValues((prev) => ({
      ...prev,
      [accountId]: {
        debit: field === 'debit' ? value ?? undefined : undefined,
        credit: field === 'credit' ? value ?? undefined : undefined,
      },
    }));
  };

  const totals = useMemo(() => {
    let totalDebit = 0;
    let totalCredit = 0;
    Object.values(values).forEach((v) => {
      totalDebit += v.debit || 0;
      totalCredit += v.credit || 0;
    });
    return { totalDebit, totalCredit, balanced: totalDebit > 0 && totalDebit === totalCredit };
  }, [values]);

  const handlePost = async () => {
    if (alreadyPosted) return;
    if (!selectedFiscalYearId || !openingDate) {
      message.error('Please select a fiscal year and opening date');
      return;
    }
    if (!totals.balanced) {
      message.error('Total Debit must equal Total Credit before posting');
      return;
    }

    const lines = Object.entries(values)
      .filter(([, v]) => (v.debit && v.debit > 0) || (v.credit && v.credit > 0))
      .map(([accountId, v]) => ({
        accountId: Number(accountId),
        debit: v.debit || 0,
        credit: v.credit || 0,
      }));

    if (lines.length < 2) {
      message.error('Please enter at least 2 account balances');
      return;
    }

    setPosting(true);
    try {
      await postOpeningBalance(
        { fiscalYearId: selectedFiscalYearId, openingDate: openingDate.format('YYYY-MM-DD'), lines },
        selectedBusinessUnit?.id,
      );
      message.success('Opening balance posted successfully');
      const updatedFiscalYears = await getFiscalYears(selectedBusinessUnit?.id);
      setFiscalYears(updatedFiscalYears);
      await handleFiscalYearChange(selectedFiscalYearId);
    } catch (error: any) {
      message.error(error?.response?.data?.message?.[0] || error?.response?.data?.message || 'Failed to post opening balance');
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

  if (!selectedBusinessUnit?.id) {
    return <Empty description="Please select a Business Unit first" />;
  }

  const postDisabled = alreadyPosted || !totals.balanced || posting;

  return (
    <div>
      <Title level={4}>Opening Balance</Title>

      <Card size="small" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <Text strong>Fiscal Year</Text>
            <div>
              <Select
                style={{ width: 220 }}
                placeholder="Select fiscal year"
                value={selectedFiscalYearId}
                onChange={handleFiscalYearChange}
                options={fiscalYears.map((fy) => ({
                  value: fy.id,
                  label: `${fy.name}${fy.openingBalancePosted ? ' (Posted)' : ''}`,
                }))}
              />
            </div>
          </div>

          <div>
            <Text strong>Opening Date</Text>
            <div>
              <DatePicker value={openingDate} onChange={setOpeningDate} disabled={!selectedFiscalYearId || alreadyPosted} />
            </div>
          </div>

          {selectedFiscalYearId && (
            <Tag color={alreadyPosted ? 'green' : 'orange'}>
              {alreadyPosted ? 'Opening Balance Already Posted (read-only)' : 'Not Posted Yet'}
            </Tag>
          )}
        </div>
      </Card>

      {!selectedFiscalYearId && <Empty description="Select a fiscal year to begin" />}

      {selectedFiscalYearId && checkingStatus && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
          <Spin />
        </div>
      )}

      {selectedFiscalYearId && !checkingStatus && (
        <>
          <Card size="small">
            <Table
              dataSource={flatRows}
              rowKey="id"
              pagination={false}
              scroll={{ y: 'calc(100vh - 50px)' }}
              columns={[
                {
                  title: 'Account',
                  render: (_, record: AccountTreeNode) => (
                    <span style={{ paddingLeft: record.depth * 20 }}>
                      <Text strong={record.isGroup} type={record.isGroup ? 'secondary' : undefined}>
                        {record.code} — {record.name}
                      </Text>
                    </span>
                  ),
                },
                {
                  title: 'Debit',
                  width: 120,
                  render: (_, record: AccountTreeNode) =>
                    record.isGroup ? null : (
                      <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        value={values[record.id]?.debit}
                        onChange={(v) => handleAmountChange(record.id, 'debit', v)}
                        disabled={alreadyPosted || !!values[record.id]?.credit}
                      />
                    ),
                },
                {
                  title: 'Credit',
                  width: 120,
                  render: (_, record: AccountTreeNode) =>
                    record.isGroup ? null : (
                      <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        value={values[record.id]?.credit}
                        onChange={(v) => handleAmountChange(record.id, 'credit', v)}
                        disabled={alreadyPosted || !!values[record.id]?.debit}
                      />
                    ),
                },
              ]}
            />
          </Card>

          {}
          <div
            style={{
              marginTop: 16,
              padding: '10px 16px',
              background: totals.balanced ? '#f6ffed' : '#fff2e8',
              border: `1px solid ${totals.balanced ? '#b7eb8f' : '#ffbb96'}`,
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
              <Text style={{ fontSize: 13 }}>
                Total Debit: <strong>{totals.totalDebit.toLocaleString()}</strong>
              </Text>
              <Text style={{ fontSize: 13 }}>
                Total Credit: <strong>{totals.totalCredit.toLocaleString()}</strong>
              </Text>
              <Tag color={totals.balanced ? 'success' : 'warning'} style={{ margin: 0 }}>
                {totals.balanced ? '✓ Balanced' : 'Not Balanced'}
              </Tag>
            </div>

            <Button
              type="primary"
              disabled={postDisabled}
              loading={posting}
              onClick={handlePost}
            >
              {alreadyPosted ? 'Posted' : 'Post Opening Balance'}
            </Button>
          </div>
        </>
      )}
      
    </div>
  );
}