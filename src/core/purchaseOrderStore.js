/**
 * Purchase Orders store (Part 7).
 * Order statuses: Draft, Pending Approval, Approved, Ordered, Partially Received, Received, Cancelled.
 */
import { getProducts, updateProductQuantity } from '../features/products/services/productService'
import { nextNumber } from './numbers'

export const mockPurchaseOrders = [
  { id: 'POO-20261101', number: 'PO-20261101', vendorName: 'HardwarePlus', orderDate: '2026-10-30T09:00:00', expectedDelivery: '2026-11-12', items: [{ productId: 'prod-02', name: 'Samsung Galaxy S24 Ultra', qty: 5, unit: 'pcs', price: 349900, taxPct: 18, discount: 0 }], discount: 0, subtotal: 1749500, taxTotal: 314850, total: 2064350, status: 'Received' },
  { id: 'POO-20261102', number: 'PO-20261102', vendorName: 'Nemotron Traders', orderDate: '2026-11-01T08:00:00', expectedDelivery: '2026-11-10', items: [{ productId: 'prod-07', name: 'Nike Dri-FIT T-Shirt', qty: 100, unit: 'pcs', price: 810, taxPct: 18, discount: 0 }], discount: 0, subtotal: 81000, taxTotal: 14580, total: 95580, status: 'Approved' },
  { id: 'POO-20261103', number: 'PO-20261103', vendorName: 'Vinayak Associates Hardware', orderDate: '2026-11-05T14:30:00', expectedDelivery: '2026-11-20', items: [{ productId: 'prod-25', name: 'Moisture Meter', qty: 10, unit: 'pcs', price: 6990, taxPct: 18, discount: 0 }], discount: 0, subtotal: 69900, taxTotal: 12582, total: 82482, status: 'Partially Received' },
]

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
      if (query && !`${order.number} ${order.vendorName}`.toLowerCase().includes(query)) return false
      if (status && status !== 'all' && order.status !== status) return false
      return true
    })
    .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
}

export function getPurchaseOrderById(id) {
  return mockPurchaseOrders.find((order) => order.id === id) ?? null
}

export function createPurchaseOrder(data) {
  const order = {
    id: nextId('POO'),
    number: nextNumber('PO'),
    vendorName: data.vendorName,
    orderDate: new Date().toISOString(),
    expectedDelivery: data.expectedDelivery ?? '',
    items: data.items,
    discount: 0,
    subtotal: data.items.reduce((sum, item) => sum + item.qty * item.price, 0),
    status: 'Draft',
    receivedQty: 0,
  }
  order.taxTotal = Math.round((order.subtotal * 0.18 + Number.EPSILON) * 100) / 100
  order.total = order.subtotal + order.taxTotal
  mockPurchaseOrders.push(order)
  return { ...order }
}

export function updatePurchaseOrder(id, updates) {
  const order = getPurchaseOrderById(id)
  if (!order) return null
  return { ...order, ...updates }
}

export function confirmPurchaseOrder(id) {
  const order = getPurchaseOrderById(id)
  if (!order) return null
  return { ...order, status: 'Approved' }
}

export function orderStock(id, items) {
  // Goods received: update inventory + record receipt on the order.
  const order = getPurchaseOrderById(id)
  if (!order) return null
  for (const item of items) {
    const product = getProducts().find((entry) => entry.id === item.productId)
    if (product) {
      updateProductQuantity(product.id, (product.quantity ?? 0) + item.qty)
    }
  }
  order.receivedQty = items.reduce((sum, item) => sum + item.qty, 0)
  order.status = 'Received'
  return { ...order }
}

export function cancelPurchaseOrder(id) {
  const order = getPurchaseOrderById(id)
  if (!order) return null
  return { ...order, status: 'Cancelled' }
}

export function nextId(prefix) {
  return `${prefix}-${Math.floor(Math.random() * 90000) + 10000}`
}

export function formatMoney(amount) {
  return `₹${Number(amount ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`
}
