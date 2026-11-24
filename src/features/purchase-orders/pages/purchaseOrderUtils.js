import { getFirmLabel as getCentralFirmLabel } from '../../users/utils/userUtils'

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
  return getCentralFirmLabel(firmId)
}

export function formatOrderStatus(status) {
  return status
}
