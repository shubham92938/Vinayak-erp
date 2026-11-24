import { SAMPLE_FIRMS } from '../../../config/firms'
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
    createdAt: '2026-08-01T09:15:00',
    lastLogin: '2026-11-18T14:20:00',
    ...overrides,
  }
}

export const USER_DEMO_DATA = [
  seedUser({
    id: 'user-01',
    name: 'Vinayak Associates Admin',
    email: 'admin@vinayak-associates.in',
    phone: '+91-20-5555-0101',
    profileImage: null,
    firmId: null,
    role: 'super_admin',
  }),
  seedUser({
    id: 'user-02',
    name: 'Meera Patel',
    email: 'meera@vinayak-associates.in',
    phone: '+91-20-5555-0102',
    profileImage: null,
    firmId: SAMPLE_FIRMS[0].id,
    role: 'firm_admin',
    createdAt: '2026-08-12T08:00:00',
    lastLogin: '2026-11-20T08:30:00',
  }),
  seedUser({
    id: 'user-03',
    name: 'Rohan Sharma',
    email: 'rohan@vinayak-associates.in',
    phone: '+91-20-5555-0103',
    profileImage: null,
    firmId: SAMPLE_FIRMS[0].id,
    role: 'manager',
    createdAt: '2026-08-20T10:30:00',
    lastLogin: '2026-11-19T16:00:00',
  }),
  seedUser({
    id: 'user-04',
    name: 'Priya Nair',
    email: 'priya@vinayak-associates.in',
    phone: '+91-20-5555-0104',
    profileImage: null,
    firmId: SAMPLE_FIRMS[0].id,
    role: 'accountant',
    createdAt: '2026-09-02T11:20:00',
    lastLogin: '2026-11-21T09:15:00',
  }),
  seedUser({
    id: 'user-05',
    name: 'Vicky Desai',
    email: 'vicky@vinayak-associates.in',
    phone: '+91-20-5555-0105',
    profileImage: null,
    firmId: SAMPLE_FIRMS[0].id,
    role: 'sales_staff',
    createdAt: '2026-09-10T12:00:00',
    lastLogin: '2026-11-21T12:40:00',
  }),
  seedUser({
    id: 'user-06',
    name: 'Kiran Joshi',
    email: 'kiran@vinayak-associates.in',
    phone: '+91-20-5555-0106',
    profileImage: null,
    firmId: SAMPLE_FIRMS[1].id,
    role: 'firm_admin',
    createdAt: '2026-09-14T09:45:00',
    lastLogin: '2026-11-17T11:00:00',
  }),
  seedUser({
    id: 'user-07',
    name: 'Sunita More',
    email: 'sunita@vinayak-associates.in',
    phone: '+91-20-5555-0107',
    profileImage: null,
    firmId: SAMPLE_FIRMS[1].id,
    role: 'purchase_staff',
    createdAt: '2026-10-01T10:10:00',
    lastLogin: '2026-11-16T15:30:00',
  }),
  seedUser({
    id: 'user-08',
    name: 'Amit Joshi',
    email: 'amit@vinayak-associates.in',
    phone: '+91-20-5555-0108',
    profileImage: null,
    firmId: SAMPLE_FIRMS[1].id,
    role: 'inventory_staff',
    createdAt: '2026-10-08T10:30:00',
    lastLogin: '2026-11-15T13:45:00',
  }),
  seedUser({
    id: 'user-09',
    name: 'Tanuja Desai',
    email: 'tanuja@vinayak-associates.in',
    phone: '+91-20-5555-0109',
    profileImage: null,
    firmId: SAMPLE_FIRMS[1].id,
    role: 'viewer',
    createdAt: '2026-10-22T14:00:00',
    lastLogin: '2026-11-14T16:20:00',
  }),
  seedUser({
    id: 'user-10',
    name: 'Vinayak Traders Manager',
    email: 'traders-admin@vinayak-traders.in',
    phone: '+91-22-2555-0201',
    profileImage: null,
    firmId: SAMPLE_FIRMS[1].id,
    role: 'manager',
    createdAt: '2026-08-05T12:00:00',
    lastLogin: '2026-11-18T10:00:00',
  }),
  seedUser({
    id: 'user-11',
    name: 'Vinayak Logistics Admin',
    email: 'logistics-admin@vinayak-logistics.in',
    phone: '+91-253-555-0301',
    profileImage: null,
    firmId: SAMPLE_FIRMS[2].id,
    role: 'firm_admin',
    createdAt: '2026-08-06T13:00:00',
    lastLogin: '2026-11-18T18:00:00',
  }),
]

for (const user of USER_DEMO_DATA) {
  const access = getDefaultAccessPolicy(user.role)
  if (!user.permissions) user.permissions = access.modules
  if (!user.firmPermissions) user.firmPermissions = access.firmPermissions
  if (!user.dataPermissions) user.dataPermissions = access.dataPermissions
}

export const DEFAULT_USER_ID = 'user-01'
