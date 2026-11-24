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

export function getSaleOrderTotals(order) {
  return {
    subtotal: order.subtotal ?? order.items.reduce((sum, item) => sum + item.qty * item.price, 0),
    taxTotal: order.taxTotal ?? 0,
    total: order.total ?? order.subtotal,
    pendingQty: order.items.reduce((sum, item) => sum + item.qty, 0) - (order.fulfilledQty ?? 0),
  }
}

export const SALES_ORDER_STATUSES = [
  { value: 'all', label: 'All statuses' },
  { value: 'Draft', label: 'Draft' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Confirmed', label: 'Confirmed' },
  { value: 'Processing', label: 'Processing' },
  { value: 'Partially Fulfilled', label: 'Partially Fulfilled' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Cancelled', label: 'Cancelled' },
]
