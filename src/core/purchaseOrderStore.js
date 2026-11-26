/**
 * Purchase Orders store (Part 7).
 * Order statuses: Draft, Pending Approval, Approved, Ordered, Partially Received, Received, Cancelled.
 */
import { getProducts, updateProductQuantity } from '../features/products/services/productService'
import { DEFAULT_FIRM_ID } from '../config/firms'
import { getActiveFirmId } from './firmContextStore'
import { nextNumber } from './numbers'

export const mockPurchaseOrders = []

function inferFirmId(record) {
  return record.firmId ?? getProducts().find((product) => product.id === record.items?.[0]?.productId)?.firmId ?? DEFAULT_FIRM_ID
}

mockPurchaseOrders.forEach((order) => { order.firmId = inferFirmId(order) })

function inActiveFirm(record) {
  const activeFirmId = getActiveFirmId()
  return !activeFirmId || record.firmId === activeFirmId
}

export const PURCHASE_ORDER_STATUSES = [
  { value: 'all', label: 'All statuses' },
  { value: 'Draft', label: 'Draft' },
  { value: 'Pending Approval', label: 'Pending Approval' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Ordered', label: 'Ordered' },
  { value: 'Partially Received', label: 'Partially Received' },
  { value: 'Received', label: 'Received' },
  { value: 'Cancelled', label: 'Cancelled' },
]

export function getPurchaseOrders(filters = {}) {
  const { search, status } = filters
  const query = String(search ?? '').trim().toLowerCase()
  return mockPurchaseOrders
    .filter((order) => {
      if (!inActiveFirm(order)) return false
      if (query && !`${order.number} ${order.vendorName}`.toLowerCase().includes(query)) return false
      if (status && status !== 'all' && order.status !== status) return false
      return true
    })
    .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
}

export function getPurchaseOrderById(id) {
  return mockPurchaseOrders.find((order) => order.id === id && inActiveFirm(order)) ?? null
}

export function createPurchaseOrder(data) {
  const items = data.items.map((item) => ({ ...item }))
  const subtotal = items.reduce((sum, item) => sum + Number(item.qty ?? 0) * Number(item.price ?? 0), 0)
  const taxTotal = Math.round((items.reduce((sum, item) => sum + (Number(item.qty ?? 0) * Number(item.price ?? 0) * Number(item.taxPct ?? 18)) / 100, 0) + Number.EPSILON) * 100) / 100
  const order = {
    id: nextId('POO'),
    number: nextNumber('PO'),
    vendorName: data.vendorName,
    orderDate: data.orderDate ?? new Date().toISOString(),
    expectedDelivery: data.expectedDelivery ?? '',
    items,
    discount: 0,
    subtotal,
    taxTotal,
    total: subtotal + taxTotal,
    status: 'Draft',
    receivedQty: 0,
    receivedItems: [],
    firmId: getActiveFirmId() ?? data.firmId ?? DEFAULT_FIRM_ID,
  }
  mockPurchaseOrders.push(order)
  return { ...order, items: order.items.map((item) => ({ ...item })) }
}

export function updatePurchaseOrder(id, updates) {
  const order = getPurchaseOrderById(id)
  if (!order) return null
  const index = mockPurchaseOrders.findIndex((entry) => entry.id === id && inActiveFirm(entry))
  const updated = { ...mockPurchaseOrders[index], ...updates, firmId: mockPurchaseOrders[index].firmId }
  mockPurchaseOrders[index] = updated
  return { ...updated }
}

export function confirmPurchaseOrder(id) {
  return updatePurchaseOrder(id, { status: 'Approved' })
}

export function orderStock(id, items) {
  // Goods received: only the newly received quantity changes inventory. The
  // previous implementation added the entire order on every receipt click.
  const order = getPurchaseOrderById(id)
  if (!order) return null
  const receivedItems = Array.isArray(order.receivedItems) ? order.receivedItems : []
  const nextReceivedItems = receivedItems.map((item) => ({ ...item }))

  for (const item of items) {
    const previous = nextReceivedItems.find((entry) => entry.productId === item.productId)?.qty ?? 0
    const requested = Math.max(0, Number(item.qty ?? 0))
    const delta = Math.max(0, requested - previous)
    if (delta > 0) {
      const product = getProducts().find((entry) => entry.id === item.productId)
      if (product) updateProductQuantity(product.id, (product.quantity ?? 0) + delta)
    }
    const existing = nextReceivedItems.find((entry) => entry.productId === item.productId)
    if (existing) existing.qty = Math.max(existing.qty, requested)
    else nextReceivedItems.push({ productId: item.productId, qty: requested })
  }

  const totalOrdered = order.items.reduce((sum, item) => sum + Number(item.qty ?? 0), 0)
  order.receivedItems = nextReceivedItems
  order.receivedQty = Math.min(totalOrdered, nextReceivedItems.reduce((sum, item) => sum + Number(item.qty ?? 0), 0))
  order.status = order.receivedQty >= totalOrdered ? 'Received' : 'Partially Received'
  return { ...order, items: order.items.map((item) => ({ ...item })), receivedItems: nextReceivedItems.map((item) => ({ ...item })) }
}

export function cancelPurchaseOrder(id) {
  return updatePurchaseOrder(id, { status: 'Cancelled' })
}

export function nextId(prefix) {
  return `${prefix}-${Math.floor(Math.random() * 90000) + 10000}`
}

export function formatMoney(amount) {
  return `₹${Number(amount ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`
}
