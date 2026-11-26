import {
  BarChart3,
  Building2,
  ClipboardList,
  FileSpreadsheet,
  FileText,
  Package,
  ReceiptIndianRupee,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Tags,
  UserRound,
} from 'lucide-react'

// This is the navigation visible in the recorded Vinayak Group website. The
// deeper modules remain routable for existing permission tests, but are not
// advertised as first-class navigation until the remaining recordings arrive.
export const NAV_SECTIONS = [
  {
    id: 'overview',
    label: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', to: '/dashboard', icon: BarChart3 },
      { id: 'firms', label: 'Firms', to: '/firms', icon: Building2 },
    ],
  },
  {
    id: 'users',
    label: 'Users',
    items: [{ id: 'users-permissions', label: 'Users', to: '/users', icon: ShieldCheck }],
  },
  {
    id: 'products',
    label: 'Products',
    items: [
      { id: 'products', label: 'Products', to: '/products', icon: Package },
      { id: 'categories', label: 'Categories', to: '/categories', icon: Tags },
      { id: 'price-list', label: 'Price List', to: '/price-lists', icon: ReceiptIndianRupee },
    ],
  },
  {
    id: 'sales-management',
    label: 'Sales Management',
    items: [
      { id: 'sales', label: 'Sales', to: '/sales', icon: ShoppingCart },
      { id: 'sales-orders', label: 'Sales Orders', to: '/orders', icon: ClipboardList },
    ],
  },
  {
    id: 'purchase-management',
    label: 'Purchase Management',
    items: [
      { id: 'purchases', label: 'Purchases', to: '/purchases', icon: ShoppingBag },
      { id: 'purchase-orders', label: 'Purchase Orders', to: '/purchase-orders', icon: FileText },
    ],
  },
  {
    id: 'quotations',
    label: 'Quotations',
    items: [{ id: 'quotations', label: 'Quotations', to: '/quotations', icon: FileSpreadsheet }],
  },
  {
    id: 'transactions',
    label: 'Transaction',
    items: [{ id: 'transactions', label: 'Transactions', to: '/transactions', icon: ReceiptIndianRupee }],
  },
  {
    id: 'reports',
    label: 'Reports',
    items: [{ id: 'reports', label: 'Reports', to: '/reports', icon: BarChart3 }],
  },
]

export const UTILITY_ROUTES = [
  {
    id: 'profile',
    label: 'My Profile',
    title: 'My Profile',
    to: '/profile',
    section: 'Account',
    icon: UserRound,
  },
]

export const NAV_ROUTES = NAV_SECTIONS.flatMap((section) =>
  section.items.flatMap((item) => {
    if (item.children) {
      return item.children.map((child) => ({
        ...child,
        icon: child.icon ?? item.icon,
        section: section.label,
        sectionId: section.id,
        parent: item.label,
        parentId: item.id,
      }))
    }

    return [{ ...item, section: section.label, sectionId: section.id }]
  }),
)

export const ALL_ROUTES = [...NAV_ROUTES, ...UTILITY_ROUTES]

export function getWorkspaceRoutePath(firmId, path) {
  if (!firmId || !path) return path
  if (path === '/firms') return `/firms/${firmId}/profile`
  return `/firms/${firmId}/workspace${path}`
}

function normalizePath(pathname) {
  if (!pathname) return '/'
  const normalized = pathname.replace(/\/+$/, '')
  return normalized || '/'
}

export function getRouteMeta(pathname) {
  const path = normalizePath(pathname)
  const direct = ALL_ROUTES.find((route) => route.to === path)
  if (direct) return direct

  const profileMatch = path.match(/^\/firms\/[^/]+\/profile$/)
  if (profileMatch) {
    return { id: 'firm-profile', label: 'My Firm', title: 'My Firm', section: 'Master Data', to: path }
  }

  const workspaceMatch = path.match(/^\/firms\/[^/]+\/workspace(?:\/(.*))?$/)
  if (workspaceMatch) {
    const childPath = workspaceMatch[1] ? `/${workspaceMatch[1]}` : '/dashboard'
    const route = ALL_ROUTES.find((entry) => entry.to === childPath)
    return route ?? { id: 'workspace', label: 'Workspace', title: 'Workspace', section: 'Workspace', to: path }
  }

  return null
}

export function getBreadcrumbs(pathname) {
  const meta = getRouteMeta(pathname)
  if (!meta) return [
    { label: 'Home', to: '/home', kind: 'home' },
    { label: 'Page not found', current: true, kind: 'current' },
  ]

  const crumbs = [{ label: 'Home', to: '/home', kind: 'home' }]
  if (meta.section) crumbs.push({ label: meta.section, kind: 'section' })
  if (meta.parent) crumbs.push({ label: meta.parent, kind: 'parent' })
  crumbs.push({ label: meta.title ?? meta.label, current: true, kind: 'current' })
  return crumbs
}
