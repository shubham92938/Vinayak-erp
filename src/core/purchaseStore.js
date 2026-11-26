/**
 * Purchases store (Part 6): purchase bills.
 * Vendor info captured inline on purchase records.
 */
import { getProducts } from '../features/products/services/productService'
import { DEFAULT_FIRM_ID } from '../config/firms'
import { getActiveFirmId } from './firmContextStore'
import { nextNumber } from './numbers'

export const mockPurchases = []

function inferFirmId(record) {
  return record.firmId ?? getProducts().find((product) => product.id === record.items?.[0]?.productId)?.firmId ?? DEFAULT_FIRM_ID
}

mockPurchases.forEach((purchase) => { purchase.firmId = inferFirmId(purchase) })

function inActiveFirm(record) {
  const activeFirmId = getActiveFirmId()
  return !activeFirmId || record.firmId === activeFirmId
}

function clonePurchase(purchase) {
  return purchase
    ? { ...purchase, items: purchase.items?.map((item) => ({ ...item })) ?? [] }
    : null
}

export function getPurchases(filters = {}) {
  const { search, vendorName, status } = filters
  const query = String(search ?? '').trim().toLowerCase()
  return [...mockPurchases]
    .filter((purchase) => {
      if (!inActiveFirm(purchase)) return false
      if (query && !`${purchase.number} ${purchase.vendorName}`.toLowerCase().includes(query)) return false
      if (vendorName && vendorName !== 'all' && purchase.vendorName !== vendorName) return false
      if (status && status !== 'all' && purchase.status !== status) return false
      return true
    })
    .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime())
    .map(clonePurchase)
}

function findPurchase(id) {
  return mockPurchases.find((purchase) =>
    (purchase.id === id || purchase.number === id) && inActiveFirm(purchase),
  ) ?? null
}

export function getPurchaseById(id) {
  return clonePurchase(findPurchase(id))
}

export function createPurchase(data) {
  const { items, discount = 0 } = data
  const subtotal = items.reduce((sum, item) => sum + Number(item.qty ?? 0) * Number(item.price ?? 0), 0)
  const taxTotal = Math.round((items.reduce((sum, item) => sum + (Number(item.qty ?? 0) * Number(item.price ?? 0) * Number(item.taxPct ?? 18)) / 100, 0) + Number.EPSILON) * 100) / 100
  const advance = Math.max(0, Number(data.advance ?? 0))
  const total = Math.round((subtotal - Number(discount) + taxTotal + Number.EPSILON) * 100) / 100
  const purchase = {
    id: nextId('PO'),
    number: nextNumber('PO'),
    vendorName: data.vendorName,
    vendorInvoiceNumber: data.vendorInvoiceNumber ?? '',
    vendorContact: data.vendorContact ?? '',
    purchaseDate: data.purchaseDate ?? new Date().toISOString(),
    items: items.map((item) => ({ ...item })),
    discount,
    subtotal,
    taxTotal,
    total,
    advance,
    paid: advance,
    due: Math.max(0, total - advance),
    status: advance >= total ? 'Paid' : advance > 0 ? 'Partially Paid' : 'Draft',
    paymentMode: data.paymentMode ?? '',
    notes: data.notes ?? '',
    firmId: getActiveFirmId() ?? data.firmId ?? DEFAULT_FIRM_ID,
  }
  mockPurchases.push(purchase)
  return clonePurchase(purchase)
}

export function updatePurchase(id, updates) {
  const purchase = findPurchase(id)
  if (!purchase) return null
  const index = mockPurchases.findIndex((entry) => entry.id === id && inActiveFirm(entry))
  const updated = { ...mockPurchases[index], ...updates, firmId: mockPurchases[index].firmId }
  mockPurchases[index] = updated
  return { ...updated }
}

export function recordPurchasePayment(purchaseId, amount, mode, notes = '') {
  const purchase = findPurchase(purchaseId)
  if (!purchase) throw new Error('Purchase not found in the selected firm')
  const numericAmount = Number(amount)
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw new Error('Payment amount must be greater than zero')
  }
  if (numericAmount > (purchase.due ?? 0)) {
    throw new Error('Payment exceeds the purchase balance')
  }
  purchase.paid = Math.round((purchase.paid + numericAmount) * 100) / 100
  purchase.due = Math.max(0, Math.round((purchase.due - numericAmount) * 100) / 100)
  purchase.status = purchase.due === 0 ? 'Paid' : 'Partially Paid'
  if (notes) purchase.notes = notes
  return clonePurchase(purchase)
}

export function confirmPurchase(purchaseId) {
  const purchase = getPurchaseById(purchaseId)
  if (!purchase) return null
  const index = mockPurchases.findIndex((entry) => entry.id === purchaseId && inActiveFirm(entry))
  const updated = { ...mockPurchases[index], status: 'Confirmed' }
  mockPurchases[index] = updated
  return { ...updated }
}

export function deletePurchase(purchaseId) {
  const index = mockPurchases.findIndex((purchase) => purchase.id === purchaseId && inActiveFirm(purchase))
  if (index === -1) return false
  mockPurchases.splice(index, 1)
  return true
}

export function nextId(prefix) {
  return `${prefix}-${Math.floor(Math.random() * 90000) + 10000}`
}

export function formatMoney(amount) {
  return `₹${Number(amount ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`
}
