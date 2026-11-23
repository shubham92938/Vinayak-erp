export const USER_PERMISSIONS = ['view', 'create', 'edit', 'delete', 'export', 'approve']

export const PERMISSION_MODULES = [
  { id: 'Dashboard', group: 'Workspace' },
  { id: 'Firms', group: 'Master Data' },
  { id: 'Users', group: 'Master Data' },
  { id: 'Products', group: 'Master Data' },
  { id: 'Categories', group: 'Master Data' },
  { id: 'Price List', group: 'Master Data' },
  { id: 'Customers', group: 'Operations' },
  { id: 'Inventory', group: 'Operations' },
  { id: 'Sales', group: 'Operations' },
  { id: 'Sales Orders', group: 'Operations' },
  { id: 'Purchases', group: 'Operations' },
  { id: 'Purchase Orders', group: 'Operations' },
  { id: 'Quotations', group: 'Operations' },
  { id: 'Transactions', group: 'Finance' },
  { id: 'Balance', group: 'Finance' },
  { id: 'Expenses', group: 'Finance' },
  { id: 'Payment In', group: 'Finance' },
  { id: 'Payment Out', group: 'Finance' },
  { id: 'Fund Transfers', group: 'Finance' },
  { id: 'Profit & Loss', group: 'Finance' },
  { id: 'Reports', group: 'Analytics' },
  { id: 'Notifications', group: 'System' },
  { id: 'Settings', group: 'System' },
]

const ALL_MODULES_ALL_PERMISSIONS = Object.fromEntries(
  PERMISSION_MODULES.map((module) => [
    module.id,
    Object.fromEntries(USER_PERMISSIONS.map((permission) => [permission, true])),
  ]),
)

export const ROLE_DEFAULT_PERMISSIONS = {
  super_admin: ALL_MODULES_ALL_PERMISSIONS,
  firm_admin: Object.fromEntries(
    PERMISSION_MODULES.map((module) => [module.id, { view: true }]),
  ),
  manager: Object.fromEntries(
    PERMISSION_MODULES.map((module) => [module.id, { view: true, edit: true, create: true }]),
  ),
  accountant: Object.fromEntries(
    PERMISSION_MODULES.map((module) => [module.id, { view: true, export: true, approve: true }]),
  ),
  sales_staff: Object.fromEntries(
    PERMISSION_MODULES.map((module) => [module.id, { view: true, export: true }]),
  ),
  purchase_staff: Object.fromEntries(
    PERMISSION_MODULES.map((module) => [module.id, { view: true, export: true }]),
  ),
  inventory_staff: Object.fromEntries(
    PERMISSION_MODULES.map((module) => [module.id, { view: true, edit: true }]),
  ),
  viewer: Object.fromEntries(
    PERMISSION_MODULES.map((module) => [module.id, { view: true }]),
  ),
}

export function getDefaultPermissions(roleId) {
  return ROLE_DEFAULT_PERMISSIONS[roleId] ?? ALL_MODULES_ALL_PERMISSIONS
}

export function getTotalPermissions(permissions) {
  return Object.values(permissions ?? {}).reduce(
    (total, modulePermissions) =>
      total + Object.values(modulePermissions ?? {}).filter(Boolean).length,
    0,
  )
}

export function getTotalPossiblePermissions() {
  return PERMISSION_MODULES.length * USER_PERMISSIONS.length
}
