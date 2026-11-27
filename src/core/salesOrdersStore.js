/**
 * Sales orders store (Part 5). Interconnects with products.
 */
import { getProducts, updateProductQuantity } from '../features/products/services/productService'
import { DEFAULT_FIRM_ID } from '../config/firms'
import { getActiveFirmId } from './firmContextStore'
import { nextNumber } from './numbers'
import { isStabilityModeEnabled } from './stabilityMode'
import { STABILITY_SALES_ORDERS } from './stabilityData'

export const mockSalesOrders = isStabilityModeEnabled()
  ? STABILITY_SALES_ORDERS.map((order) => ({
    ...order,
    items: order.items.map((item) => ({ ...item })),
    fulfilledItems: order.fulfilledItems.map((item) => ({ ...item })),
  }))
  : []

function inferFirmId(record) {
  return record.firmId ?? getProducts().find((product) => product.id === record.items?.[0]?.productId)?.firmId ?? DEFAULT_FIRM_ID
}

mockSalesOrders.forEach((order) => {
  order.firmId = inferFirmId(order)
  if (!order.fulfilledItems) {
    let remaining = Number(order.fulfilledQty ?? 0)
    order.fulfilledItems = order.items.map((item) => {
      const qty = Math.min(Number(item.qty ?? 0), remaining)
      remaining -= qty
      return { productId: item.productId, qty }
    }).filter((item) => item.qty > 0)
  }
})

function inActiveFirm(record) {
  const activeFirmId = getActiveFirmId()
  return !activeFirmId || record.firmId === activeFirmId
}

export function getSalesOrders(filters = {}) {
  const { search, status } = filters
  const query = String(search ?? '').trim().toLowerCase()

  return mockSalesOrders
    .filter((order) => {
      if (!inActiveFirm(order)) return false
      if (query && !`${order.number} ${order.customerName}`.toLowerCase().includes(query)) return false
      if (status && status !== 'all' && order.status !== status) return false
      return true
    })
    .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
}

export function getSalesOrderById(id) {
  return mockSalesOrders.find((order) => order.id === id && inActiveFirm(order)) ?? null
}

export function createSalesOrder(data) {
  const items = data.items.map((item) => ({ ...item }))
  const subtotal = items.reduce((sum, item) => sum + Number(item.qty ?? 0) * Number(item.price ?? 0), 0)
  const taxTotal = items.reduce((sum, item) => sum + (Number(item.qty ?? 0) * Number(item.price ?? 0) * Number(item.taxPct ?? 18)) / 100, 0)
  const advance = Math.max(0, Number(data.advance ?? 0))
  const order = {
    id: nextId('SO'),
    number: nextNumber('SO'),
    customerId: data.customerId,
    customerName: data.customerName,
    orderDate: data.orderDate ?? data.date ?? new Date().toISOString(),
    expectedDelivery: data.expectedDelivery ?? '',
    items,
    discount: Number(data.discount ?? 0),
    subtotal,
    taxTotal,
    total: subtotal + taxTotal - Number(data.discount ?? 0),
    advance,
    paymentMode: data.paymentMode ?? data.paymentType ?? '',
    saleType: data.saleType ?? data.orderType ?? 'Retail',
    orderType: data.orderType ?? '',
    invoiceType: data.invoiceType ?? '',
    vehicleNumber: data.vehicleNumber ?? '',
    driverNumber: data.driverNumber ?? '',
    reference: data.reference ?? '',
    notes: data.notes ?? '',
    status: 'Draft',
    fulfilledQty: 0,
    fulfilledItems: [],
    firmId: getActiveFirmId() ?? data.firmId ?? DEFAULT_FIRM_ID,
  }
  mockSalesOrders.push(order)
  return { ...order, items: order.items.map((item) => ({ ...item })) }
}

export function updateSalesOrder(id, updates) {
  const order = getSalesOrderById(id)
  if (!order) return null
  const index = mockSalesOrders.findIndex((entry) => entry.id === id && inActiveFirm(entry))
  const updated = { ...mockSalesOrders[index], ...updates, firmId: mockSalesOrders[index].firmId }
  mockSalesOrders[index] = updated
  return { ...updated }
}

export function confirmSalesOrder(id) {
  return updateSalesOrder(id, { status: 'Confirmed' })
}

export function fulfillSalesOrder(id, qty) {
  const order = getSalesOrderById(id)
  if (!order) return null

  const requestedQty = Math.max(0, Number(qty ?? 0))
  const fulfilledItems = Array.isArray(order.fulfilledItems) ? order.fulfilledItems.map((item) => ({ ...item })) : []
  let remaining = requestedQty

  // Consume the requested fulfillment across lines and decrement stock only by
  // the new quantity. Repeated receipt/fulfillment actions are idempotent.
  for (const item of order.items) {
    const previous = fulfilledItems.find((entry) => entry.productId === item.productId)?.qty ?? 0
    const delta = Math.min(Math.max(0, Number(item.qty ?? 0) - previous), remaining)
    if (delta > 0) {
      const product = getProducts().find((entry) => entry.id === item.productId)
      if (product) updateProductQuantity(product.id, Math.max(0, (product.quantity ?? 0) - delta))
      const existing = fulfilledItems.find((entry) => entry.productId === item.productId)
      if (existing) existing.qty += delta
      else fulfilledItems.push({ productId: item.productId, qty: delta })
      remaining -= delta
    }
  }

  const totalQty = order.items.reduce((sum, item) => sum + Number(item.qty ?? 0), 0)
  order.fulfilledItems = fulfilledItems
  order.fulfilledQty = Math.min(totalQty, fulfilledItems.reduce((sum, item) => sum + Number(item.qty ?? 0), 0))
  order.status = order.fulfilledQty >= totalQty ? 'Completed' : 'Partially Fulfilled'
  return { ...order, items: order.items.map((item) => ({ ...item })), fulfilledItems: fulfilledItems.map((item) => ({ ...item })) }
}

export function cancelSalesOrder(id) {
  return updateSalesOrder(id, { status: 'Cancelled' })
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

export function nextId(prefix) {
  return `${prefix}-${Math.floor(Math.random() * 90000) + 10000}`
}
