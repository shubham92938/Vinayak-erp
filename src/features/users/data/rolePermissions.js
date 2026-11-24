export const USER_PERMISSIONS = ['view', 'create', 'edit', 'delete', 'export', 'approve']

export const PERMISSION_MODULES = [
  { id: 'Dashboard', group: 'Workspace' },
  { id: 'Firms', group: 'Master Data' },
  { id: 'Users & Permissions', group: 'Master Data' },
  { id: 'Products', group: 'Master Data' },
  { id: 'Categories', group: 'Master Data' },
  { id: 'Price List', group: 'Master Data' },
  { id: 'Customers', group: 'Master Data' },
  { id: 'Sales', group: 'Operations' },
  { id: 'Sales Orders', group: 'Operations' },
  { id: 'Purchases', group: 'Operations' },
  { id: 'Purchase Orders', group: 'Operations' },
  { id: 'Quotations', group: 'Operations' },
  { id: 'Inventory', group: 'Operations' },
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

export const FIRM_PERMISSIONS = [
  { id: 'viewFirmDetails', label: 'View Firm Details' },
  { id: 'editFirmDetails', label: 'Edit Firm Details' },
  { id: 'createFirms', label: 'Create Firms' },
  { id: 'editAllFirms', label: 'Edit All Firms' },
  { id: 'manageAllFirms', label: 'Manage All Firms' },
]

export const DATA_SCOPE_PERMISSIONS = [
  { id: 'viewOwn', label: 'View Own Firm Data' },
  { id: 'viewAll', label: 'View All Firms\' Data' },
  { id: 'createOwn', label: 'Create Records in Own Firm' },
  { id: 'createAll', label: 'Create Records in Other Firms' },
  { id: 'editOwn', label: 'Edit Own Firm Records' },
  { id: 'editAll', label: 'Edit Records Across Firms' },
  { id: 'deleteOwn', label: 'Delete Own Firm Records' },
  { id: 'deleteAll', label: 'Delete Records Across Firms' },
  { id: 'exportOwn', label: 'Export Own Firm Data' },
  { id: 'exportAll', label: 'Export All Firms\' Data' },
  { id: 'approveOwn', label: 'Approve Own Firm Records' },
  { id: 'approveAll', label: 'Approve Records Across Firms' },
]

function buildModulePermissions(permissionMap) {
  return Object.fromEntries(
    PERMISSION_MODULES.map((module) => [
      module.id,
      Object.fromEntries(
        USER_PERMISSIONS.map((permission) => [
          permission,
          Boolean(permissionMap[permission]),
        ]),
      ),
    ]),
  )
}

export const ROLE_DEFAULT_PERMISSIONS = {
  super_admin: buildModulePermissions(
    Object.fromEntries(USER_PERMISSIONS.map((permission) => [permission, true])),
  ),
  firm_admin: buildModulePermissions({ view: true }),
  manager: buildModulePermissions({ view: true, edit: true, create: true }),
  accountant: buildModulePermissions({ view: true, export: true, approve: true }),
  sales_staff: buildModulePermissions({ view: true, export: true }),
  purchase_staff: buildModulePermissions({ view: true, export: true }),
  inventory_staff: buildModulePermissions({ view: true, edit: true }),
  viewer: buildModulePermissions({ view: true }),
}

const ALL_FIRM_PERMISSIONS = Object.fromEntries(
  FIRM_PERMISSIONS.map((permission) => [permission.id, true]),
)

export const ROLE_DEFAULT_FIRM_PERMISSIONS = {
  super_admin: ALL_FIRM_PERMISSIONS,
  firm_admin: {
    viewFirmDetails: true,
    editFirmDetails: true,
    createFirms: false,
    editAllFirms: false,
    manageAllFirms: false,
  },
  manager: {
    viewFirmDetails: true,
    editFirmDetails: false,
    createFirms: false,
    editAllFirms: false,
    manageAllFirms: false,
  },
  accountant: {
    viewFirmDetails: true,
    editFirmDetails: false,
    createFirms: false,
    editAllFirms: false,
    manageAllFirms: false,
  },
  sales_staff: {
    viewFirmDetails: true,
    editFirmDetails: false,
    createFirms: false,
    editAllFirms: false,
    manageAllFirms: false,
  },
  purchase_staff: {
    viewFirmDetails: true,
    editFirmDetails: false,
    createFirms: false,
    editAllFirms: false,
    manageAllFirms: false,
  },
  inventory_staff: {
    viewFirmDetails: true,
    editFirmDetails: false,
    createFirms: false,
    editAllFirms: false,
    manageAllFirms: false,
  },
  viewer: {
    viewFirmDetails: true,
    editFirmDetails: false,
    createFirms: false,
    editAllFirms: false,
    manageAllFirms: false,
  },
}

function getModulePermission(roleId, moduleId, permission) {
  return Boolean(ROLE_DEFAULT_PERMISSIONS[roleId]?.[moduleId]?.[permission])
}

export function getDefaultDataPermissions(roleId) {
  return Object.fromEntries(
    PERMISSION_MODULES.map((module) => {
      const scopePermissions = {}
      for (const action of USER_PERMISSIONS) {
        scopePermissions[`${action}Own`] = getModulePermission(roleId, module.id, action)
        scopePermissions[`${action}All`] = roleId === 'super_admin'
      }
      return [module.id, scopePermissions]
    }),
  )
}

export function getDefaultFirmPermissions(roleId) {
  return { ...(ROLE_DEFAULT_FIRM_PERMISSIONS[roleId] ?? ROLE_DEFAULT_FIRM_PERMISSIONS.viewer) }
}

export function getDefaultPermissions(roleId) {
  const permissions = ROLE_DEFAULT_PERMISSIONS[roleId] ?? ROLE_DEFAULT_PERMISSIONS.viewer
  return Object.fromEntries(
    Object.entries(permissions).map(([moduleId, modulePermissions]) => [
      moduleId,
      { ...modulePermissions },
    ]),
  )
}

export function getDefaultAccessPolicy(roleId) {
  return {
    modules: getDefaultPermissions(roleId),
    firmPermissions: getDefaultFirmPermissions(roleId),
    dataPermissions: getDefaultDataPermissions(roleId),
  }
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
