import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown, LogOut } from 'lucide-react'
import BrandLockup from '../../components/brand/BrandLockup'
import { getWorkspaceRoutePath } from '../../config/navigation'
import { hasModulePermission } from '../../core/accessControl'
import { useAuth, useFirmContext } from '../../context/hooks'
import './MainLayout.css'

const NAVIGATION = [
  { label: 'Home', path: '/dashboard' },
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Firms', path: '/home', external: true },
  {
    label: 'Users', module: 'Users & Permissions', items: [
      { label: 'Users', path: '/users', module: 'Users & Permissions' },
    ],
  },
  {
    label: 'Products', module: 'Products', items: [
      { label: 'Products', path: '/products', module: 'Products' },
      { label: 'Price List', path: '/price-lists', module: 'Price List' },
      { label: 'Categories', path: '/categories', module: 'Categories' },
    ],
  },
  {
    label: 'Sales Management', module: 'Sales', items: [
      { label: 'Sales', path: '/sales', module: 'Sales' },
      { label: 'Sales Orders', path: '/sales-orders', module: 'Sales Orders' },
    ],
  },
  {
    label: 'Purchase Management', module: 'Purchases', items: [
      { label: 'Purchases', path: '/purchases', module: 'Purchases' },
      { label: 'Purchase Orders', path: '/purchase-orders', module: 'Purchase Orders' },
    ],
  },
  { label: 'Quotations', path: '/quotations', module: 'Quotations' },
  { label: 'Transaction', path: '/transactions', module: 'Transactions' },
  { label: 'Reports', path: '/reports', module: 'Reports' },
]

function routeFor(currentFirm, item) {
  if (item.external) return item.path
  return getWorkspaceRoutePath(currentFirm?.id, item.path)
}

function isActive(pathname, item, currentFirm) {
  const target = routeFor(currentFirm, item)
  if (item.path === '/dashboard') return pathname === target || pathname === `${target}/`
  return pathname === target || pathname.startsWith(`${target}/`)
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

  const visibleNavigation = NAVIGATION.filter((item) => {
    if (!item.module) return true
    if (item.items) {
      return item.items.some((child) => !child.module || hasModulePermission(currentUser, child.module, 'view'))
    }
    return hasModulePermission(currentUser, item.module, 'view')
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
        <UserActions currentUser={currentUser} logout={logout} />
      </header>

      <nav className="website-nav" aria-label="Main navigation">
        <div className="website-nav__scroll">
          <div className="website-nav__items">
            {visibleNavigation.map((item) => {
              const visibleChildren = item.items?.filter(
                (child) => !child.module || hasModulePermission(currentUser, child.module, 'view'),
              )
              const itemPath = routeFor(currentFirm, item)
              const active = isActive(location.pathname, item, currentFirm) || visibleChildren?.some((child) => isActive(location.pathname, child, currentFirm))

              if (!visibleChildren?.length) {
                return (
                  <Link
                    key={item.label}
                    to={itemPath}
                    className={['website-nav__link', active && 'is-active'].filter(Boolean).join(' ')}
                  >
                    {item.label}
                  </Link>
                )
              }

              return (
                <details key={item.label} className={['website-nav__dropdown', active && 'is-active'].filter(Boolean).join(' ')}>
                  <summary>
                    <span>{item.label}</span>
                    <ChevronDown size={11} aria-hidden="true" />
                  </summary>
                  <div className="website-nav__menu">
                    {visibleChildren.map((child) => (
                      <Link key={child.label} to={routeFor(currentFirm, child)} className={isActive(location.pathname, child, currentFirm) ? 'is-active' : ''}>
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
