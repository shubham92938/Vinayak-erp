/**
 * Purchases store (Part 6): purchase bills.
 * Vendor info captured inline on purchase records.
 */
import { getProducts, updateProductQuantity } from '../features/products/services/productService'
import { nextNumber } from './numbers'

export const mockPurchases = [
  { id: 'PO-20261023', number: 'PO-20261023', vendorName: 'Nemotron Traders', vendorInvoiceNumber: 'NEMO/88812', purchaseDate: '2026-10-26T10:10:00', items: [{ productId: 'prod-03', name: 'OnePlus 12', qty: 5, unit: 'pcs', price: 169900, taxPct: 18, discount: 0 }], discount: 0, subtotal: 849500, taxTotal: 152910, total: 1002410, advance: 0, paid: 0, due: 1002410, status: 'Outstanding' },
  { id: 'PO-20261027', number: 'PO-20261027', vendorName: 'HardwarePlus', vendorInvoiceNumber: 'HW/7742', purchaseDate: '2026-10-28T16:05:00', items: [{ productId: 'prod-04', name: 'Dell Inspiron 3540 Laptop', qty: 5, unit: 'pcs', price: 99900, taxPct: 18, discount: 0 }], discount: 0, subtotal: 499500, taxTotal: 89910, total: 589410, advance: 18000, paid: 18000, due: 571410, status: 'Partially Paid' },
]

export function getPurchases(filters = {}) {
  const { search, vendorName, status } = filters
  const query = String(search ?? '').trim().toLowerCase()
  return mockPurchases
    .filter((purchase) => {
      if (query && !`${purchase.number} ${purchase.vendorName}`.toLowerCase().includes(query)) return false
      if (vendorName && purchase.vendorName !== vendorName) return false
      if (status && purchase.status !== status) return false
      return true
    })
    .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime())
}

export function getPurchaseById(id) {
  return mockPurchases.find((purchase) => purchase.id === id) ?? null
}

export function createPurchase(data) {
  const { items, discount = 0 } = data
  const subtotal = items.reduce((sum, item) => sum + item.qty * item.price, 0)
  const taxTotal = Math.round((subtotal * 0.18 + Number.EPSILON) * 100) / 100
  const purchase = {
    id: nextId('PO'),
    number: nextNumber('PO'),
    vendorName: data.vendorName,
    vendorInvoiceNumber: data.vendorInvoiceNumber ?? '',
    vendorContact: data.vendorContact ?? '',
    purchaseDate: data.purchaseDate ?? new Date().toISOString(),
    items,
    discount,
    subtotal,
    taxTotal,
    total: Math.round((subtotal + taxTotal + Number.EPSILON) * 100) / 100,
    advance: data.advance ?? 0,
    paid: 0,
    due: 0,
    status: 'Draft',
    notes: data.notes ?? '',
  }
  purchase.due = purchase.total
  mockPurchases.push(purchase)
  return { ...purchase }
}

export function updatePurchase(id, updates) {
  const purchase = getPurchaseById(id)
  if (!purchase) return null
  return { ...purchase, ...updates }
}

export function recordPurchasePayment(purchaseId, amount, mode, notes = '') {
  const purchase = getPurchaseById(purchaseId)
  if (!purchase) throw new Error('Purchase not found')
  purchase.paid = Math.round((purchase.paid + amount) * 100) / 100
  purchase.due = Math.max(0, Math.round((purchase.due - amount) * 100) / 100)
  purchase.status = purchase.due === 0 ? 'Paid' : 'Partially Paid'
  return { ...purchase, notes }
}

export function confirmPurchase(purchaseId) {
  const purchase = getPurchaseById(purchaseId)
  if (!purchase) return null
  // Inventory updates when goods are received (separate workflow); purchase confirm only
  return { ...purchase, status: 'Confirmed' }
}

export function deletePurchase(purchaseId) {
  const index = mockPurchases.findIndex((purchase) => purchase.id === purchaseId)
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
