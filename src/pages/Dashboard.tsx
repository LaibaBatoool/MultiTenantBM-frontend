import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  Progress,
  Row,
  Skeleton,
  Space,
  Statistic,
  Tag,
  Tooltip,
  Typography,
  theme,
  message,
} from 'antd';

import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  BankOutlined,
  DollarOutlined,
  FileTextOutlined,
  PlusOutlined,
  ReloadOutlined,
  RiseOutlined,
  WalletOutlined,
} from '@ant-design/icons';

import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

import {
  getProfitAndLoss,
  type ProfitLossResult,
} from '../api/profitLoss';

import {
  getBalanceSheet,
  type BalanceSheetResult,
  type BalanceSheetSection,
} from '../api/balanceSheet';

import {
  getFiscalYears,
  type FiscalYearRecord,
} from '../api/fiscalYears';

import {
  getJournalEntries,
  type JournalEntryRecord,
} from '../api/journalEntries';

import { useBusinessUnit } from '../context/BusinessUnitContext';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

interface MonthlyData {
  label: string;
  revenue: number;
  expenses: number;
}

interface DashboardData {
  profitLoss: ProfitLossResult | null;
  balanceSheet: BalanceSheetResult | null;
  fiscalYear: FiscalYearRecord | null;
  monthly: MonthlyData[];
  journals: JournalEntryRecord[];
}

const formatAmount = (value: number) =>
  Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

const formatCompactAmount = (value: number) => {
  const amount = Number(value || 0);

  if (Math.abs(amount) >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M`;
  }

  if (Math.abs(amount) >= 1_000) {
    return `${(amount / 1_000).toFixed(1)}K`;
  }

  return formatAmount(amount);
};

const normalize = (value: string | undefined | null) =>
  String(value || '').trim().toLowerCase();

const getCurrentFiscalYear = (
  fiscalYears: FiscalYearRecord[],
): FiscalYearRecord | null => {
  if (!fiscalYears.length) {
    return null;
  }

  const today = dayjs().format('YYYY-MM-DD');

  return (
    fiscalYears.find(
      (year) =>
        year.startDate <= today &&
        year.endDate >= today,
    ) ?? fiscalYears[0]
  );
};

const collectMatchingBalance = (
  sections: BalanceSheetSection[],
  keywords: string[],
) => {
  let total = 0;
  let matched = false;

  for (const section of sections) {
    const sectionText = normalize(section.name);

    for (const account of section.accounts) {
      const accountText = normalize(
        `${account.code} ${account.name}`,
      );

      const matches = keywords.some(
        (keyword) =>
          sectionText.includes(keyword) ||
          accountText.includes(keyword),
      );

      if (matches) {
        total += Number(account.amount || 0);
        matched = true;
      }
    }
  }

  return {
    total,
    matched,
  };
};

/* =========================================================
   Financial Summary Card
========================================================= */

function FinancialCard({
  title,
  value,
  icon,
  loading,
  valueStyle,
  iconColor,
}: {
  title: string;
  value: number;
  icon: ReactNode;
  loading: boolean;
  valueStyle?: CSSProperties;
  iconColor?: string;
}) {
  const { token } = theme.useToken();

  return (
    <Card
      size="small"
      hoverable
      style={{
        height: '100%',
        borderRadius: token.borderRadiusLG,
        overflow: 'hidden',
      }}
      styles={{
        body: {
          padding: '12px 14px',
        },
      }}
    >
      {loading ? (
        <Skeleton
          active
          title={{ width: '50%' }}
          paragraph={{ rows: 1 }}
        />
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
          }}
        >
          <div
            style={{
              minWidth: 0,
              flex: 1,
            }}
          >
            <Text
              type="secondary"
              style={{
                display: 'block',
                fontSize: 12,
                marginBottom: 4,
              }}
            >
              {title}
            </Text>

            <Statistic
              value={value}
              precision={2}
              valueStyle={{
                fontSize: 17,
                lineHeight: 1.2,
                fontWeight: 600,
                color: token.colorText,
                ...valueStyle,
              }}
            />
          </div>

          <div
            style={{
              width: 25,
              height: 25,
              minWidth: 25,
              borderRadius: token.borderRadius,
              background:
                iconColor
                  ? `${iconColor}12`
                  : token.colorFillSecondary,
              color:
                iconColor || token.colorPrimary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
            }}
          >
            {icon}
          </div>
        </div>
      )}
    </Card>
  );
}

/* =========================================================
   Revenue vs Expenses
========================================================= */

function RevenueExpenseChart({
  data,
  loading,
}: {
  data: MonthlyData[];
  loading: boolean;
}) {
  const { token } = theme.useToken();

  if (loading) {
    return (
      <Card
        size="small"
        hoverable
        title="Revenue vs Expenses"
        styles={{
          body: {
            padding: '12px 14px',
          },
        }}
      >
        <Skeleton active paragraph={{ rows: 5 }} />
      </Card>
    );
  }

  if (!data.length) {
    return (
      <Card
        size="small"
        hoverable
        title="Revenue vs Expenses"
        styles={{
          body: {
            padding: 14,
          },
        }}
      >
        <Empty description="No fiscal-year data available." />
      </Card>
    );
  }

  const width = 760;
  const height = 190;

  const paddingLeft = 50;
  const paddingRight = 15;
  const paddingTop = 12;
  const paddingBottom = 30;

  const chartWidth =
    width - paddingLeft - paddingRight;

  const chartHeight =
    height - paddingTop - paddingBottom;

  const maxValue = Math.max(
    ...data.flatMap((item) => [
      item.revenue,
      item.expenses,
    ]),
    1,
  );

  const points = (
    key: 'revenue' | 'expenses',
  ) =>
    data
      .map((item, index) => {
        const x =
          paddingLeft +
          (index * chartWidth) /
          Math.max(data.length - 1, 1);

        const y =
          paddingTop +
          chartHeight -
          (item[key] / maxValue) *
          chartHeight;

        return `${x},${y}`;
      })
      .join(' ');

  const revenuePoints = points('revenue');
  const expensePoints = points('expenses');

  const yLabels = [0, 0.25, 0.5, 0.75, 1].map(
    (ratio) => ({
      value: maxValue * ratio,
      y:
        paddingTop +
        chartHeight -
        ratio * chartHeight,
    }),
  );

  return (
    <Card
      size="small"
      hoverable
      title={
        <span style={{ fontWeight: 600 }}>
          Revenue vs Expenses
        </span>
      }
      extra={
        <Space size={12}>
          {/* Revenue */}
          <Space size={5}>
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: token.colorPrimary,
                display: 'inline-block',
              }}
            />
            <Text
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: token.colorPrimary,
              }}
            >
              Revenue
            </Text>
          </Space>

          {/* Expenses */}
          <Space size={5}>
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: token.colorTextSecondary,
                display: 'inline-block',
              }}
            />
            <Text
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: token.colorTextSecondary,
              }}
            >
              Expenses
            </Text>
          </Space>
        </Space>
      }
      styles={{
        body: {
          padding: '8px 12px 10px',
        },
      }}
    >
      <div
        style={{
          width: '100%',
          overflowX: 'auto',
        }}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          height="190"
          role="img"
          aria-label="Revenue versus expenses chart"
          style={{
            minWidth: 600,
            display: 'block',
          }}
        >
          {yLabels.map((item) => (
            <g key={item.y}>
              <line
                x1={paddingLeft}
                y1={item.y}
                x2={width - paddingRight}
                y2={item.y}
                stroke={
                  token.colorBorderSecondary
                }
                strokeWidth="1"
              />

              <text
                x={paddingLeft - 8}
                y={item.y + 4}
                textAnchor="end"
                fontSize="10"
                fill={token.colorTextSecondary}
              >
                {formatCompactAmount(item.value)}
              </text>
            </g>
          ))}

          <polyline
            points={revenuePoints}
            fill="none"
            stroke={token.colorPrimary}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <polyline
            points={expensePoints}
            fill="none"
            stroke={token.colorTextSecondary}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="6 5"
          />

          {data.map((item, index) => {
            const x =
              paddingLeft +
              (index * chartWidth) /
              Math.max(data.length - 1, 1);

            const revenueY =
              paddingTop +
              chartHeight -
              (item.revenue / maxValue) *
              chartHeight;

            const expenseY =
              paddingTop +
              chartHeight -
              (item.expenses / maxValue) *
              chartHeight;

            return (
              <g
                key={`${item.label}-${index}`}
              >
                <circle
                  cx={x}
                  cy={revenueY}
                  r="3"
                  fill={token.colorPrimary}
                />

                <circle
                  cx={x}
                  cy={expenseY}
                  r="3"
                  fill={token.colorTextSecondary}
                />

                <text
                  x={x}
                  y={height - 10}
                  textAnchor="middle"
                  fontSize="10"
                  fill={token.colorTextSecondary}
                >
                  {item.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </Card>
  );
}

/* =========================================================
   Expense Breakdown
========================================================= */

function ExpenseBreakdown({
  expenses,
  loading,
}: {
  expenses: ProfitLossResult['operatingExpenses'];
  loading: boolean;
}) {
  const { token } = theme.useToken();

  const sortedExpenses = useMemo(
    () =>
      [...expenses]
        .sort(
          (a, b) =>
            Number(b.amount) -
            Number(a.amount),
        )
        .slice(0, 6),
    [expenses],
  );

  const total = sortedExpenses.reduce(
    (sum, item) =>
      sum + Number(item.amount || 0),
    0,
  );

  return (
    <Card
      size="small"
      hoverable
      title={
        <span style={{ fontWeight: 600 }}>
          Expense Breakdown
        </span>
      }
      style={{ height: '100%' }}
      styles={{
        body: {
          padding: '10px 14px 12px',
        },
      }}
    >
      {loading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : sortedExpenses.length === 0 ? (
        <Empty description="No operating expenses." />
      ) : (
        <Space
          direction="vertical"
          size={9}
          style={{ width: '100%' }}
        >
          {sortedExpenses.map((expense) => {
            const percentage =
              total > 0
                ? (expense.amount / total) *
                100
                : 0;

            return (
              <div key={expense.accountId}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent:
                      'space-between',
                    gap: 12,
                    marginBottom: 4,
                  }}
                >
                  <Tooltip
                    title={`${expense.code} - ${expense.name}`}
                  >
                    <Text
                      ellipsis
                      style={{
                        maxWidth: '65%',
                        fontSize: 12,
                      }}
                    >
                      {expense.name}
                    </Text>
                  </Tooltip>

                  <Text
                    strong
                    style={{ fontSize: 12 }}
                  >
                    {formatAmount(
                      expense.amount,
                    )}
                  </Text>
                </div>

                <Progress
                  percent={Number(
                    percentage.toFixed(1),
                  )}
                  showInfo={false}
                  size="small"
                  strokeColor={
                    token.colorPrimary
                  }
                />
              </div>
            );
          })}

          <div
            style={{
              borderTop: `1px solid ${token.colorBorderSecondary}`,
              paddingTop: 9,
              display: 'flex',
              justifyContent:
                'space-between',
            }}
          >
            <Text
              type="secondary"
              style={{ fontSize: 12 }}
            >
              Shown expenses
            </Text>

            <Text
              strong
              style={{ fontSize: 12 }}
            >
              {formatAmount(total)}
            </Text>
          </div>
        </Space>
      )}
    </Card>
  );
}

/* =========================================================
   Cash & Bank Widget
========================================================= */

function CashBankWidget({
  balance,
  matched,
  loading,
  onView,
}: {
  balance: number;
  matched: boolean;
  loading: boolean;
  onView: () => void;
}) {
  const { token } = theme.useToken();

  return (
    <Card
      size="small"
      hoverable
      title={
        <span style={{ fontWeight: 600 }}>
          Cash & Bank
        </span>
      }
      style={{ height: '100%' }}
      styles={{
        body: {
          padding: '12px 14px',
        },
      }}
    >
      {loading ? (
        <Skeleton active paragraph={{ rows: 3 }} />
      ) : !matched ? (
        <Empty description="No cash or bank accounts found." />
      ) : (
        <>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius:
                  token.borderRadius,
                background:
                  token.colorFillSecondary,
                color: token.colorPrimary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BankOutlined />
            </div>

            <div>
              <Text
                type="secondary"
                style={{ fontSize: 11 }}
              >
                Current balance
              </Text>

              <Statistic
                value={balance}
                precision={2}
                prefix="₨"
                valueStyle={{
                  fontSize: 17,
                  lineHeight: 1.2,
                  fontWeight: 600,
                }}
              />
            </div>
          </div>

          <Text
            type="secondary"
            style={{
              display: 'block',
              marginTop: 12,
              fontSize: 11,
            }}
          >
            Posted balance from the current
            fiscal year balance sheet.
          </Text>

          <Button
            type="link"
            size="small"
            style={{
              padding: 0,
              marginTop: 8,
              fontSize: 12,
            }}
            onClick={onView}
          >
            View Balance Sheet
          </Button>
        </>
      )}
    </Card>
  );
}

/* =========================================================
   Recent Journal Entries
========================================================= */

function RecentJournalEntries({
  journals,
  loading,
  onVoucherClick,
}: {
  journals: JournalEntryRecord[];
  loading: boolean;
  onVoucherClick: (id: number) => void;
}) {
  const { token } = theme.useToken();

  const displayedJournals =
    journals.slice(0, 5);

  return (
    <Card
      size="small"
      hoverable
      title={
        <span style={{ fontWeight: 600 }}>
          Recent Journal Entries
        </span>
      }
      extra={
        <Button
          type="link"
          size="small"
          style={{ fontSize: 12 }}
          onClick={() =>
            window.location.assign(
              '/finance/journal-entries',
            )
          }
        >
          View all
        </Button>
      }
      styles={{
        body: {
          padding: '4px 14px 8px',
        },
      }}
    >
      {loading ? (
        <Skeleton active paragraph={{ rows: 3 }} />
      ) : journals.length === 0 ? (
        <Empty description="No journal entries found." />
      ) : (
        <Space
          direction="vertical"
          size={0}
          style={{ width: '100%' }}
        >
          {displayedJournals.map(
            (journal, index) => (
              <div
                key={journal.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 0',
                  borderBottom:
                    index ===
                      displayedJournals.length - 1
                      ? 'none'
                      : `1px solid ${token.colorBorderSecondary}`,
                }}
              >
                <Button
                  type="link"
                  size="small"
                  style={{
                    padding: 0,
                    height: 'auto',
                    minWidth: 105,
                    textAlign: 'left',
                    fontWeight: 600,
                    fontSize: 12,
                  }}
                  onClick={() =>
                    onVoucherClick(
                      journal.id,
                    )
                  }
                >
                  {journal.voucherNo}
                </Button>

                <Text
                  type="secondary"
                  style={{
                    width: 60,
                    flexShrink: 0,
                    fontSize: 11,
                  }}
                >
                  {dayjs(
                    journal.postingDate,
                  ).format('DD MMM')}
                </Text>

                <Text
                  ellipsis
                  style={{
                    flex: 1,
                    minWidth: 0,
                    fontSize: 12,
                  }}
                >
                  {journal.description ||
                    'Journal Entry'}
                </Text>

                <Tag
                  color={
                    journal.status ===
                      'Posted'
                      ? 'success'
                      : 'default'
                  }
                  style={{
                    marginInlineEnd: 0,
                    fontSize: 10,
                  }}
                >
                  {journal.status}
                </Tag>
              </div>
            ),
          )}
        </Space>
      )}
    </Card>
  );
}

/* =========================================================
   Dashboard
========================================================= */

export default function Dashboard() {
  const {
    selectedBusinessUnit,
  } = useBusinessUnit();

  const { hasPermission } = useAuth();

  const navigate = useNavigate();

  const { token } = theme.useToken();

  const [data, setData] =
    useState<DashboardData>({
      profitLoss: null,
      balanceSheet: null,
      fiscalYear: null,
      monthly: [],
      journals: [],
    });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState(false);

  const canViewPL = hasPermission(
    'finance.profit-loss.view',
  );

  const canViewBalanceSheet =
    hasPermission(
      'finance.balance-sheet.view',
    );

  const canViewJournalEntries =
    hasPermission(
      'finance.journal-entries.view',
    );

  const canCreateJournal =
    hasPermission(
      'finance.journal-entries.create',
    );

  const canViewExpenses = hasPermission(
    'finance.expenses.view',
  );

  const canViewGeneralLedger =
    hasPermission(
      'finance.general-ledger.view',
    );

  const canViewTrialBalance =
    hasPermission(
      'finance.trial-balance.view',
    );

  const loadDashboard = async () => {
    if (!selectedBusinessUnit?.id) {
      setData({
        profitLoss: null,
        balanceSheet: null,
        fiscalYear: null,
        monthly: [],
        journals: [],
      });

      return;
    }

    setLoading(true);
    setError(false);

    try {
      const fiscalYears =
        await getFiscalYears(
          selectedBusinessUnit.id,
        );

      const fiscalYear =
        getCurrentFiscalYear(
          fiscalYears,
        );

      let profitLoss:
        | ProfitLossResult
        | null = null;

      let balanceSheet:
        | BalanceSheetResult
        | null = null;

      let monthly: MonthlyData[] = [];

      let journals:
        | JournalEntryRecord[] = [];

      if (fiscalYear && canViewPL) {
        profitLoss =
          await getProfitAndLoss({
            businessUnitId:
              selectedBusinessUnit.id,
            fiscalYearId:
              fiscalYear.id,
          });

        const periods = [
          ...(fiscalYear.periods || []),
        ].sort(
          (a, b) => a.month - b.month,
        );

        monthly =
          await Promise.all(
            periods.map(
              async (period) => {
                try {
                  const result =
                    await getProfitAndLoss({
                      businessUnitId:
                        selectedBusinessUnit.id,
                      periodId: period.id,
                    });

                  return {
                    label: dayjs(
                      period.startDate,
                    ).format('MMM'),

                    revenue:
                      result.totalRevenue,

                    expenses:
                      result.totalOperatingExpenses,
                  };
                } catch {
                  return {
                    label: dayjs(
                      period.startDate,
                    ).format('MMM'),

                    revenue: 0,
                    expenses: 0,
                  };
                }
              },
            ),
          );
      }

      if (
        fiscalYear &&
        canViewBalanceSheet
      ) {
        balanceSheet =
          await getBalanceSheet({
            businessUnitId:
              selectedBusinessUnit.id,
            fiscalYearId:
              fiscalYear.id,
          });
      }

      if (canViewJournalEntries) {
        const journalResult =
          await getJournalEntries(
            selectedBusinessUnit.id,
            1,
            5,
          );

        journals =
          journalResult.journals || [];
      }

      setData({
        profitLoss,
        balanceSheet,
        fiscalYear,
        monthly,
        journals,
      });
    } catch (err) {
      console.error(
        'Dashboard loading failed:',
        err,
      );

      setError(true);

      message.error(
        'Dashboard data could not be loaded.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, [
    selectedBusinessUnit?.id,
    canViewPL,
    canViewBalanceSheet,
    canViewJournalEntries,
  ]);

  const cashBalance = useMemo(() => {
    if (!data.balanceSheet) {
      return {
        total: 0,
        matched: false,
      };
    }

    return collectMatchingBalance(
      data.balanceSheet.assets.sections,
      ['cash', 'bank'],
    );
  }, [data.balanceSheet]);

  const receivables = useMemo(() => {
    if (!data.balanceSheet) {
      return {
        total: 0,
        matched: false,
      };
    }

    return collectMatchingBalance(
      data.balanceSheet.assets.sections,
      [
        'receivable',
        'accounts receivable',
        'receivables',
      ],
    );
  }, [data.balanceSheet]);

  const payables = useMemo(() => {
    if (!data.balanceSheet) {
      return {
        total: 0,
        matched: false,
      };
    }

    return collectMatchingBalance(
      data.balanceSheet.liabilities.sections,
      [
        'payable',
        'accounts payable',
        'payables',
      ],
    );
  }, [data.balanceSheet]);

  const handleVoucherClick = (
    id: number,
  ) => {
    navigate(
      `/finance/journal-entries/${id}`,
      {
        state: {
          from: '/',
        },
      },
    );
  };

  if (!selectedBusinessUnit?.id) {
    return (
      <div>
        <Title
          level={4}
          style={{ marginTop: 0 }}
        >
          Dashboard
        </Title>

        <Card size="small">
          <Empty description="Select a business unit to view the dashboard." />
        </Card>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}

      <div
      
        style={{
          display: 'flex',
          justifyContent:
            'space-between',
          alignItems: 'center',
          gap: 16,
          marginBottom: 14,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <Title
            level={3}
            style={{
              margin: 0,
              fontSize: 22,
            }}
          >
            Dashboard
          </Title>

          <Text
            type="secondary"
            style={{ fontSize: 12 }}
          >
            {selectedBusinessUnit.name}

            {data.fiscalYear
              ? ` • ${data.fiscalYear.name}`
              : ''}
          </Text>
        </div>

        <Button
          size="small"
          icon={<ReloadOutlined />}
          onClick={() =>
            void loadDashboard()
          }
          loading={loading}
        >
          Refresh
        </Button>
      </div>

      {/* Error */}

      {error && (
        <Alert
          type="error"
          showIcon
          closable
          message="Some dashboard data could not be loaded."
          description="Please refresh the dashboard or check the relevant report permissions."
          style={{
            marginBottom: 12,
          }}
        />
      )}

      {/* Financial Summary */}

      <Row gutter={[10, 10]}>
        {canViewPL && (
          <>
            <Col
              xs={24}
              sm={12}
              md={8}
              lg={4}
            >
              <FinancialCard
                title="Revenue"
                value={
                  data.profitLoss
                    ?.totalRevenue || 0
                }
                icon={<RiseOutlined />}
                iconColor={
                  token.colorPrimary
                }
                loading={loading}
              />
            </Col>

            <Col
              xs={24}
              sm={12}
              md={8}
              lg={4}
            >
              <FinancialCard
                title="Expenses"
                value={
                  data.profitLoss
                    ?.totalOperatingExpenses ||
                  0
                }
                icon={
                  <ArrowDownOutlined />
                }
                loading={loading}
              />
            </Col>

            <Col
              xs={24}
              sm={12}
              md={8}
              lg={4}
            >
              <FinancialCard
                title="Net Profit"
                value={
                  data.profitLoss
                    ?.netProfit || 0
                }
                icon={
                  data.profitLoss &&
                    data.profitLoss.netProfit <
                    0 ? (
                    <ArrowDownOutlined />
                  ) : (
                    <ArrowUpOutlined />
                  )
                }
                loading={loading}
                iconColor={
                  data.profitLoss &&
                    data.profitLoss.netProfit <
                    0
                    ? token.colorError
                    : token.colorSuccess
                }
                valueStyle={{
                  color:
                    data.profitLoss &&
                      data.profitLoss.netProfit <
                      0
                      ? token.colorError
                      : token.colorSuccess,
                }}
              />
            </Col>
          </>
        )}

        {canViewBalanceSheet && (
          <>
            <Col
              xs={24}
              sm={12}
              md={8}
              lg={4}
            >
              <FinancialCard
                title="Cash & Bank"
                value={cashBalance.total}
                icon={<BankOutlined />}
                loading={loading}
              />
            </Col>

            <Col
              xs={24}
              sm={12}
              md={8}
              lg={4}
            >
              <FinancialCard
                title="Receivables"
                value={receivables.total}
                icon={<WalletOutlined />}
                loading={loading}
              />
            </Col>

            <Col
              xs={24}
              sm={12}
              md={8}
              lg={4}
            >
              <FinancialCard
                title="Payables"
                value={payables.total}
                icon={<DollarOutlined />}
                loading={loading}
              />
            </Col>
          </>
        )}
      </Row>

      <div style={{ height: 12 }} />

      {/* Revenue vs Expenses */}

      {canViewPL && (
        <RevenueExpenseChart
          data={data.monthly}
          loading={loading}
        />
      )}

      <div style={{ height: 12 }} />

      {/* Expense Breakdown + Cash */}

      <Row gutter={[12, 12]}>
        {canViewPL && (
          <Col
            xs={24}
            lg={14}
          >
            <ExpenseBreakdown
              expenses={
                data.profitLoss
                  ?.operatingExpenses || []
              }
              loading={loading}
            />
          </Col>
        )}

        {canViewBalanceSheet && (
          <Col
            xs={24}
            lg={canViewPL ? 10 : 24}
          >
            <CashBankWidget
              balance={
                cashBalance.total
              }
              matched={
                cashBalance.matched
              }
              loading={loading}
              onView={() =>
                navigate(
                  '/reports/balance-sheet',
                )
              }
            />
          </Col>
        )}
      </Row>

      <div style={{ height: 12 }} />

      {/* Recent Journals + Quick Actions */}

      <Row gutter={[12, 12]}>
        {canViewJournalEntries && (
          <Col
            xs={24}
            lg={16}
          >
            <RecentJournalEntries
              journals={data.journals}
              loading={loading}
              onVoucherClick={
                handleVoucherClick
              }
            />
          </Col>
        )}

        <Col
          xs={24}
          lg={
            canViewJournalEntries
              ? 8
              : 24
          }
        >
          <Card
            size="small"
            hoverable
            title={
              <span
                style={{
                  fontWeight: 600,
                }}
              >
                Quick Actions
              </span>
            }
            style={{
              height: '100%',
            }}
            styles={{
              body: {
                padding: 12,
              },
            }}
          >
            <Space
              direction="vertical"
              size={7}
              style={{
                width: '100%',
              }}
            >
              {canCreateJournal && (
                <Button
                  block
                  size="small"
                  type="primary"
                  style={{
                    fontSize: 12,
                  }}
                  icon={<PlusOutlined />}
                  onClick={() =>
                    navigate(
                      '/finance/journal-entries/new',
                    )
                  }
                >
                  New Journal Entry
                </Button>
              )}

              {canViewExpenses && (
                <Button
                  block
                  size="small"
                  type="primary"
                  style={{
                    fontSize: 12,
                  }}
                  icon={<PlusOutlined />}
                  onClick={() =>
                    navigate(
                      '/finance/expenses/add',
                    )
                  }
                >
                  New Expense
                </Button>
              )}

              {canViewGeneralLedger && (
                <Button
                  block
                  size="small"
                  type="primary"
                  style={{
                    fontSize: 12,
                  }}
                  icon={ <FileTextOutlined />}
                  onClick={() =>
                    navigate(
                      '/reports/general-ledger',
                    )
                  }
                >
                  View General Ledger
                </Button>
              )}

              {canViewTrialBalance && (
                <Button
                  block
                  size="small"
                  type="primary"
                  style={{
                    fontSize: 12,
                  }}
                  icon={<FileTextOutlined />}
                  onClick={() =>
                    navigate(
                      '/reports/trial-balance',
                    )
                  }
                >
                  View Trial Balance
                </Button>
              )}
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}