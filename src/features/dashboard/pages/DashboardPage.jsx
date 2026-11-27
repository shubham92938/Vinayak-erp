import { useState } from 'react'
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Boxes,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FilePlus2,
  Package,
  RefreshCw,
  ShoppingCart,
  TrendingUp,
  UserRound,
  Wallet,
  XCircle,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { getWorkspaceRoutePath } from '../../../config/navigation'
import { hasModulePermission } from '../../../core/accessControl'
import { getSalesFiltered } from '../../../core/salesStore'
import { getPurchases } from '../../../core/purchaseStore'
import { getSalesOrders } from '../../../core/salesOrdersStore'
import { getProducts } from '../../products/services/productService'
import { getStockStatus } from '../../products/utils/productUtils'
import { getExpenses } from '../../expenses/services/expenseService'
import { useAuth, useFirmContext } from '../../../context/hooks'
import './DashboardPage.css'

function formatMoney(value) {
  return `₹${Number(value ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}

function MetricCard({ label, value, note, icon: Icon, tone, trend }) {
  return (
    <article className={`dashboard-metric dashboard-metric--${tone}`}>
      <div className="dashboard-metric__topline">
        <span className="dashboard-metric__icon"><Icon size={18} strokeWidth={2} aria-hidden="true" /></span>
        <span className="dashboard-metric__label">{label}</span>
      </div>
      <strong className="dashboard-metric__value">{value}</strong>
      <span className="dashboard-metric__note">
        {trend === 'up' && <ArrowUpRight size={13} aria-hidden="true" />}
        {trend === 'down' && <ArrowDownRight size={13} aria-hidden="true" />}
        {note}
      </span>
    </article>
  )
}

function PanelHeader({ icon: Icon, title, to, actionLabel = 'View All' }) {
  return (
    <div className="dashboard-panel__header">
      <h2><Icon size={18} aria-hidden="true" />{title}</h2>
      {to && <Link to={to}>{actionLabel}<ArrowRight size={13} aria-hidden="true" /></Link>}
    </div>
  )
}

function EmptyPanel({ icon: Icon = Boxes, title, description }) {
  return (
    <div className="dashboard-empty-panel">
      <span><Icon size={22} aria-hidden="true" /></span>
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  )
}

function SalesOverview({ sales }) {
  const points = [...sales]
    .sort((first, second) => new Date(first.date).getTime() - new Date(second.date).getTime())
    .slice(-6)
  const max = Math.max(...points.map((sale) => Number(sale.total ?? 0)), 1)

  return (
    <section className="dashboard-panel dashboard-panel--sales">
      <PanelHeader icon={BarChart3} title="Sales Overview" to="/sales" actionLabel="View Report" />
      {points.length === 0 ? (
        <EmptyPanel icon={BarChart3} title="No sales data yet" description="Sales performance will appear here after your first record." />
      ) : (
        <div className="dashboard-sales-chart" aria-label="Recent sales totals">
          <div className="dashboard-sales-chart__plot">
            {points.map((sale) => (
              <div className="dashboard-sales-chart__bar-wrap" key={sale.id}>
                <span className="dashboard-sales-chart__value">{formatMoney(sale.total)}</span>
                <div className="dashboard-sales-chart__bar" style={{ height: `${Math.max(12, (Number(sale.total ?? 0) / max) * 100)}%` }} />
                <span className="dashboard-sales-chart__label">{new Date(sale.date).toLocaleDateString('en-IN', { month: 'short' })}</span>
              </div>
            ))}
          </div>
          <div className="dashboard-sales-chart__summary">
            <span><strong>{formatMoney(sales.reduce((sum, sale) => sum + Number(sale.total ?? 0), 0))}</strong> total recorded sales</span>
            <span className="dashboard-sales-chart__legend"><i /> Latest records</span>
          </div>
        </div>
      )}
    </section>
  )
}

function InventoryAlerts({ products, currentFirmId }) {
  const alerts = products
    .filter((product) => ['low-stock', 'out-of-stock'].includes(getStockStatus(product)))
    .slice(0, 4)

  return (
    <section className="dashboard-panel">
      <PanelHeader icon={AlertTriangle} title="Inventory Alerts" to={getWorkspaceRoutePath(currentFirmId, '/inventory')} />
      {alerts.length === 0 ? (
        <EmptyPanel icon={Package} title="No inventory alerts" description={products.length ? 'Your current stock is above minimum levels.' : 'Add products to start tracking stock.'} />
      ) : (
        <div className="dashboard-alert-list">
          {alerts.map((product) => {
            const status = getStockStatus(product)
            const out = status === 'out-of-stock'
            return (
              <Link key={product.id} to={getWorkspaceRoutePath(currentFirmId, `/products/${product.id}`)} className="dashboard-alert-row">
                <span className="dashboard-alert-row__image"><Package size={17} aria-hidden="true" /></span>
                <span className="dashboard-alert-row__copy">
                  <strong>{product.name}</strong>
                  <small>{out ? 'Out of stock' : `Only ${product.quantity ?? 0} ${product.unit ?? 'units'} remaining`}</small>
                </span>
                <span className={`dashboard-status dashboard-status--${out ? 'danger' : 'warning'}`}>{out ? 'Out of Stock' : 'Low Stock'}</span>
              </Link>
            )
          })}
        </div>
      )}
    </section>
  )
}

function PendingOrders({ orders }) {
  return (
    <section className="dashboard-panel">
      <PanelHeader icon={ClipboardList} title="Pending Orders" to="/orders" />
      {orders.length === 0 ? (
        <EmptyPanel icon={ClipboardList} title="No pending orders" description="Orders needing attention will appear here." />
      ) : (
        <div className="dashboard-order-list">
          {orders.slice(0, 4).map((order) => (
            <Link key={order.id} to={`/orders/details/${order.id}`} className="dashboard-order-row">
              <span className="dashboard-order-row__icon"><ClipboardList size={16} aria-hidden="true" /></span>
              <span className="dashboard-order-row__copy">
                <strong>{order.number}</strong>
                <small>{order.customerName || 'Customer not specified'}</small>
              </span>
              <span className="dashboard-status dashboard-status--info">{order.status || 'Pending'}</span>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}

export default function DashboardPage() {
  const { currentUser } = useAuth()
  const { currentFirm, currentFirmId } = useFirmContext()
  const [, setRefreshVersion] = useState(0)

  const data = (() => {
    const sales = getSalesFiltered({})
    const purchases = getPurchases({})
    const products = getProducts()
    const orders = getSalesOrders({ status: 'all' }).filter((order) => !['Completed', 'Cancelled'].includes(order.status))
    const expenses = getExpenses().filter((expense) => !currentFirmId || expense.firmId === currentFirmId)
    const salesTotal = sales.reduce((sum, sale) => sum + Number(sale.total ?? 0), 0)
    const purchaseTotal = purchases.reduce((sum, purchase) => sum + Number(purchase.total ?? 0), 0)
    const expenseTotal = expenses.reduce((sum, expense) => sum + Number(expense.amount ?? 0), 0)
    const paidSales = sales.reduce((sum, sale) => sum + Number(sale.paid ?? sale.advance ?? 0), 0)
    const dueSales = sales.reduce((sum, sale) => sum + Number(sale.due ?? 0), 0)
    const lowStock = products.filter((product) => getStockStatus(product) === 'low-stock').length
    const outOfStock = products.filter((product) => getStockStatus(product) === 'out-of-stock').length
    return {
      sales,
      purchases,
      products,
      orders,
      expenses,
      salesTotal,
      purchaseTotal,
      expenseTotal,
      paidSales,
      dueSales,
      lowStock,
      outOfStock,
    }
  })()

  const quickActions = [
    { label: 'Add Product', icon: Package, path: '/products/create', module: 'Products', tone: 'mint' },
    { label: 'Add Customer', icon: UserRound, path: '/customers', module: 'Customers', tone: 'blue' },
    { label: 'Create Sale', icon: ShoppingCart, path: '/sales/new', module: 'Sales', tone: 'green' },
    { label: 'Create Purchase', icon: FilePlus2, path: '/purchase-orders/new', module: 'Purchase Orders', tone: 'lavender' },
    { label: 'View Reports', icon: BarChart3, path: '/reports', module: 'Reports', tone: 'peach' },
  ].filter((action) => hasModulePermission(currentUser, action.module, 'view'))

  const recentSales = [...data.sales].sort((first, second) => new Date(second.date).getTime() - new Date(first.date).getTime()).slice(0, 5)
  const displayName = currentUser?.name?.split(' ')[0] || 'there'

  return (
    <div className="dashboard-page">
      <header className="dashboard-page__header">
        <div>
          <p className="dashboard-page__eyebrow">Overview</p>
          <h1>Good morning, {displayName}!</h1>
          <p>Here’s what’s happening with {currentFirm?.name || 'your business'} today.</p>
        </div>
        <div className="dashboard-page__controls">
          <button type="button" className="dashboard-filter-button"><CalendarDays size={15} aria-hidden="true" /> FY 2025–26</button>
          <button type="button" className="dashboard-filter-button" onClick={() => setRefreshVersion((value) => value + 1)}>
            <RefreshCw size={15} aria-hidden="true" /> Refresh
          </button>
        </div>
      </header>

      <section className="dashboard-metrics" aria-label="Business summary">
        <MetricCard label="Total Sales" value={formatMoney(data.salesTotal)} note={`${data.sales.length} recorded`} icon={ShoppingCart} tone="green" trend="up" />
        <MetricCard label="Total Purchases" value={formatMoney(data.purchaseTotal)} note={`${data.purchases.length} recorded`} icon={ShoppingCart} tone="blue" />
        <MetricCard label="Revenue" value={formatMoney(data.salesTotal)} note="From recorded sales" icon={TrendingUp} tone="mint" trend="up" />
        <MetricCard label="Total Expenses" value={formatMoney(data.expenseTotal)} note={`${data.expenses.length} recorded`} icon={Wallet} tone="peach" />
        <MetricCard label="Outstanding" value={formatMoney(data.dueSales)} note={`${formatMoney(data.paidSales)} collected`} icon={Wallet} tone="lavender" />
        <MetricCard label="Total Products" value={data.products.length.toLocaleString('en-IN')} note={`${data.lowStock + data.outOfStock} stock alerts`} icon={Boxes} tone="aqua" />
      </section>

      <section className="dashboard-panels dashboard-panels--top">
        <SalesOverview sales={data.sales} />
        <InventoryAlerts products={data.products} currentFirmId={currentFirmId} />
        <PendingOrders orders={data.orders} />
      </section>

      <section className="dashboard-panels dashboard-panels--bottom">
        <section className="dashboard-panel dashboard-panel--transactions">
          <PanelHeader icon={CheckCircle2} title="Recent Transactions" to="/sales" />
          {recentSales.length === 0 ? (
            <EmptyPanel icon={CheckCircle2} title="No transactions yet" description="Completed sales and payments will appear here." />
          ) : (
            <div className="dashboard-transactions-table-wrap">
              <table className="dashboard-transactions-table">
                <thead><tr><th>Date</th><th>Reference</th><th>Party</th><th>Amount</th><th>Status</th></tr></thead>
                <tbody>
                  {recentSales.map((sale) => (
                    <tr key={sale.id}>
                      <td>{formatDate(sale.date)}</td>
                      <td><strong>{sale.documentNumber || sale.number}</strong></td>
                      <td>{sale.customerName || 'Customer not specified'}</td>
                      <td className="tabular-nums">{formatMoney(sale.total)}</td>
                      <td><span className={`dashboard-status dashboard-status--${sale.due > 0 ? 'warning' : 'success'}`}>{sale.due > 0 ? 'Due' : 'Paid'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="dashboard-panel dashboard-panel--quick-actions">
          <PanelHeader icon={ArrowUpRight} title="Quick Actions" />
          <div className="dashboard-quick-actions">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link key={action.label} to={getWorkspaceRoutePath(currentFirmId, action.path)} className={`dashboard-quick-action dashboard-quick-action--${action.tone}`}>
                  <Icon size={21} aria-hidden="true" />
                  <span>{action.label}</span>
                </Link>
              )
            })}
          </div>
          {quickActions.length === 0 && <EmptyPanel icon={XCircle} title="No actions available" description="Your role does not have quick actions enabled." />}
        </section>
      </section>
    </div>
  )
}
