import { useMemo } from 'react'
import { ArrowRight, ClipboardList, FileText, Landmark, Package, ReceiptIndianRupee, Scale, ShoppingBag, ShoppingCart, Tags, TrendingUp, UserRound, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getWorkspaceRoutePath } from '../../../config/navigation'
import { getProducts } from '../../products/services/productService'
import { getSalesFiltered } from '../../../core/salesStore'
import { getPurchases } from '../../../core/purchaseStore'
import { getSalesOrders } from '../../../core/salesOrdersStore'
import { hasModulePermission } from '../../../core/accessControl'
import { useAuth, useFirmContext } from '../../../context/hooks'
import './DashboardPage.css'

const CARD_DEFINITIONS = [
  { label: 'Products', path: '/products', module: 'Products', icon: Package, tone: 'lavender', count: () => `${getProducts().length} Products` },
  { label: 'Price List', path: '/price-lists', module: 'Price List', icon: Tags, tone: 'peach', count: () => 'See current prices' },
  { label: 'Customers', path: '/customers', module: 'Customers', icon: UserRound, tone: 'sky', count: () => 'Manage customers' },
  { label: 'Inventory', path: '/inventory', module: 'Inventory', icon: Package, tone: 'mint', count: () => 'Track stock levels' },
  { label: 'Sales', path: '/sales', module: 'Sales', icon: ReceiptIndianRupee, tone: 'mint', count: () => `${getSalesFiltered({}).length} Records` },
  { label: 'Sales Orders', path: '/orders', module: 'Sales Orders', icon: ClipboardList, tone: 'blue', count: () => `${getSalesOrders({}).length} Orders` },
  { label: 'Purchase', path: '/purchases', module: 'Purchases', icon: ShoppingCart, tone: 'pink', count: () => `${getPurchases({}).length} Records` },
  { label: 'Purchase Orders', path: '/purchase-orders', module: 'Purchase Orders', icon: ShoppingBag, tone: 'sky', count: () => 'See details' },
  { label: 'Quotations', path: '/quotations', module: 'Quotations', icon: FileText, tone: 'cream', count: () => 'See details' },
  { label: 'Transactions', path: '/transactions', module: 'Transactions', icon: ReceiptIndianRupee, tone: 'blue', count: () => 'View account activity' },
  { label: 'Balance', path: '/balance', module: 'Balance', icon: Scale, tone: 'lime', count: () => 'See details' },
  { label: 'Expenses', path: '/expenses', module: 'Expenses', icon: Wallet, tone: 'rose', count: () => 'See details' },
  { label: 'Payment In', path: '/payment-in', module: 'Payment In', icon: Landmark, tone: 'green', count: () => 'See details' },
  { label: 'Payment Out', path: '/payment-out', module: 'Payment Out', icon: Wallet, tone: 'peach', count: () => 'See details' },
  { label: 'Fund Transfers', path: '/fund-transfers', module: 'Fund Transfers', icon: Landmark, tone: 'lavender', count: () => 'See details' },
  { label: 'Profit & Loss', path: '/profit-loss', module: 'Profit & Loss', icon: TrendingUp, tone: 'green-strong', count: () => 'See details' },
  { label: 'Reports', path: '/reports', module: 'Reports', icon: FileText, tone: 'blue', count: () => 'Export business reports' },
  { label: 'Notifications', path: '/notifications', module: 'Notifications', icon: FileText, tone: 'pink', count: () => 'Review system activity' },
  { label: 'Settings', path: '/settings', module: 'Settings', icon: Tags, tone: 'cream', count: () => 'Configure workspace' },
]

export default function DashboardPage() {
  const { currentUser } = useAuth()
  const { currentFirmId } = useFirmContext()
  const cards = useMemo(
    () => CARD_DEFINITIONS.filter((card) => hasModulePermission(currentUser, card.module, 'view')),
    [currentUser],
  )

  return (
    <div className="recorded-dashboard">
      <div className="recorded-dashboard__heading">
        <div>
          <p className="recorded-dashboard__eyebrow">Overview</p>
          <h1>Dashboard</h1>
        </div>
        <span className="recorded-dashboard__hint">Quick access</span>
      </div>

      <section className="recorded-dashboard__cards" aria-label="Dashboard shortcuts">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Link
              key={card.label}
              to={getWorkspaceRoutePath(currentFirmId, card.path)}
              className={`recorded-dashboard__card recorded-dashboard__card--${card.tone}`}
            >
              <span className="recorded-dashboard__card-icon"><Icon size={17} strokeWidth={2} aria-hidden="true" /></span>
              <span className="recorded-dashboard__card-label">{card.label}</span>
              <span className="recorded-dashboard__card-meta">{card.count()}</span>
              <span className="recorded-dashboard__card-link">See Details <ArrowRight size={12} aria-hidden="true" /></span>
            </Link>
          )
        })}
      </section>
    </div>
  )
}
