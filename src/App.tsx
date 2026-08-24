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
import Employees from './pages/Employees';
import EmployeeForm from './pages/EmployeeForm';
import Assets from './pages/Assets';
import ExpenseTypesPage from './pages/ExpenseTypesPage';
import BankAccounts from './pages/BankAccounts';
import Expenses from './pages/Expenses';
import OpeningBalances from './pages/OpeningBalances';
import ExpenseReport from './pages/ExpenseReport';
import ProjectProfitability from './pages/ProjectProfitability';
import GeneralLedger from './pages/GeneralLedger';
import ExpenseTypeForm from './pages/ExpenseTypeForm';
import AssetForm from './pages/AssetForm';
import BankAccountForm from './pages/BankAccountForm';
import JournalEntries from './pages/JournalEntries';
import JournalEntryForm from './pages/JournalEntryForm';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import TrialBalance from './pages/TrialBalance';
import AccountsReceivable from './pages/AccountsReceivable';
import AccountsReceivableLedger from './pages/AccountsReceivableLedger';
import AccountsPayable from './pages/AccountsPayable';
import AccountsPayableLedger from './pages/AccountsPayableLedger';
import ProfitAndLoss from './pages/ProfitAndLoss';
import BalanceSheet from './pages/BalanceSheet';
import ExpensesForm from './pages/ExpensesForm';
import Payments from './pages/Payments';
import PaymentsForm from './pages/PaymentsForm';
import Receipts from './pages/Receipts';
import ReceiptsForm from './pages/ReceiptsForm';
import Transfers from './pages/Transfers';
import TransfersForm from './pages/TransfersForm';
import Accounts from './pages/Accounts';
import AccountForm from './pages/AccountForm';
import CapitalContributions from './pages/CapitalContributions';
import CapitalContributionForm from './pages/CapitalContributionForm';
import Projects from './pages/Projects';
import ProjectForm from './pages/ProjectForm';
import SalesInvoices from './pages/SalesInvoices';
import SalesInvoiceForm from './pages/SalesInvoiceForm';

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
        path="/forgot-password"
        element={isAuthenticated ? <Navigate to="/" /> : <ForgotPassword />}
      />
      <Route
        path="/reset-password"
        element={isAuthenticated ? <Navigate to="/" /> : <ResetPassword />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={
            selectedBusinessUnit ? (
              <PermissionRoute permission="dashboard.view">
                <Dashboard />
              </PermissionRoute>
            ) : (
              <Navigate to="/business-units" />
            )
          }
        />        <Route
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
        <Route path="master-data/bank-accounts" element={<BankAccounts />} />
        <Route path="master-data/bank-accounts/new" element={<BankAccountForm />} />
        <Route path="master-data/bank-accounts/:id/edit" element={<BankAccountForm />} />
        <Route path="master-data/expense-types/new" element={<ExpenseTypeForm />} />
        <Route path="master-data/expense-types/:id/edit" element={<ExpenseTypeForm />} />
        <Route
          path="master-data/projects"
          element={
            <PermissionRoute permission="master-data.projects.view">
              <Projects />
            </PermissionRoute>
          }
        />
        <Route
          path="master-data/projects/add"
          element={
            <PermissionRoute permission="master-data.projects.add">
              <ProjectForm />
            </PermissionRoute>
          }
        />
        <Route
          path="master-data/projects/:id/edit"
          element={
            <PermissionRoute permission="master-data.projects.edit">
              <ProjectForm />
            </PermissionRoute>
          }
        />
        <Route path="master-data/employees" element={<Employees />} />
        <Route path="master-data/employees/new" element={<EmployeeForm />} />
        <Route path="master-data/employees/:id/edit" element={<EmployeeForm />} />
        <Route path="master-data/expense-types" element={<ExpenseTypesPage />} />        <Route path="master-data/assets" element={<Assets />} />
        <Route path="master-data/expense-types" element={<ExpenseTypesPage />} />
        <Route path="master-data/bank-accounts" element={<BankAccounts />} />
        <Route
          path="master-data/accounts"
          element={
            <PermissionRoute permission="master-data.accounts.view">
              <Accounts />
            </PermissionRoute>
          }
        />
        <Route
          path="master-data/accounts/add"
          element={
            <PermissionRoute permission="master-data.accounts.add">
              <AccountForm />
            </PermissionRoute>
          }
        />
        <Route
          path="finance/expenses"
          element={
            <PermissionRoute permission="finance.expenses.view">
              <Expenses />
            </PermissionRoute>
          }
        />
        <Route
          path="finance/expenses/add"
          element={
            <PermissionRoute permission="finance.expenses.view">
              <ExpensesForm />
            </PermissionRoute>
          }
        />
        <Route
          path="finance/cash-bank/payments"
          element={
            <PermissionRoute permission="finance.cash-bank.payments.view">
              <Payments />
            </PermissionRoute>
          }
        />
        <Route
          path="finance/cash-bank/payments/add"
          element={
            <PermissionRoute permission="finance.cash-bank.payments.add">
              <PaymentsForm />
            </PermissionRoute>
          }
        />
        <Route
          path="finance/cash-bank/receipts"
          element={
            <PermissionRoute permission="finance.cash-bank.receipts.view">
              <Receipts />
            </PermissionRoute>
          }
        />
        <Route
          path="finance/cash-bank/receipts/add"
          element={
            <PermissionRoute permission="finance.cash-bank.receipts.add">
              <ReceiptsForm />
            </PermissionRoute>
          }
        />
        <Route
          path="finance/cash-bank/transfers"
          element={
            <PermissionRoute permission="finance.cash-bank.transfers.view">
              <Transfers />
            </PermissionRoute>
          }
        />
        <Route
          path="finance/cash-bank/transfers/add"
          element={
            <PermissionRoute permission="finance.cash-bank.transfers.add">
              <TransfersForm />
            </PermissionRoute>
          }
        />
        <Route path="finance/opening-balances" element={<OpeningBalances />} />
        <Route
          path="finance/journal-entries"
          element={
            <PermissionRoute permission="finance.journal-entries.view">
              <JournalEntries />
            </PermissionRoute>
          }
        />
        <Route
          path="finance/journal-entries/new"
          element={
            <PermissionRoute permission="finance.journal-entries.add">
              <JournalEntryForm />
            </PermissionRoute>
          }
        />
        <Route
          path="finance/journal-entries/:id"
          element={
            <PermissionRoute permission="finance.journal-entries.view">
              <JournalEntryForm />
            </PermissionRoute>
          }
        />
        <Route
          path="finance/capital-contributions"
          element={
            <PermissionRoute permission="finance.capital-contributions.view">
              <CapitalContributions />
            </PermissionRoute>
          }
        />
        <Route
          path="finance/capital-contributions/add"
          element={
            <PermissionRoute permission="finance.capital-contributions.add">
              <CapitalContributionForm />
            </PermissionRoute>
          }
        />        <Route path="finance/assets" element={<Assets />} />
        <Route path="finance/assets/new" element={<AssetForm />} />
        <Route path="finance/assets/:id/edit" element={<AssetForm />} />
        <Route path="reports/expense-report" element={<ExpenseReport />} />
        <Route
          path="reports/project-profitability"
          element={
            <PermissionRoute permission="finance.project-profitability.view">
              <ProjectProfitability />
            </PermissionRoute>
          }
        />        <Route
          path="reports/general-ledger"
          element={
            <PermissionRoute permission="finance.general-ledger.view">
              <GeneralLedger />
            </PermissionRoute>
          }
        />
        <Route
          path="reports/profit-loss"
          element={
            <PermissionRoute permission="finance.profit-loss.view">
              <ProfitAndLoss />
            </PermissionRoute>
          }
        />
        <Route
          path="reports/balance-sheet"
          element={
            <PermissionRoute permission="finance.balance-sheet.view">
              <BalanceSheet />
            </PermissionRoute>
          }
        />
        <Route
          path="reports/trial-balance"
          element={
            <PermissionRoute permission="finance.trial-balance.view">
              <TrialBalance />
            </PermissionRoute>
          }
        />
                <Route
          path="reports/accounts-receivable"
          element={
            <PermissionRoute permission="finance.accounts-receivable.view">
              <AccountsReceivable />
            </PermissionRoute>
          }
        />
        <Route
          path="reports/accounts-receivable/:id"
          element={
            <PermissionRoute permission="finance.accounts-receivable.view">
              <AccountsReceivableLedger />
            </PermissionRoute>
          }
        />
        <Route
          path="reports/accounts-payable"
          element={
            <PermissionRoute permission="finance.accounts-payable.view">
              <AccountsPayable />
            </PermissionRoute>
          }
        />
        <Route
          path="reports/accounts-payable/:id"
          element={
            <PermissionRoute permission="finance.accounts-payable.view">
              <AccountsPayableLedger />
            </PermissionRoute>
          }
        />
                <Route
          path="finance/sales-invoices"
          element={
            <PermissionRoute permission="finance.sales-invoices.view">
              <SalesInvoices />
            </PermissionRoute>
          }
        />
        <Route
          path="finance/sales-invoices/new"
          element={
            <PermissionRoute permission="finance.sales-invoices.add">
              <SalesInvoiceForm />
            </PermissionRoute>
          }
        />
        <Route
          path="finance/sales-invoices/:id"
          element={
            <PermissionRoute permission="finance.sales-invoices.view">
              <SalesInvoiceForm />
            </PermissionRoute>
          }
        />
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