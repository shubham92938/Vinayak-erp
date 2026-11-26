import { Navigate, Route, Routes } from 'react-router-dom'
import { ToastProvider } from './components/ui'
import { NAV_ROUTES } from './config/navigation'
import { AppProvider } from './context/AppContext'
import { ThemeProvider } from './context/ThemeContext.jsx'
import {
  FirmProfileRoute,
  LegacyWorkspaceRoute,
  ModuleGuard,
  ProtectedRoute,
  WorkspaceRoute,
} from './routing/routeGuards'
import BalancePage from './features/balance/pages/BalancePage'
import CategoriesPage from './features/categories/pages/CategoriesPage'
import CategoryDetailsPage from './features/categories/pages/CategoryDetailsPage'
import CategoryFormPage from './features/categories/pages/CategoryFormPage'
import ComponentsPreviewPage from './features/components-preview/pages/ComponentsPreviewPage'
import CustomersPage from './features/customers/pages/CustomersPage'
import CustomerDetailsPage from './features/customers/pages/CustomerDetailsPage'
import DashboardPage from './features/dashboard/pages/DashboardPage'
import ExpensesPage from './features/expenses/pages/ExpensesPage'
import FundTransfersPage from './features/fund-transfers/pages/FundTransfersPage'
import InventoryOverviewPage from './features/inventory/pages/InventoryOverviewPage'
import StockAdjustmentPage from './features/inventory/pages/StockAdjustmentPage'
import StockInPage from './features/inventory/pages/StockInPage'
import StockOutPage from './features/inventory/pages/StockOutPage'
import StockTransferPage from './features/inventory/pages/StockTransferPage'
import NotificationsPage from './features/notifications/pages/NotificationsPage'
import PaymentInPage from './features/payment-in/pages/PaymentInPage'
import PaymentOutPage from './features/payment-out/pages/PaymentOutPage'
import PriceListPage from './features/price-list/pages/PriceListPage'
import ProductCreatePage from './features/products/pages/ProductCreatePage'
import ProductDetailsPage from './features/products/pages/ProductDetailsPage'
import ProductsPage from './features/products/pages/ProductsPage'
import ProfitLossPage from './features/profit-loss/pages/ProfitLossPage'
import PurchaseOrderDetailsPage from './features/purchase-orders/pages/PurchaseOrderDetailsPage'
import PurchaseOrdersPage from './features/purchase-orders/pages/PurchaseOrdersPage'
import RecordedPurchaseForm from './features/purchase-orders/pages/RecordedPurchaseForm'
import PurchaseDetailsPage from './features/purchases/pages/PurchaseDetailsPage'
import PurchasesPage from './features/purchases/pages/PurchasesPage'
import QuotationDetailsPage from './features/quotations/pages/QuotationDetailsPage'
import QuotationsPage from './features/quotations/pages/QuotationsPage'
import ReportsPage from './features/reports/pages/ReportsPage'
import SaleDetailsPage from './features/sales/pages/SaleDetailsPage'
import SalePrintPage from './features/sales/pages/SalePrintPage'
import SalesPage from './features/sales/pages/SalesPage'
import RecordedSalesOrderForm from './features/sales/components/RecordedSalesOrderForm'
import SalesOrderDetailsPage from './features/sales-orders/pages/SalesOrderDetailsPage'
import SalesOrdersPage from './features/sales-orders/pages/SalesOrdersPage'
import SettingsPage from './features/settings/pages/SettingsPage'
import TransactionsPage from './features/transactions/pages/TransactionsPage'
import UserDetailsPage from './features/users/pages/UserDetailsPage'
import UsersPage from './features/users/pages/UsersPage'
import DesignSystemPage from './pages/DesignSystemPage'
import FirmProfilePage from './pages/FirmProfilePage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'
import PlaceholderPage from './pages/PlaceholderPage'
import SearchPage from './pages/SearchPage'

const PAGE_ROUTES = [
  { path: 'dashboard', module: 'Dashboard', element: <DashboardPage /> },
  { path: 'components-preview', element: <ComponentsPreviewPage /> },
  { path: 'users', module: 'Users & Permissions', element: <UsersPage /> },
  { path: 'users/:userId', module: 'Users & Permissions', element: <UserDetailsPage /> },
  { path: 'products', module: 'Products', element: <ProductsPage /> },
  { path: 'products/create', module: 'Products', element: <ProductCreatePage /> },
  { path: 'products/:productId', module: 'Products', element: <ProductDetailsPage /> },
  { path: 'categories', module: 'Categories', element: <CategoriesPage /> },
  { path: 'categories/create', module: 'Categories', element: <CategoryFormPage mode="add" /> },
  { path: 'categories/:categoryId/edit', module: 'Categories', element: <CategoryFormPage mode="edit" /> },
  { path: 'categories/:categoryId', module: 'Categories', element: <CategoryDetailsPage /> },
  { path: 'price-lists', module: 'Price List', element: <PriceListPage /> },
  { path: 'price-list', module: 'Price List', element: <PriceListPage /> },
  { path: 'inventory', module: 'Inventory', element: <InventoryOverviewPage /> },
  { path: 'inventory/stock-in', module: 'Inventory', element: <StockInPage /> },
  { path: 'inventory/stock-out', module: 'Inventory', element: <StockOutPage /> },
  { path: 'inventory/adjustments', module: 'Inventory', element: <StockAdjustmentPage /> },
  { path: 'inventory/stock-adjustment', module: 'Inventory', element: <StockAdjustmentPage /> },
  { path: 'inventory/transfers', module: 'Inventory', element: <StockTransferPage /> },
  { path: 'inventory/stock-transfer', module: 'Inventory', element: <StockTransferPage /> },
  { path: 'sales', module: 'Sales', element: <SalesPage /> },
  { path: 'sales/new', module: 'Sales', element: <RecordedSalesOrderForm mode="sale" /> },
  { path: 'sales/:saleId', module: 'Sales', element: <SaleDetailsPage /> },
  // Recording-compatible Sales routes. The query string selects the same
  // create screen for the Sales and Sales Orders navigation entry points.
  { path: 'orders/create', module: 'Sales', element: <RecordedSalesOrderForm mode="sale" /> },
  { path: 'orders', module: 'Sales Orders', element: <SalesOrdersPage /> },
  { path: 'orders/details/:saleId/download', module: 'Sales', element: <SalePrintPage /> },
  { path: 'orders/details/:saleId', module: 'Sales', element: <SaleDetailsPage /> },
  { path: 'sales-orders', module: 'Sales Orders', element: <SalesOrdersPage /> },
  { path: 'sales-orders/new', module: 'Sales Orders', element: <RecordedSalesOrderForm mode="order" /> },
  { path: 'sales-orders/:orderId', module: 'Sales Orders', element: <SalesOrderDetailsPage /> },
  { path: 'purchases', module: 'Purchases', element: <PurchasesPage /> },
  { path: 'purchases/:purchaseId', module: 'Purchases', element: <PurchaseDetailsPage /> },
  { path: 'purchase-orders', module: 'Purchase Orders', element: <PurchaseOrdersPage /> },
  { path: 'purchase-orders/new', module: 'Purchase Orders', element: <RecordedPurchaseForm /> },
  { path: 'purchase-orders/:orderId', module: 'Purchase Orders', element: <PurchaseOrderDetailsPage /> },
  { path: 'quotations', module: 'Quotations', element: <QuotationsPage /> },
  { path: 'quotations/:quotationId', module: 'Quotations', element: <QuotationDetailsPage /> },
  { path: 'transactions', module: 'Transactions', element: <TransactionsPage /> },
  { path: 'balance', module: 'Balance', element: <BalancePage /> },
  { path: 'payment-in', module: 'Payment In', element: <PaymentInPage /> },
  { path: 'payments-in', module: 'Payment In', element: <PaymentInPage /> },
  { path: 'payment-out', module: 'Payment Out', element: <PaymentOutPage /> },
  { path: 'payments-out', module: 'Payment Out', element: <PaymentOutPage /> },
  { path: 'fund-transfers', module: 'Fund Transfers', element: <FundTransfersPage /> },
  { path: 'expenses', module: 'Expenses', element: <ExpensesPage /> },
  { path: 'profit-loss', module: 'Profit & Loss', element: <ProfitLossPage /> },
  { path: 'reports', module: 'Reports', element: <ReportsPage /> },
  { path: 'notifications', module: 'Notifications', element: <NotificationsPage /> },
  { path: 'settings', module: 'Settings', element: <SettingsPage /> },
  { path: 'settings/general', module: 'Settings', element: <SettingsPage /> },
  { path: 'settings/firm', module: 'Settings', element: <SettingsPage /> },
  { path: 'settings/financial', module: 'Settings', element: <SettingsPage /> },
  { path: 'settings/inventory', module: 'Settings', element: <SettingsPage /> },
  { path: 'settings/document', module: 'Settings', element: <SettingsPage /> },
  { path: 'customers', module: 'Customers', element: <CustomersPage /> },
  { path: 'customers/:customerId', module: 'Customers', element: <CustomerDetailsPage /> },
]

const EXPLICIT_ROUTE_IDS = new Set([
  'dashboard',
  'users-permissions',
  'products',
  'categories',
  'price-list',
  'customers',
  'firms',
  'sales',
  'sales-orders',
])

const PLACEHOLDER_ROUTES = NAV_ROUTES.filter(
  (route) => !EXPLICIT_ROUTE_IDS.has(route.id),
).map((route) => ({ path: route.to.replace(/^\//, ''), module: route.label }))

function guardedElement(route) {
  if (!route.module) return route.element
  return <ModuleGuard moduleId={route.module}>{route.element}</ModuleGuard>
}

function renderWorkspacePages() {
  return (
    <>
      <Route index element={guardedElement({ module: 'Dashboard', element: <DashboardPage /> })} />
      {PAGE_ROUTES.map((route) => (
        <Route key={route.path} path={route.path} element={guardedElement(route)} />
      ))}
      {PLACEHOLDER_ROUTES.map((route) => (
        <Route key={`placeholder-${route.path}`} path={route.path} element={guardedElement({ ...route, element: <PlaceholderPage /> })} />
      ))}
      <Route path="*" element={<NotFoundPage />} />
    </>
  )
}

function renderLegacyWorkspacePages() {
  return (
    <>
      {PAGE_ROUTES.map((route) => (
        <Route key={route.path} path={route.path} element={guardedElement(route)} />
      ))}
      {PLACEHOLDER_ROUTES.map((route) => (
        <Route key={`placeholder-${route.path}`} path={route.path} element={guardedElement({ ...route, element: <PlaceholderPage /> })} />
      ))}
      <Route path="profile" element={<PlaceholderPage />} />
      <Route path="settings/account" element={<PlaceholderPage />} />
      <Route path="search" element={<SearchPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/firms" element={<Navigate to="/home" replace />} />
        <Route path="/firms/:firmId/profile" element={<FirmProfileRoute />}>
          <Route index element={<FirmProfilePage />} />
        </Route>
        <Route path="/firms/:firmId/workspace" element={<WorkspaceRoute />}>
          {renderWorkspacePages()}
        </Route>
        <Route element={<LegacyWorkspaceRoute />}>
          {renderLegacyWorkspacePages()}
        </Route>
      </Route>
      <Route path="/design-system" element={<DesignSystemPage />} />
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AppProvider>
          <AppRoutes />
        </AppProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}

export default App
