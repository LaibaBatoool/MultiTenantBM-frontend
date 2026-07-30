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
import MasterDataList from './pages/MasterDataList';
import MasterDataForm from './pages/MasterDataForm';
import Projects from './pages/Projects';
import Employees from './pages/Employees';
import EmployeeForm from './pages/EmployeeForm';
import Assets from './pages/Assets';
import ExpenseTypesPage from './pages/ExpenseTypesPage';
import BankAccounts from './pages/BankAccounts';
import Expenses from './pages/Expenses';
import OpeningBalances from './pages/OpeningBalances';
import CapitalContributions from './pages/CapitalContributions';
import ExpenseReport from './pages/ExpenseReport';
import ProjectProfitability from './pages/ProjectProfitability';
import GeneralLedger from './pages/GeneralLedger';
import ExpenseTypeForm from './pages/ExpenseTypeForm';
import AssetForm from './pages/AssetForm';
import BankAccountForm from './pages/BankAccountForm';

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
        <Route path="master-data/assets" element={<Assets />} />
        <Route path="master-data/assets/new" element={<AssetForm />} />
        <Route path="master-data/assets/:id/edit" element={<AssetForm />} />
        <Route path="master-data/bank-accounts" element={<BankAccounts />} />
        <Route path="master-data/bank-accounts/new" element={<BankAccountForm />} />
        <Route path="master-data/bank-accounts/:id/edit" element={<BankAccountForm />} />
        <Route path="master-data/expense-types/new" element={<ExpenseTypeForm />} />
        <Route path="master-data/expense-types/:id/edit" element={<ExpenseTypeForm />} />
        <Route path="master-data/projects" element={<Projects />} />
        <Route path="master-data/employees" element={<Employees />} />
        <Route path="master-data/employees/new" element={<EmployeeForm />} />
        <Route path="master-data/employees/:id/edit" element={<EmployeeForm />} />
        <Route path="master-data/expense-types" element={<ExpenseTypesPage />} />        <Route path="master-data/assets" element={<Assets />} />
        <Route path="master-data/expense-types" element={<ExpenseTypesPage />} />
        <Route path="master-data/bank-accounts" element={<BankAccounts />} />
        <Route path="finance/expenses" element={<Expenses />} />
        <Route path="finance/opening-balances" element={<OpeningBalances />} />
        <Route path="finance/capital-contributions" element={<CapitalContributions />} />
        <Route path="reports/expense-report" element={<ExpenseReport />} />
        <Route path="reports/project-profitability" element={<ProjectProfitability />} />
        <Route path="reports/general-ledger" element={<GeneralLedger />} />
        <Route path="profile" element={<EditProfile />} />
        <Route path="master-data/:type" element={<MasterDataList />} />
        <Route path="master-data/:type/new" element={<MasterDataForm />} />
        <Route path="master-data/:type/:id/edit" element={<MasterDataForm />} />
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