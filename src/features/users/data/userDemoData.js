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

// Synthetic users make the firm-scoped access model easy to preview. The
// administrator can see all demo firms; each firm admin is scoped to one.
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
  seedUser({
    id: 'user-02',
    name: 'Aditi Mehta',
    email: 'aditi@indoreagro.demo',
    phone: '9826012456',
    profileImage: null,
    firmId: 'indore-agro-supplies',
    role: 'firm_admin',
  }),
  seedUser({
    id: 'user-03',
    name: 'Rohan Verma',
    email: 'rohan@malwairrigation.demo',
    phone: '9755523456',
    profileImage: null,
    firmId: 'malwa-irrigation-traders',
    role: 'manager',
  }),
]

for (const user of USER_DEMO_DATA) {
  const access = getDefaultAccessPolicy(user.role)
  if (!user.permissions) user.permissions = access.modules
  if (!user.firmPermissions) user.firmPermissions = access.firmPermissions
  if (!user.dataPermissions) user.dataPermissions = access.dataPermissions
}

export const DEFAULT_USER_ID = 'user-01'
