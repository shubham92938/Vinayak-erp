import { getDefaultAccessPolicy } from './rolePermissions'

export const USER_ROLES = [
  { id: 'super_admin', label: 'Super Admin' },
  { id: 'firm_admin', label: 'Firm Admin' },
  { id: 'manager', label: 'Manager' },
  { id: 'accountant', label: 'Accountant' },
  { id: 'sales_staff', label: 'Sales Staff' },
  { id: 'purchase_staff', label: 'Purchase Staff' },
  { id: 'inventory_staff', label: 'Inventory Staff' },
  { id: 'viewer', label: 'Viewer' },
]

export const USER_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

function seedUser(overrides) {
  return {
    status: 'active',
    password: 'demo123',
    createdAt: null,
    lastLogin: null,
    ...overrides,
  }
}

// No user master PDF was supplied. Keep only the administrator needed to open
// the local workspace; business records come from the supplied ERP PDFs.
export const USER_DEMO_DATA = [
  seedUser({
    id: 'user-01',
    name: 'Local Administrator',
    email: 'admin@local.invalid',
    phone: '',
    profileImage: null,
    firmId: null,
    role: 'super_admin',
  }),
]

for (const user of USER_DEMO_DATA) {
  const access = getDefaultAccessPolicy(user.role)
  if (!user.permissions) user.permissions = access.modules
  if (!user.firmPermissions) user.firmPermissions = access.firmPermissions
  if (!user.dataPermissions) user.dataPermissions = access.dataPermissions
}

export const DEFAULT_USER_ID = 'user-01'
