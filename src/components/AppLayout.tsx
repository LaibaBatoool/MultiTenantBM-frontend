import { Layout, Menu, Dropdown, Avatar, theme } from 'antd';
import { DashboardOutlined, TeamOutlined, ApartmentOutlined, LogoutOutlined, UserOutlined, EditOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import type { MenuProps } from 'antd';

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: '/business-units', icon: <ApartmentOutlined />, label: 'Business Units' },
  { key: '/staff', icon: <TeamOutlined />, label: 'Staff' },
];

export default function AppLayout() {
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { token: { colorBgContainer } } = theme.useToken();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
      <Sider>
        <div style={{ color: 'white', textAlign: 'center', padding: '16px', fontWeight: 'bold' }}>
          MultiTenantBM
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header style={{ background: colorBgContainer, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '0 24px' }}>
          <Dropdown menu={{ items: dropdownItems }} trigger={['click']} placement="bottomRight">
            <Avatar style={{ cursor: 'pointer', backgroundColor: '#5c5b5b' }} icon={<UserOutlined />} />
          </Dropdown>
        </Header>
        <Content style={{ margin: '24px', padding: '24px', background: colorBgContainer }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}