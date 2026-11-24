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

export const SALES_STATUSES = [
  { value: 'Paid', label: 'Paid' },
  { value: 'Outstanding', label: 'Outstanding' },
  { value: 'Partially Paid', label: 'Partially Paid' },
  { value: 'Delivered', label: 'Delivered' },
]

export function calcSaleTotals(items, discount = 0) {
  const subtotal = items.reduce((sum, item) => sum + item.qty * (item.price ?? 0), 0)
  const taxTotal = Math.round((subtotal * 0.18 + Number.EPSILON) * 100) / 100
  return { subtotal, taxTotal, total: Math.round((subtotal + taxTotal - discount + Number.EPSILON) * 100) / 100 }
}
