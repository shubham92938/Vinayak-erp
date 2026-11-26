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

// Keep every implemented module discoverable from the workspace navigation.
// The route table remains the single source of truth for direct links and
// breadcrumbs, while grouped children expose the deeper workflow screens.
export const NAV_SECTIONS = [
  {
    id: 'overview',
    label: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', to: '/dashboard', icon: BarChart3, module: 'Dashboard' },
      { id: 'firms', label: 'Firms', to: '/firms', icon: Building2, module: 'Firms' },
    ],
  },
  {
    id: 'users',
    label: 'Users',
    items: [{ id: 'users-permissions', label: 'Users', to: '/users', icon: ShieldCheck, module: 'Users & Permissions' }],
  },
  {
    id: 'products',
    label: 'Products',
    items: [
      { id: 'products', label: 'Products', to: '/products', icon: Package, module: 'Products' },
      { id: 'categories', label: 'Categories', to: '/categories', icon: Tags, module: 'Categories' },
      { id: 'price-list', label: 'Price List', to: '/price-lists', icon: ReceiptIndianRupee, module: 'Price List' },
    ],
  },
  {
    id: 'customers',
    label: 'Customers',
    items: [{ id: 'customers', label: 'Customers', to: '/customers', icon: UserRound, module: 'Customers' }],
  },
  {
    id: 'inventory',
    label: 'Inventory',
    items: [{
      id: 'inventory-management',
      label: 'Inventory',
      icon: Package,
      module: 'Inventory',
      children: [
        { id: 'inventory-overview', label: 'Overview', to: '/inventory', icon: Package, module: 'Inventory' },
        { id: 'stock-in', label: 'Stock In', to: '/inventory/stock-in', icon: Package, module: 'Inventory' },
        { id: 'stock-out', label: 'Stock Out', to: '/inventory/stock-out', icon: Package, module: 'Inventory' },
        { id: 'stock-adjustments', label: 'Adjustments', to: '/inventory/adjustments', icon: Package, module: 'Inventory' },
        { id: 'stock-transfers', label: 'Transfers', to: '/inventory/transfers', icon: Package, module: 'Inventory' },
      ],
    }],
  },
  {
    id: 'sales-management',
    label: 'Sales Management',
    items: [{
      id: 'sales-management',
      label: 'Sales Management',
      icon: ShoppingCart,
      module: 'Sales',
      children: [
        { id: 'sales', label: 'Sales', to: '/sales', icon: ShoppingCart, module: 'Sales' },
        { id: 'sales-orders', label: 'Sales Orders', to: '/orders', icon: ClipboardList, module: 'Sales Orders' },
      ],
    }],
  },
  {
    id: 'purchase-management',
    label: 'Purchase Management',
    items: [{
      id: 'purchase-management',
      label: 'Purchase Management',
      icon: ShoppingBag,
      module: 'Purchases',
      children: [
        { id: 'purchases', label: 'Purchases', to: '/purchases', icon: ShoppingBag, module: 'Purchases' },
        { id: 'purchase-orders', label: 'Purchase Orders', to: '/purchase-orders', icon: FileText, module: 'Purchase Orders' },
      ],
    }],
  },
  {
    id: 'quotations',
    label: 'Quotations',
    items: [{ id: 'quotations', label: 'Quotations', to: '/quotations', icon: FileSpreadsheet, module: 'Quotations' }],
  },
  {
    id: 'finance',
    label: 'Finance',
    items: [{
      id: 'finance-management',
      label: 'Finance',
      icon: ReceiptIndianRupee,
      module: 'Transactions',
      children: [
        { id: 'transactions', label: 'Transactions', to: '/transactions', icon: ReceiptIndianRupee, module: 'Transactions' },
        { id: 'balance', label: 'Balance', to: '/balance', icon: ReceiptIndianRupee, module: 'Balance' },
        { id: 'payment-in', label: 'Payment In', to: '/payment-in', icon: ReceiptIndianRupee, module: 'Payment In' },
        { id: 'payment-out', label: 'Payment Out', to: '/payment-out', icon: ReceiptIndianRupee, module: 'Payment Out' },
        { id: 'fund-transfers', label: 'Fund Transfers', to: '/fund-transfers', icon: ReceiptIndianRupee, module: 'Fund Transfers' },
        { id: 'expenses', label: 'Expenses', to: '/expenses', icon: ReceiptIndianRupee, module: 'Expenses' },
        { id: 'profit-loss', label: 'Profit & Loss', to: '/profit-loss', icon: ReceiptIndianRupee, module: 'Profit & Loss' },
      ],
    }],
  },
  {
    id: 'reports',
    label: 'Reports',
    items: [{ id: 'reports', label: 'Reports', to: '/reports', icon: BarChart3, module: 'Reports' }],
  },
  {
    id: 'system',
    label: 'System',
    items: [{
      id: 'system-management',
      label: 'System',
      icon: FileText,
      module: 'Settings',
      children: [
        { id: 'notifications', label: 'Notifications', to: '/notifications', icon: FileText, module: 'Notifications' },
        { id: 'settings', label: 'Settings', to: '/settings', icon: FileText, module: 'Settings' },
      ],
    }],
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
