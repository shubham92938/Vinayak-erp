import { DEFAULT_FIRM_ID } from '../../../config/firms'
import { mockPurchases } from '../../../core/financeStore'

export function getPurchaseById(purchaseId) {
  return mockPurchases.find((entry) => entry.id === purchaseId || entry.number === purchaseId)
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

export function getFirmLabel(firmId = DEFAULT_FIRM_ID) {
  return 'Vinayak Associates'
}

export function formatPurchaseStatus(status) {
  return status
}

export function purchaseCsvRows(purchases) {
  return purchases.map((purchase) => ({
    id: purchase.id,
    number: purchase.number,
    vendorName: purchase.vendorName,
    vendorInvoiceNumber: purchase.vendorInvoiceNumber,
    purchaseDate: purchase.purchaseDate,
    total: purchase.total,
    paid: purchase.paid,
    due: purchase.due,
    status: purchase.status,
  }))
}

export const PURCHASE_CSV_COLUMNS = [
  { key: 'id', label: 'ID' },
  { key: 'number', label: 'Number' },
  { key: 'vendorName', label: 'Vendor' },
  { key: 'vendorInvoiceNumber', label: 'Vendor Invoice' },
  { key: 'purchaseDate', label: 'Date' },
  { key: 'total', label: 'Total' },
  { key: 'paid', label: 'Paid' },
  { key: 'due', label: 'Due' },
  { key: 'status', label: 'Status' },
]
