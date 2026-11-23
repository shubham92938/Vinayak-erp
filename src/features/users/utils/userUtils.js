import { SAMPLE_FIRMS } from '../../../config/firms'
import { USER_ACTIVITY_DEMO_DATA } from '../data/userActivityDemoData'
import { DEFAULT_USER_ID, getUserById } from '../services/userService'

export function isSuperAdmin(user) {
  return user?.role === 'super_admin'
}

export function isFirmAdmin(user) {
  return user?.role === 'firm_admin'
}

export function getCurrentUser() {
  return getUserById(DEFAULT_USER_ID)
}

export function getManageableFirms(user = getCurrentUser()) {
  return isSuperAdmin(user)
    ? SAMPLE_FIRMS
    : user?.firmId
      ? [SAMPLE_FIRMS.find((firm) => firm.id === user.firmId)]
      : []
}

export function getFirmLabel(firmId) {
  if (!firmId) return '—'
  return SAMPLE_FIRMS.find((firm) => firm.id === firmId)?.name ?? firmId
}

export function getInitials(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'U'
  if (parts.length === 1) return parts[0].slice(0, 1)
  return `${parts[0].slice(0, 1)}${parts[parts.length - 1].slice(0, 1)}`
}

export function formatUserDate(value, locale = 'en-IN') {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '—'
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parsed)
}

export function filterUsers(users, filters = {}) {
  const { search, firmId, role, status } = filters
  const query = String(search || '').trim().toLocaleLowerCase()

  return users.filter((user) => {
    if (query) {
      const haystack = [user.name, user.email, user.phone, getFirmLabel(user.firmId)]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase()
      if (!haystack.includes(query)) return false
    }

    if (role && role !== 'all' && user.role !== role) return false
    if (status && status !== 'all' && user.status !== status) return false
    if (firmId && firmId !== 'all' && user.firmId !== firmId) return false

    return true
  })
}

export function getActivityForUser(userId, activity = USER_ACTIVITY_DEMO_DATA) {
  return activity
    .filter((entry) => !userId || entry.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export const USER_CSV_COLUMNS = [
  { key: 'id', label: 'User ID' },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'firmId', label: 'Firm' },
  { key: 'role', label: 'Role' },
  { key: 'status', label: 'Status' },
  { key: 'lastLogin', label: 'Last Login' },
  { key: 'createdAt', label: 'Created Date' },
]
