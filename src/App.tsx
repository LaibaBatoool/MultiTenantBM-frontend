import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BusinessUnitProvider, useBusinessUnit } from './context/BusinessUnitContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BusinessUnits from './pages/BusinessUnits';
import BusinessUnitForm from './pages/BusinessUnitForm';
import Users from './pages/Users';
import Roles from './pages/Roles';
import EditProfile from './pages/EditProfile';
import AppLayout from './components/AppLayout';
import { Spin } from 'antd';
import RoleForm from './pages/RoleForm';
import PermissionRoute from './components/PermissionRoute';
import UserForm from './pages/UserForm';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  const { selectedBusinessUnit, isSuperadmin, isReady } = useBusinessUnit();

  if (isAuthenticated && !isReady) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" /> : <Login />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={selectedBusinessUnit ? <Dashboard /> : <Navigate to="/business-units" />} />
        <Route
          path="business-units"
          element={isSuperadmin ? <BusinessUnits /> : <Navigate to="/" />}
        />
        <Route
          path="business-units/new"
          element={isSuperadmin ? <BusinessUnitForm /> : <Navigate to="/" />}
        />
        <Route
          path="business-units/:id/edit"
          element={isSuperadmin ? <BusinessUnitForm /> : <Navigate to="/" />}
        />
        <Route
          path="staff/users"
          element={
            <PermissionRoute permission="staff.users.view">
              <Users />
            </PermissionRoute>
          }
        />
        <Route
          path="staff/users/new"
          element={
            <PermissionRoute permission="staff.users.add">
              <UserForm />
            </PermissionRoute>
          }
        />
        <Route
          path="staff/users/:id/edit"
          element={
            <PermissionRoute permission="staff.users.edit">
              <UserForm />
            </PermissionRoute>
          }
        />
        <Route
          path="staff/roles"
          element={
            <PermissionRoute permission="staff.roles.view">
              <Roles />
            </PermissionRoute>
          }
        />
        <Route
          path="staff/roles/new"
          element={
            <PermissionRoute permission="staff.roles.add">
              <RoleForm />
            </PermissionRoute>
          }
        />
        <Route
          path="staff/roles/:id/edit"
          element={
            <PermissionRoute permission="staff.roles.edit">
              <RoleForm />
            </PermissionRoute>
          }
        />
        <Route path="profile" element={<EditProfile />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BusinessUnitProvider>
          <AppRoutes />
        </BusinessUnitProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;