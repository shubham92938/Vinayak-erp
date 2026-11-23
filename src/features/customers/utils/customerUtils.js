import { SAMPLE_FIRMS } from '../../../config/firms'

export function formatMoney(amount) {
  return `₹${Number(amount ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`
}

export function formatDate(value) {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '—'
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(parsed)
}

export function getFirmLabel(firmId) {
  return SAMPLE_FIRMS.find((firm) => firm.id === firmId)?.name ?? firmId ?? '—'
}

export function getInitials(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'C'
  if (parts.length === 1) return parts[0].slice(0, 1)
  return `${parts[0].slice(0, 1)}${parts[parts.length - 1].slice(0, 1)}`
}

export const CUSTOMER_TYPES = [
  { value: 'all', label: 'All types' },
  { value: 'Regular Customer', label: 'Regular Customer' },
  { value: 'Dealer', label: 'Dealer' },
]

export const CUSTOMER_STATUSES = [
  { value: 'all', label: 'All statuses' },
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
]
