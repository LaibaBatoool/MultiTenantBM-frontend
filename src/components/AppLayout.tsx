import { useState } from 'react';
import {
  Layout,
  Menu,
  Dropdown,
  Avatar,
  theme,
  Button,
  Tooltip,
} from 'antd';

import {
  DashboardOutlined,
  TeamOutlined,
  ApartmentOutlined,
  LogoutOutlined,
  UserOutlined,
  EditOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UsergroupAddOutlined,
  SafetyCertificateOutlined,
  ShopOutlined,
  ShoppingOutlined,
  ToolOutlined,
  SolutionOutlined,
  SmileOutlined,
  ProjectOutlined,
  IdcardOutlined,
  LaptopOutlined,
  TagsOutlined,
  BankOutlined,
  DollarOutlined,
  WalletOutlined,
  FundOutlined,
  BarChartOutlined,
  PieChartOutlined,
  FileTextOutlined,
  AuditOutlined,
} from '@ant-design/icons';

import { useAuth } from '../context/AuthContext';
import { useBusinessUnit } from '../context/BusinessUnitContext';

import {
  useNavigate,
  useLocation,
  Outlet,
} from 'react-router-dom';

import type { MenuProps } from 'antd';

import { SERVER_BASE } from '../constants/api';

const { Header, Sider, Content } = Layout;

export default function AppLayout() {
  const {
    hasPermission,
    logout,
    currentUser,
  } = useAuth();

  const {
    selectedBusinessUnit,
    isSuperadmin,
    clearSelectedBusinessUnit,
  } = useBusinessUnit();

  const navigate = useNavigate();
  const location = useLocation();

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const [collapsed, setCollapsed] = useState(false);

  // ============================================================
  // SIDEBAR LINK
  // ============================================================

  const menuLink = (text: string, path: string) => {
    const link = (
      <a
        href={path}
        onClick={(e) => {
          if (
            e.ctrlKey ||
            e.metaKey ||
            e.shiftKey ||
            e.button !== 0
          ) {
            return;
          }

          e.preventDefault();
          e.stopPropagation();

          navigate(path);
        }}
        style={{
          color: 'inherit',
          textDecoration: 'none',
          display: 'block',
          width: '100%',
        }}
      >
        {text}
      </a>
    );

    return (
      <Tooltip title={text} placement="right">
        {link}
      </Tooltip>
    );
  };

  // ============================================================
  // GROUP LABEL
  // ============================================================

  const menuGroupLabel = (text: string) => {
    return (
      <Tooltip title={text} placement="right">
        <span>{text}</span>
      </Tooltip>
    );
  };

  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // ============================================================
  // DROPDOWN ITEMS
  // ============================================================

  const dropdownItems: MenuProps['items'] = [
    {
      key: 'name',
      label: (
        <div>
          <strong>
            {currentUser?.name || 'Loading...'}
          </strong>
        </div>
      ),
      disabled: true,
    },

    {
      key: 'email',
      label: currentUser?.email || '',
      disabled: true,
    },

    {
      type: 'divider',
    },

    {
      key: 'edit-profile',
      icon: <EditOutlined />,
      label: 'Edit Profile',
      onClick: () => navigate('/profile'),
    },

    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  // ============================================================
  // MASTER DATA PERMISSION
  // ============================================================

  const hasMasterDataPermission =
    hasPermission('master-data.vendor.view') ||
    hasPermission('master-data.supplier.view') ||
    hasPermission('master-data.contractor.view') ||
    hasPermission('master-data.consultant.view') ||
    hasPermission('master-data.customer.view') ||
    hasPermission('master-data.projects.view') ||
    hasPermission('master-data.employees.view') ||
    hasPermission('master-data.assets.view') ||
    hasPermission('master-data.expense-types.view') ||
    hasPermission('master-data.bank-accounts.view') ||
    hasPermission('master-data.accounts.view');

  // ============================================================
  // STAFF PERMISSION
  // ============================================================

  const hasStaffPermission =
    hasPermission('staff.users.view') ||
    hasPermission('staff.roles.view');

  // ============================================================
  // SIDEBAR MENU ITEMS
  // ============================================================

  const menuItems: MenuProps['items'] = selectedBusinessUnit
    ? [
      // ========================================================
      // BUSINESS UNITS
      // ========================================================

      ...(isSuperadmin
        ? [
          {
            key: '/business-units',
            icon: <ApartmentOutlined />,
            label: menuLink(
              'Business Units',
              '/business-units',
            ),
          },
        ]
        : []),

      // ========================================================
      // DASHBOARD
      // ========================================================

      ...(hasPermission('dashboard.view')
        ? [
          {
            key: '/',
            icon: <DashboardOutlined />,
            label: menuLink(
              'Dashboard',
              '/',
            ),
          },
        ]
        : []),

      // ========================================================
      // FINANCE
      // ========================================================

      {
        key: 'finance-group',
        icon: <DollarOutlined />,
        label: menuGroupLabel('Finance'),

        children: [
          // ----------------------------------------------------
          // Expenses
          // ----------------------------------------------------

          ...(hasPermission('finance.expenses.view')
            ? [
              {
                key: '/finance/expenses',
                icon: <WalletOutlined />,
                label: menuLink(
                  'Expenses',
                  '/finance/expenses',
                ),
              },
            ]
            : []),

          // ----------------------------------------------------
          // Cash and Bank
          // ----------------------------------------------------

          {
            key: 'cash-bank-group',
            icon: <BankOutlined />,
            label: menuGroupLabel('Cash & Bank'),
            children: [
              ...(hasPermission('finance.cash-bank.payments.view')
                ? [
                  {
                    key: '/finance/cash-bank/payments',
                    icon: <WalletOutlined />,
                    label: menuLink('Payments', '/finance/cash-bank/payments'),
                  },
                ]
                : []),
              ...(hasPermission('finance.cash-bank.receipts.view')
                ? [
                  {
                    key: '/finance/cash-bank/receipts',
                    icon: <DollarOutlined />,
                    label: menuLink('Receipts', '/finance/cash-bank/receipts'),
                  },
                ]
                : []),
              ...(hasPermission('finance.cash-bank.transfers.view')
                ? [
                  {
                    key: '/finance/cash-bank/transfers',
                    icon: <FundOutlined />,
                    label: menuLink('Transfers', '/finance/cash-bank/transfers'),
                  },
                ]
                : []),
            ],
          },

          // ----------------------------------------------------
          // Opening Balances
          // ----------------------------------------------------

          {
            key: '/finance/opening-balances',
            icon: <FundOutlined />,
            label: menuLink(
              'Opening Balances',
              '/finance/opening-balances',
            ),
          },

          // ----------------------------------------------------
          // Journal Entries
          // ----------------------------------------------------

          ...(hasPermission(
            'finance.journal-entries.view',
          )
            ? [
              {
                key: '/finance/journal-entries',
                icon: <AuditOutlined />,
                label: menuLink(
                  'Journal Entries',
                  '/finance/journal-entries',
                ),
              },
            ]
            : []),

          // ----------------------------------------------------
          // Capital Contributions
          // ----------------------------------------------------

          ...(hasPermission('finance.capital-contributions.view')
            ? [
              {
                key: '/finance/capital-contributions',
                icon: <DollarOutlined />,
                label: menuLink(
                  'Capital Contributions',
                  '/finance/capital-contributions',
                ),
              },
            ]
            : []),

          // ----------------------------------------------------
          // Assets
          // ----------------------------------------------------

          ...(hasPermission(
            'master-data.assets.view',
          )
            ? [
              {
                key: '/finance/assets',
                icon: <LaptopOutlined />,
                label: menuLink(
                  'Assets',
                  '/finance/assets',
                ),
              },
            ]
            : []),
        ],
      },

      // ========================================================
      // REPORTS
      // ========================================================

      {
        key: 'reports-group',
        icon: <BarChartOutlined />,
        label: menuGroupLabel('Reports'),

        children: [
          // ----------------------------------------------------
          // Expense Report
          // ----------------------------------------------------

          {
            key: '/reports/expense-report',
            icon: <PieChartOutlined />,
            label: menuLink(
              'Expense Report',
              '/reports/expense-report',
            ),
          },

          // ----------------------------------------------------
          // Project Profitability
          // ----------------------------------------------------

          ...(hasPermission('finance.project-profitability.view')
            ? [
              {
                key: '/reports/project-profitability',
                icon: <FundOutlined />,
                label: menuLink(
                  'Project Profitability',
                  '/reports/project-profitability',
                ),
              },
            ]
            : []),

          // ----------------------------------------------------
          // General Ledger
          // ----------------------------------------------------

          ...(hasPermission(
            'finance.general-ledger.view',
          )
            ? [
              {
                key: '/reports/general-ledger',
                icon: <FileTextOutlined />,
                label: menuLink(
                  'General Ledger',
                  '/reports/general-ledger',
                ),
              },
            ]
            : []),

          // ----------------------------------------------------
          // Profit & Loss
          // ----------------------------------------------------

          ...(hasPermission(
            'finance.profit-loss.view',
          )
            ? [
              {
                key: '/reports/profit-loss',
                icon: <BarChartOutlined />,
                label: menuLink(
                  'Profit & Loss',
                  '/reports/profit-loss',
                ),
              },
            ]
            : []),

          // ----------------------------------------------------
          // Trial Balance
          // ----------------------------------------------------

          ...(hasPermission(
            'finance.trial-balance.view',
          )
            ? [
              {
                key: '/reports/trial-balance',
                icon: <AuditOutlined />,
                label: menuLink(
                  'Trial Balance',
                  '/reports/trial-balance',
                ),
              },
            ]
            : []),

          // ----------------------------------------------------
          // Balance Sheet
          // ----------------------------------------------------

          ...(hasPermission(
            'finance.balance-sheet.view',
          )
            ? [
              {
                key: '/reports/balance-sheet',
                icon: <PieChartOutlined />,
                label: menuLink(
                  'Balance Sheet',
                  '/reports/balance-sheet',
                ),
              },
            ]
            : []),
        ],
      },

      // ========================================================
      // STAFF
      // ========================================================

      ...(hasStaffPermission
        ? [
          {
            key: 'staff-group',
            icon: <TeamOutlined />,
            label: menuGroupLabel('Staff'),

            children: [
              // ------------------------------------------------
              // Users
              // ------------------------------------------------

              ...(hasPermission(
                'staff.users.view',
              )
                ? [
                  {
                    key: '/staff/users',
                    icon: <UsergroupAddOutlined />,
                    label: menuLink(
                      'Users',
                      '/staff/users',
                    ),
                  },
                ]
                : []),

              // ------------------------------------------------
              // Roles
              // ------------------------------------------------

              ...(hasPermission(
                'staff.roles.view',
              )
                ? [
                  {
                    key: '/staff/roles',
                    icon: (
                      <SafetyCertificateOutlined />
                    ),
                    label: menuLink(
                      'Roles',
                      '/staff/roles',
                    ),
                  },
                ]
                : []),
            ],
          },
        ]
        : []),

      // ========================================================
      // MASTER DATA
      // ========================================================

      ...(hasMasterDataPermission
        ? [
          {
            key: 'master-data-group',
            icon: <ShopOutlined />,
            label: menuGroupLabel(
              'Master Data',
            ),

            children: [
              // ------------------------------------------------
              // Vendor
              // ------------------------------------------------

              ...(hasPermission(
                'master-data.vendor.view',
              )
                ? [
                  {
                    key: '/master-data/vendor',
                    icon: <TeamOutlined />,
                    label: menuLink(
                      'Vendor',
                      '/master-data/vendor',
                    ),
                  },
                ]
                : []),

              // ------------------------------------------------
              // Supplier
              // ------------------------------------------------

              ...(hasPermission(
                'master-data.supplier.view',
              )
                ? [
                  {
                    key: '/master-data/supplier',
                    icon: <ShoppingOutlined />,
                    label: menuLink(
                      'Supplier',
                      '/master-data/supplier',
                    ),
                  },
                ]
                : []),

              // ------------------------------------------------
              // Contractor
              // ------------------------------------------------

              ...(hasPermission(
                'master-data.contractor.view',
              )
                ? [
                  {
                    key: '/master-data/contractor',
                    icon: <ToolOutlined />,
                    label: menuLink(
                      'Contractor',
                      '/master-data/contractor',
                    ),
                  },
                ]
                : []),

              // ------------------------------------------------
              // Consultant
              // ------------------------------------------------

              ...(hasPermission(
                'master-data.consultant.view',
              )
                ? [
                  {
                    key: '/master-data/consultant',
                    icon: <SolutionOutlined />,
                    label: menuLink(
                      'Consultant',
                      '/master-data/consultant',
                    ),
                  },
                ]
                : []),

              // ------------------------------------------------
              // Customer
              // ------------------------------------------------

              ...(hasPermission(
                'master-data.customer.view',
              )
                ? [
                  {
                    key: '/master-data/customer',
                    icon: <SmileOutlined />,
                    label: menuLink(
                      'Customer',
                      '/master-data/customer',
                    ),
                  },
                ]
                : []),

              // ------------------------------------------------
              // Projects
              // ------------------------------------------------

              ...(hasPermission('master-data.projects.view')
                ? [
                  {
                    key: '/master-data/projects',
                    icon: <ProjectOutlined />,
                    label: menuLink('Projects', '/master-data/projects'),
                  },
                ]
                : []),

              // ------------------------------------------------
              // Employees
              // ------------------------------------------------

              ...(hasPermission(
                'master-data.employees.view',
              )
                ? [
                  {
                    key: '/master-data/employees',
                    icon: <IdcardOutlined />,
                    label: menuLink(
                      'Employees',
                      '/master-data/employees',
                    ),
                  },
                ]
                : []),

              // ------------------------------------------------
              // Expense Types
              // ------------------------------------------------

              ...(hasPermission(
                'master-data.expense-types.view',
              )
                ? [
                  {
                    key: '/master-data/expense-types',
                    icon: <TagsOutlined />,
                    label: menuLink(
                      'Expense Types',
                      '/master-data/expense-types',
                    ),
                  },
                ]
                : []),

              // ------------------------------------------------
              // Bank Accounts
              // ------------------------------------------------

              ...(hasPermission(
                'master-data.bank-accounts.view',
              )
                ? [
                  {
                    key: '/master-data/bank-accounts',
                    icon: <BankOutlined />,
                    label: menuLink(
                      'Bank Accounts',
                      '/master-data/bank-accounts',
                    ),
                  },
                ]
                : []),

              // ------------------------------------------------
              // Accounts
              // ------------------------------------------------

              ...(hasPermission('master-data.accounts.view')
                ? [
                  {
                    key: '/master-data/accounts',
                    icon: <AuditOutlined />,
                    label: menuLink('Chart of Accounts', '/master-data/accounts'),
                  },
                ]
                : []),

            ],
          },
        ]
        : []),
    ]
    : [
      // ========================================================
      // NO BUSINESS UNIT SELECTED
      // ========================================================

      {
        key: '/business-units',
        icon: <ApartmentOutlined />,
        label: menuLink(
          'Business Units',
          '/business-units',
        ),
      },
    ];

  return (
    <Layout
      style={{
        minHeight: '100vh',
      }}
    >
      {/* ========================================================
          SIDEBAR
      ======================================================== */}

      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={260}
        collapsedWidth={80}
        style={{
          height: '100vh',
          position: 'sticky',
          top: 0,
          left: 0,
          overflow: 'hidden',
        }}
      >
        {/* ------------------------------------------------------
            Sidebar Header
        ------------------------------------------------------ */}

        <div
          style={{
            color: 'white',
            textAlign: 'center',
            padding: '16px',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {collapsed
            ? 'MTBM'
            : selectedBusinessUnit
              ? selectedBusinessUnit.name
              : 'MultiTenantBM'}
        </div>

        {/* ------------------------------------------------------
            INDEPENDENT SIDEBAR SCROLLER
        ------------------------------------------------------ */}

        <div
          style={{
            height: 'calc(100vh - 64px)',
            overflowY: 'auto',
            overflowX: 'hidden',
            scrollbarWidth: 'thin',
          }}
        >
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[location.pathname]}
            defaultOpenKeys={[
              'staff-group',
              'master-data-group',
              'finance-group',
              'cash-bank-group',
              'reports-group',
            ]}
            items={menuItems}
            onClick={({ key }) => {
              if (
                key === 'staff-group' ||
                key === 'master-data-group' ||
                key === 'finance-group' ||
                key === 'reports-group'
              ) {
                return;
              }

              if (key === '/business-units') {
                clearSelectedBusinessUnit();
              }
            }}
          />
        </div>
      </Sider>

      {/* ========================================================
          MAIN APPLICATION LAYOUT
      ======================================================== */}

      <Layout
        style={{
          minHeight: '100vh',
        }}
      >
        {/* ------------------------------------------------------
            HEADER
        ------------------------------------------------------ */}

        <Header
          style={{
            background: colorBgContainer,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 24px',
          }}
        >
          {/* Sidebar collapse button */}

          <Button
            type="text"
            icon={
              collapsed ? (
                <MenuUnfoldOutlined />
              ) : (
                <MenuFoldOutlined />
              )
            }
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: 18,
            }}
          />

          {/* User dropdown */}

          <Dropdown
            menu={{
              items: dropdownItems,
            }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Avatar
              style={{
                cursor: 'pointer',
                backgroundColor: '#8c8c8c',
              }}
              src={
                currentUser?.profilePic
                  ? `${SERVER_BASE}${currentUser.profilePic}`
                  : undefined
              }
              icon={
                currentUser?.profilePic ? undefined : (
                  <UserOutlined />
                )
              }
            />
          </Dropdown>
        </Header>

        {/* ------------------------------------------------------
            MAIN CONTENT
        ------------------------------------------------------ */}

        <Content
          style={{
            margin: '24px',
            padding: '24px',
            background: colorBgContainer,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}