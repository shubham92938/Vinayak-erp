import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  BadgeDollarSign,
  BarChart3,
  Bell,
  Boxes,
  Building2,
  ClipboardList,
  FileSpreadsheet,
  FileText,
  Landmark,
  LayoutDashboard,
  Package,
  Scale,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Tags,
  TrendingUp,
  Truck,
  UserRound,
  Wallet,
} from 'lucide-react'

export const NAV_SECTIONS = [
  {
    id: 'overview',
    label: 'Overview',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        to: '/dashboard',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    id: 'master-data',
    label: 'Master Data',
    items: [
      { id: 'firms', label: 'My Firm', to: '/firms', icon: Building2 },
      {
        id: 'users-permissions',
        label: 'Users & Permissions',
        to: '/users',
        icon: ShieldCheck,
      },
      { id: 'products', label: 'Products', to: '/products', icon: Package },
      { id: 'categories', label: 'Categories', to: '/categories', icon: Tags },
      {
        id: 'price-list',
        label: 'Price List',
        to: '/price-lists',
        icon: BadgeDollarSign,
      },
      {
        id: 'customers',
        label: 'Customers',
        to: '/customers',
        icon: UserRound,
      },
      { id: 'suppliers', label: 'Suppliers', to: '/suppliers', icon: Truck },
    ],
  },
  {
    id: 'operations',
    label: 'Operations',
    items: [
      { id: 'sales', label: 'Sales', to: '/sales', icon: ShoppingCart },
      {
        id: 'sales-orders',
        label: 'Sales Orders',
        to: '/sales-orders',
        icon: ClipboardList,
      },
      {
        id: 'purchases',
        label: 'Purchases',
        to: '/purchases',
        icon: ShoppingBag,
      },
      {
        id: 'purchase-orders',
        label: 'Purchase Orders',
        to: '/purchase-orders',
        icon: FileText,
      },
      {
        id: 'quotations',
        label: 'Quotations',
        to: '/quotations',
        icon: FileSpreadsheet,
      },
      {
        id: 'inventory',
        label: 'Inventory',
        icon: Boxes,
        children: [
          {
            id: 'stock-in',
            label: 'Stock In',
            to: '/inventory/stock-in',
          },
          {
            id: 'stock-out',
            label: 'Stock Out',
            to: '/inventory/stock-out',
          },
          {
            id: 'stock-adjustment',
            label: 'Stock Adjustment',
            to: '/inventory/stock-adjustment',
          },
          {
            id: 'stock-transfer',
            label: 'Stock Transfer',
            to: '/inventory/stock-transfer',
          },
        ],
      },
    ],
  },
  {
    id: 'finance',
    label: 'Finance',
    items: [
      {
        id: 'transactions',
        label: 'Transactions',
        to: '/transactions',
        icon: ArrowLeftRight,
      },
      { id: 'balance', label: 'Balance', to: '/balance', icon: Scale },
      { id: 'expenses', label: 'Expenses', to: '/expenses', icon: Wallet },
      {
        id: 'payment-in',
        label: 'Payment In',
        to: '/payments-in',
        icon: ArrowDownLeft,
      },
      {
        id: 'payment-out',
        label: 'Payment Out',
        to: '/payments-out',
        icon: ArrowUpRight,
      },
      {
        id: 'fund-transfers',
        label: 'Fund Transfers',
        to: '/fund-transfers',
        icon: Landmark,
      },
      {
        id: 'profit-loss',
        label: 'Profit & Loss',
        to: '/profit-loss',
        icon: TrendingUp,
      },
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    items: [
      { id: 'reports', label: 'Reports', to: '/reports', icon: BarChart3 },
    ],
  },
  {
    id: 'system',
    label: 'System',
    items: [
      {
        id: 'notifications',
        label: 'Notifications',
        to: '/notifications',
        icon: Bell,
      },
      { id: 'settings', label: 'Settings', to: '/settings', icon: Settings },
    ],
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
  {
    id: 'account-settings',
    label: 'Account Settings',
    title: 'Account Settings',
    to: '/settings/account',
    section: 'System',
    parent: 'Settings',
    icon: Settings,
  },
  {
    id: 'search',
    label: 'Search',
    title: 'Search',
    to: '/search',
    section: 'Workspace',
    icon: Search,
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

    return [
      {
        ...item,
        section: section.label,
        sectionId: section.id,
      },
    ]
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
    return {
      id: 'firm-profile',
      label: 'My Firm',
      title: 'My Firm',
      section: 'Master Data',
      to: path,
    }
  }

  const workspaceMatch = path.match(/^\/firms\/[^/]+\/workspace(?:\/(.*))?$/)
  if (workspaceMatch) {
    const childPath = workspaceMatch[1] ? `/${workspaceMatch[1]}` : '/dashboard'
    const route = ALL_ROUTES.find((entry) => entry.to === childPath)
    return route ?? {
      id: 'workspace',
      label: 'Workspace',
      title: 'Workspace',
      section: 'Workspace',
      to: path,
    }
  }

  return null
}

export function getBreadcrumbs(pathname) {
  const meta = getRouteMeta(pathname)

  if (!meta) {
    return [
      { label: 'Home', to: '/home', kind: 'home' },
      { label: 'Page not found', current: true, kind: 'current' },
    ]
  }

  const crumbs = [{ label: 'Home', to: '/home', kind: 'home' }]

  if (meta.section) {
    crumbs.push({ label: meta.section, kind: 'section' })
  }

  if (meta.parent) {
    crumbs.push({ label: meta.parent, kind: 'parent' })
  }

  crumbs.push({ label: meta.title ?? meta.label, current: true, kind: 'current' })

  return crumbs
}
