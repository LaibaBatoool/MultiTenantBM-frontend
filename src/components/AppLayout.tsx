import { useState } from 'react';
import { Layout, Menu, Dropdown, Avatar, theme, Button } from 'antd';
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

const { Header, Sider, Content } = Layout;

export default function AppLayout() {
  const { hasPermission } = useAuth();
  const { logout, currentUser } = useAuth();
  const { selectedBusinessUnit, isSuperadmin, clearSelectedBusinessUnit } = useBusinessUnit();
  const navigate = useNavigate();
  const location = useLocation();
  const { token: { colorBgContainer } } = theme.useToken();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = selectedBusinessUnit
    ? [
      ...(isSuperadmin
        ? [{ key: '/business-units', icon: <ApartmentOutlined />, label: 'Business Units' }]
        : []),
      { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
      ...(hasPermission('staff.users.view') || hasPermission('staff.roles.view')
        ? [
          {
            key: 'staff-group',
            icon: <TeamOutlined />,
            label: 'Staff',
            children: [
              ...(hasPermission('staff.users.view')
                ? [{ key: '/staff/users', icon: <UsergroupAddOutlined />, label: 'Users' }]
                : []),
              ...(hasPermission('staff.roles.view')
                ? [{ key: '/staff/roles', icon: <SafetyCertificateOutlined />, label: 'Roles' }]
                : []),
            ],
          },
        ]
        : []),
    ]
    : [{ key: '/business-units', icon: <ApartmentOutlined />, label: 'Business Units' }];
  const dropdownItems: MenuProps['items'] = [
    {
      key: 'user-info',
      label: (
        <div style={{ padding: '4px 0' }}>
          <div style={{ fontWeight: 600 }}>{currentUser?.fullName || 'Loading...'}</div>
          <div style={{ fontSize: 12, color: '#888' }}>{currentUser?.email || ''}</div>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' },
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

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div style={{ color: 'white', textAlign: 'center', padding: '16px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden' }}>
          {collapsed ? 'MTBM' : selectedBusinessUnit ? selectedBusinessUnit.name : 'MultiTenantBM'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={['staff-group']}
          items={menuItems}
          onClick={({ key }) => {
            if (key === 'staff-group') return;
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
            <Avatar style={{ cursor: 'pointer', backgroundColor: '#8c8c8c' }} icon={<UserOutlined />} />
          </Dropdown>
        </Header>
        <Content style={{ margin: '24px', padding: '24px', background: colorBgContainer }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}