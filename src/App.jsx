import { Navigate, Route, Routes } from 'react-router-dom'
import { ToastProvider } from './components/ui'
import { NAV_ROUTES } from './config/navigation'
import CategoriesPage from './features/categories/pages/CategoriesPage'
import CategoryDetailsPage from './features/categories/pages/CategoryDetailsPage'
import ComponentsPreviewPage from './features/components-preview/pages/ComponentsPreviewPage'
import CustomersPage from './features/customers/pages/CustomersPage'
import CustomerDetailsPage from './features/customers/pages/CustomerDetailsPage'
import DashboardPage from './features/dashboard/pages/DashboardPage'
import PriceListPage from './features/price-list/pages/PriceListPage'
import InventoryOverviewPage from './features/inventory/pages/InventoryOverviewPage'
import StockInPage from './features/inventory/pages/StockInPage'
import StockOutPage from './features/inventory/pages/StockOutPage'
import StockAdjustmentPage from './features/inventory/pages/StockAdjustmentPage'
import StockTransferPage from './features/inventory/pages/StockTransferPage'
import SalesPage from './features/sales/pages/SalesPage'
import SaleDetailsPage from './features/sales/pages/SaleDetailsPage'
import SalesOrdersPage from './features/sales-orders/pages/SalesOrdersPage'
import SalesOrderDetailsPage from './features/sales-orders/pages/SalesOrderDetailsPage'
import PurchasesPage from './features/purchases/pages/PurchasesPage'
import PurchaseDetailsPage from './features/purchases/pages/PurchaseDetailsPage'
import PurchaseOrdersPage from './features/purchase-orders/pages/PurchaseOrdersPage'
import PurchaseOrderDetailsPage from './features/purchase-orders/pages/PurchaseOrderDetailsPage'
import QuotationsPage from './features/quotations/pages/QuotationsPage'
import QuotationDetailsPage from './features/quotations/pages/QuotationDetailsPage'
import TransactionsPage from './features/transactions/pages/TransactionsPage'
import BalancePage from './features/balance/pages/BalancePage'
import PaymentInPage from './features/payment-in/pages/PaymentInPage'
import PaymentOutPage from './features/payment-out/pages/PaymentOutPage'
import FundTransfersPage from './features/fund-transfers/pages/FundTransfersPage'
import ExpensesPage from './features/expenses/pages/ExpensesPage'
import ProfitLossPage from './features/profit-loss/pages/ProfitLossPage'
import ReportsPage from './features/reports/pages/ReportsPage'
import NotificationsPage from './features/notifications/pages/NotificationsPage'
import SettingsPage from './features/settings/pages/SettingsPage'
import ProductDetailsPage from './features/products/pages/ProductDetailsPage'
import ProductsPage from './features/products/pages/ProductsPage'
import UserDetailsPage from './features/users/pages/UserDetailsPage'
import UsersPage from './features/users/pages/UsersPage'
import MainLayout from './layouts/MainLayout/MainLayout'
import DesignSystemPage from './pages/DesignSystemPage'
import NotFoundPage from './pages/NotFoundPage'
import PlaceholderPage from './pages/PlaceholderPage'
import SearchPage from './pages/SearchPage'

function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route
            path="/components-preview"
            element={<ComponentsPreviewPage />}
          />

          <Route path="/users" element={<UsersPage />} />
          <Route path="/users/:userId" element={<UserDetailsPage />} />

          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:productId" element={<ProductDetailsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/categories/:categoryId" element={<CategoryDetailsPage />} />
          <Route path="/price-lists" element={<PriceListPage />} />
          <Route path="/price-list" element={<PriceListPage />} />

          <Route path="/inventory" element={<InventoryOverviewPage />} />
          <Route path="/inventory/stock-in" element={<StockInPage />} />
          <Route path="/inventory/stock-out" element={<StockOutPage />} />
          <Route path="/inventory/adjustments" element={<StockAdjustmentPage />} />
          <Route path="/inventory/stock-adjustment" element={<StockAdjustmentPage />} />
          <Route path="/inventory/transfers" element={<StockTransferPage />} />
          <Route path="/inventory/stock-transfer" element={<StockTransferPage />} />
          <Route path="/sales" element={<SalesPage />} />
          <Route path="/sales/:saleId" element={<SaleDetailsPage />} />
          <Route path="/sales-orders" element={<SalesOrdersPage />} />
          <Route path="/sales-orders/:orderId" element={<SalesOrderDetailsPage />} />
          <Route path="/purchases" element={<PurchasesPage />} />
          <Route path="/purchases/:purchaseId" element={<PurchaseDetailsPage />} />
          <Route path="/purchase-orders" element={<PurchaseOrdersPage />} />
          <Route path="/purchase-orders/:orderId" element={<PurchaseOrderDetailsPage />} />
          <Route path="/quotations" element={<QuotationsPage />} />
          <Route path="/quotations/:quotationId" element={<QuotationDetailsPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/balance" element={<BalancePage />} />
          <Route path="/payment-in" element={<PaymentInPage />} />
          <Route path="/payments-in" element={<PaymentInPage />} />
          <Route path="/payment-out" element={<PaymentOutPage />} />
          <Route path="/payments-out" element={<PaymentOutPage />} />
          <Route path="/fund-transfers" element={<FundTransfersPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/profit-loss" element={<ProfitLossPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/settings/general" element={<SettingsPage />} />
          <Route path="/settings/firm" element={<SettingsPage />} />
          <Route path="/settings/financial" element={<SettingsPage />} />
          <Route path="/settings/inventory" element={<SettingsPage />} />
          <Route path="/settings/document" element={<SettingsPage />} />
          <Route path="/settings/profile" element={<SettingsPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/customers/:customerId" element={<CustomerDetailsPage />} />

          {NAV_ROUTES.filter(
            (route) =>
              route.id !== 'dashboard' &&
              route.id !== 'users-permissions' &&
              route.id !== 'products' &&
              route.id !== 'categories' &&
              route.id !== 'price-list' &&
              route.id !== 'customers',
          ).map(
            (route) => (
              <Route
                key={route.id}
                path={route.to}
                element={<PlaceholderPage />}
              />
            ),
          )}

          <Route path="/profile" element={<PlaceholderPage />} />
          <Route path="/settings/account" element={<PlaceholderPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route path="/design-system" element={<DesignSystemPage />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </ToastProvider>
  )
}

export default App
