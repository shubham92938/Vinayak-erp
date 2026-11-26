import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  Building2,
  ChevronDown,
  FileSpreadsheet,
  FileText,
  LogOut,
  Package,
  ReceiptIndianRupee,
  ShoppingBag,
  ShoppingCart,
  UserRound,
} from 'lucide-react'
import BrandLockup from '../../components/brand/BrandLockup'
import ThemeToggle from '../../components/theme/ThemeToggle'
import { getWorkspaceRoutePath } from '../../config/navigation'
import { hasModulePermission } from '../../core/accessControl'
import { useAuth, useFirmContext } from '../../context/hooks'
import './MainLayout.css'

const NAVIGATION = [
  { label: 'Dashboard', path: '/dashboard', icon: BarChart3 },
  { label: 'Firms', path: '/home', external: true, icon: Building2 },
  {
    label: 'Users', module: 'Users & Permissions', icon: UserRound, items: [
      { label: 'Users', path: '/users', module: 'Users & Permissions' },
    ],
  },
  {
    label: 'Products', module: 'Products', icon: Package, items: [
      { label: 'Products', path: '/products', module: 'Products' },
      { label: 'Categories', path: '/categories', module: 'Categories' },
      { label: 'Price List', path: '/price-lists', module: 'Price List' },
    ],
  },
  { label: 'Customers', path: '/customers', module: 'Customers', icon: UserRound },
  {
    label: 'Inventory', module: 'Inventory', icon: Package, items: [
      { label: 'Inventory Overview', path: '/inventory', module: 'Inventory' },
      { label: 'Stock In', path: '/inventory/stock-in', module: 'Inventory' },
      { label: 'Stock Out', path: '/inventory/stock-out', module: 'Inventory' },
      { label: 'Adjustments', path: '/inventory/adjustments', module: 'Inventory' },
      { label: 'Transfers', path: '/inventory/transfers', module: 'Inventory' },
    ],
  },
  {
    label: 'Sales Management', module: 'Sales', icon: ShoppingCart, items: [
      { label: 'Sales', path: '/sales', module: 'Sales' },
      { label: 'Sales Orders', path: '/orders', module: 'Sales Orders' },
    ],
  },
  {
    label: 'Purchase Management', module: 'Purchases', icon: ShoppingBag, items: [
      { label: 'Purchases', path: '/purchases', module: 'Purchases' },
      { label: 'Purchase Orders', path: '/purchase-orders', module: 'Purchase Orders' },
    ],
  },
  { label: 'Quotations', path: '/quotations', module: 'Quotations', icon: FileSpreadsheet },
  {
    label: 'Finance', icon: ReceiptIndianRupee, items: [
      { label: 'Transactions', path: '/transactions', module: 'Transactions' },
      { label: 'Balance', path: '/balance', module: 'Balance' },
      { label: 'Payment In', path: '/payment-in', module: 'Payment In' },
      { label: 'Payment Out', path: '/payment-out', module: 'Payment Out' },
      { label: 'Fund Transfers', path: '/fund-transfers', module: 'Fund Transfers' },
      { label: 'Expenses', path: '/expenses', module: 'Expenses' },
      { label: 'Profit & Loss', path: '/profit-loss', module: 'Profit & Loss' },
    ],
  },
  { label: 'Reports', path: '/reports', module: 'Reports', icon: FileText },
  {
    label: 'System', icon: FileText, items: [
      { label: 'Notifications', path: '/notifications', module: 'Notifications' },
      { label: 'Settings', path: '/settings', module: 'Settings' },
    ],
  },
]

function routeFor(currentFirm, item, pathname = '') {
  if (item.external || !pathname.startsWith('/firms/')) return item.path
  return getWorkspaceRoutePath(currentFirm?.id, item.path)
}

function isActive(pathname, item, currentFirm) {
  const target = routeFor(currentFirm, item, pathname)
  const normalizedPath = pathname.replace(/\/+$/, '') || '/'

  if (item.external && item.path === '/home') {
    return normalizedPath === '/home' || normalizedPath === `/firms/${currentFirm?.id}/profile`
  }

  if (item.path === '/dashboard') {
    const workspaceRoot = currentFirm?.id ? `/firms/${currentFirm.id}/workspace` : '/dashboard'
    return normalizedPath === target || normalizedPath === workspaceRoot
  }

  return normalizedPath === target || normalizedPath.startsWith(`${target}/`)
}

function WebsiteLogo() {
  return <BrandLockup size="sm" />
}

function UserActions({ currentUser, logout }) {
  const navigate = useNavigate()
  const [initials] = String(currentUser?.name ?? 'U')
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
  const role = String(currentUser?.role ?? 'user').replaceAll('_', ' ')

  return (
    <div className="website-header__actions">
      <button type="button" className="website-user" onClick={() => navigate('/profile')}>
        <span className="website-user__avatar">{initials?.toUpperCase() ?? 'U'}</span>
        <span className="website-user__text">
          <strong>{currentUser?.name ?? 'User'}</strong>
          <small>{role}</small>
        </span>
      </button>
      <button type="button" className="website-logout" onClick={logout} aria-label="Log out" title="Log out">
        <LogOut size={13} aria-hidden="true" />
      </button>
    </div>
  )
}

export default function MainLayout() {
  const { currentUser, logout } = useAuth()
  const { currentFirm } = useFirmContext()
  const location = useLocation()

  const visibleNavigation = NAVIGATION.flatMap((item) => {
    if (!item.items) {
      return !item.module || hasModulePermission(currentUser, item.module, 'view') ? [item] : []
    }

    const visibleChildren = item.items.filter(
      (child) => !child.module || hasModulePermission(currentUser, child.module, 'view'),
    )
    return visibleChildren.length > 0 ? [{ ...item, items: visibleChildren }] : []
  })

  return (
    <div className="website-shell">
      <header className="website-header">
        <Link to="/home" className="website-header__brand" aria-label="Vinayak Group home">
          <WebsiteLogo />
        </Link>
        <div className="website-header__firm">
          <span className="website-header__firm-dot" aria-hidden="true" />
          <span>Admin is currently viewing the firm: <strong>{currentFirm?.name ?? '—'}</strong></span>
        </div>
        <div className="website-header__tools">
          <ThemeToggle />
          <UserActions currentUser={currentUser} logout={logout} />
        </div>
      </header>

      <nav className="website-nav" aria-label="Main navigation">
        <div className="website-nav__scroll">
          <div className="website-nav__items">
            {visibleNavigation.map((item) => {
              const visibleChildren = item.items?.filter(
                (child) => !child.module || hasModulePermission(currentUser, child.module, 'view'),
              )
              const itemPath = routeFor(currentFirm, item, location.pathname)
              const active = isActive(location.pathname, item, currentFirm) || visibleChildren?.some((child) => isActive(location.pathname, child, currentFirm))
              const ItemIcon = item.icon

              if (!visibleChildren?.length) {
                return (
                  <Link
                    key={item.label}
                    to={itemPath}
                    className={['website-nav__link', active && 'is-active'].filter(Boolean).join(' ')}
                    aria-current={active ? 'page' : undefined}
                  >
                    {ItemIcon && <ItemIcon className="website-nav__icon" size={13} aria-hidden="true" />}
                    <span>{item.label}</span>
                  </Link>
                )
              }

              return (
                <details key={item.label} className={['website-nav__dropdown', active && 'is-active'].filter(Boolean).join(' ')}>
                  <summary>
                    {ItemIcon && <ItemIcon className="website-nav__icon" size={13} aria-hidden="true" />}
                    <span>{item.label}</span>
                    <ChevronDown size={11} aria-hidden="true" />
                  </summary>
                  <div className="website-nav__menu">
                    {visibleChildren.map((child) => (
                      <Link
                        key={child.label}
                        to={routeFor(currentFirm, child, location.pathname)}
                        className={isActive(location.pathname, child, currentFirm) ? 'is-active' : ''}
                        aria-current={isActive(location.pathname, child, currentFirm) ? 'page' : undefined}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </details>
              )
            })}
          </div>
        </div>
      </nav>

      <div className="website-context" role="status">
        <span>Working in <strong>{currentFirm?.name ?? 'your firm'}</strong></span>
        <Link to="/home">Change firm</Link>
      </div>

      <main id="main-content" className="website-content" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  )
}
