/**
 * Quotation service — wraps the central finance store.
 */
import {
  getQuotations,
  getQuotationById,
  createQuotation,
  updateQuotation,
  markQuotationAccepted,
  convertQuotationToSaleOrder,
  mockQuotations,
} from '../../../core/financeStore'

export {
  getQuotations,
  getQuotationById,
  createQuotation,
  updateQuotation,
  markQuotationAccepted,
  convertQuotationToSaleOrder,
  mockQuotations,
}

export const QUOTATION_STATUSES = [
  { value: 'all', label: 'All statuses' },
  { value: 'Draft', label: 'Draft' },
  { value: 'Sent', label: 'Sent' },
  { value: 'Accepted', label: 'Accepted' },
  { value: 'Rejected', label: 'Rejected' },
  { value: 'Expired', label: 'Expired' },
  { value: 'Converted', label: 'Converted' },
]

export function getQuotationTotals(quotation) {
  const subtotal = quotation.items.reduce((sum, item) => sum + item.qty * item.price, 0)
  const taxTotal = Math.round((subtotal * 0.18 + Number.EPSILON) * 100) / 100
  return { subtotal, taxTotal, total: Math.round((subtotal + taxTotal + Number.EPSILON) * 100) / 100 }
}

export function formatMoney(amount) {
  return `₹${Number(amount ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`
}

export function formatDate(value) {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '—'
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(parsed)
}
