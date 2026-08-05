import { useState } from 'react';
import { Layout, Menu, Dropdown, Avatar, theme, Button, Tooltip } from 'antd';
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
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useBusinessUnit } from '../context/BusinessUnitContext';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import type { MenuProps } from 'antd';
import { ShopOutlined } from '@ant-design/icons';
import {
  TeamOutlined as VendorIcon,
  ShoppingOutlined,
  ToolOutlined,
  SolutionOutlined,
  SmileOutlined,
} from '@ant-design/icons';
import {
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

const API_BASE = 'http://192.168.1.157:3000';
//const API_BASE = 'http://192.168.10.14:3000';

const { Header, Sider, Content } = Layout;

const withTooltip = (text: string) => (
  <Tooltip title={text} placement="right">
    <span>{text}</span>
  </Tooltip>
);

export default function AppLayout() {
  const { hasPermission, logout, currentUser } = useAuth();
  const { selectedBusinessUnit, isSuperadmin, clearSelectedBusinessUnit } = useBusinessUnit();
  const navigate = useNavigate();
  const location = useLocation();
  const { token: { colorBgContainer } } = theme.useToken();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dropdownItems: MenuProps['items'] = [
    {
      key: 'name',
      label: (
        <div>
          <strong>{currentUser?.name || 'Loading...'}</strong>
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

  const menuItems = selectedBusinessUnit
    ? [
      ...(isSuperadmin
        ? [{ key: '/business-units', icon: <ApartmentOutlined />, label: withTooltip('Business Units') }]
        : []),

      { key: '/', icon: <DashboardOutlined />, label: withTooltip('Dashboard') },

      {
        key: 'finance-group',
        icon: <DollarOutlined />,
        label: withTooltip('Finance'),
        children: [
          { key: '/finance/expenses', icon: <WalletOutlined />, label: withTooltip('Expenses') },
          { key: '/finance/opening-balances', icon: <FundOutlined />, label: withTooltip('Opening Balances') },
          ...(hasPermission('finance.journal-entries.view')
            ? [{ key: '/finance/journal-entries', icon: <AuditOutlined />, label: withTooltip('Journal Entries') }]
            : []),
          { key: '/finance/capital-contributions', icon: <DollarOutlined />, label: withTooltip('Capital Contributions') },
        ],
      },

      {
        key: 'reports-group',
        icon: <BarChartOutlined />,
        label: withTooltip('Reports'),
        children: [
          { key: '/reports/expense-report', icon: <PieChartOutlined />, label: withTooltip('Expense Report') },
          { key: '/reports/project-profitability', icon: <FundOutlined />, label: withTooltip('Project Profitability') },
          { key: '/reports/general-ledger', icon: <FileTextOutlined />, label: withTooltip('General Ledger') },
        ],
      },

      ...(hasPermission('staff.users.view') || hasPermission('staff.roles.view')
        ? [
          {
            key: 'staff-group',
            icon: <TeamOutlined />,
            label: withTooltip('Staff'),
            children: [
              ...(hasPermission('staff.users.view')
                ? [{ key: '/staff/users', icon: <UsergroupAddOutlined />, label: withTooltip('Users') }]
                : []),
              ...(hasPermission('staff.roles.view')
                ? [{ key: '/staff/roles', icon: <SafetyCertificateOutlined />, label: withTooltip('Roles') }]
                : []),
            ],
          },
        ]
        : []),

      ...(hasPermission('master-data.vendor.view') ||
        hasPermission('master-data.supplier.view') ||
        hasPermission('master-data.contractor.view') ||
        hasPermission('master-data.consultant.view') ||
        hasPermission('master-data.customer.view') ||
        hasPermission('master-data.projects.view') ||
        hasPermission('master-data.employees.view') ||
        hasPermission('master-data.assets.view') ||
        hasPermission('master-data.expense-types.view') ||
        hasPermission('master-data.bank-accounts.view')
        ? [
          {
            key: 'master-data-group',
            icon: <ShopOutlined />,
            label: withTooltip('Master Data'),
            children: [
              ...(hasPermission('master-data.vendor.view')
                ? [{ key: '/master-data/vendor', icon: <VendorIcon />, label: withTooltip('Vendor') }]
                : []),

              ...(hasPermission('master-data.supplier.view')
                ? [{ key: '/master-data/supplier', icon: <ShoppingOutlined />, label: withTooltip('Supplier') }]
                : []),

              ...(hasPermission('master-data.contractor.view')
                ? [{ key: '/master-data/contractor', icon: <ToolOutlined />, label: withTooltip('Contractor') }]
                : []),

              ...(hasPermission('master-data.consultant.view')
                ? [{ key: '/master-data/consultant', icon: <SolutionOutlined />, label: withTooltip('Consultant') }]
                : []),

              ...(hasPermission('master-data.customer.view')
                ? [{ key: '/master-data/customer', icon: <SmileOutlined />, label: withTooltip('Customer') }]
                : []),
                { key: '/master-data/projects', icon: <ProjectOutlined />, label: withTooltip('Projects') },

              // ...(hasPermission('master-data.projects.view')
              //   ? [{ key: '/master-data/projects', icon: <ProjectOutlined />, label: withTooltip('Projects') }]
              //   : []),
              ...(hasPermission('master-data.employees.view')
                ? [{ key: '/master-data/employees', icon: <IdcardOutlined />, label: withTooltip('Employees') }]
                : []),
              ...(hasPermission('master-data.assets.view')
                ? [{ key: '/master-data/assets', icon: <LaptopOutlined />, label: withTooltip('Assets') }]
                : []),
              ...(hasPermission('master-data.expense-types.view')
                ? [{ key: '/master-data/expense-types', icon: <TagsOutlined />, label: withTooltip('Expense Types') }]
                : []),
              ...(hasPermission('master-data.bank-accounts.view')
                ? [{ key: '/master-data/bank-accounts', icon: <BankOutlined />, label: withTooltip('Bank Accounts') }]
                : []),
            ],
          },
        ]
        : []),
    ]
    : [{ key: '/business-units', icon: <ApartmentOutlined />, label: withTooltip('Business Units') }];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} width={260} collapsedWidth={80}>
        <div style={{ color: 'white', textAlign: 'center', padding: '16px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden' }}>
          {collapsed ? 'MTBM' : selectedBusinessUnit ? selectedBusinessUnit.name : 'MultiTenantBM'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={['staff-group', 'master-data-group', 'finance-group', 'reports-group']} items={menuItems}
          onClick={({ key }) => {
            if (key === 'staff-group' || key === 'master-data-group' || key === 'finance-group' || key === 'reports-group') return;
            if (key === '/business-units') {
              clearSelectedBusinessUnit();
            }
            navigate(key);
          }}
        />
      </Sider>
      <Layout>
        <Header style={{ background: colorBgContainer, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px' }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 18 }}
          />
          <Dropdown menu={{ items: dropdownItems }} trigger={['click']} placement="bottomRight">
            <Avatar
              style={{ cursor: 'pointer', backgroundColor: '#8c8c8c' }}
              src={currentUser?.profilePic ? `${API_BASE}${currentUser.profilePic}` : undefined}
              icon={currentUser?.profilePic ? undefined : <UserOutlined />}
            />
          </Dropdown>
        </Header>
        <Content style={{ margin: '24px', padding: '24px', background: colorBgContainer }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}