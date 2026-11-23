/**
 * Finance store: purchases, purchase orders, quotations, sales orders.
 * Interconnects with the central store (products, customers, transactions, stock).
 */
import { getProducts, updateProductQuantity } from '../features/products/services/productService'
import {
  mockTransactions,
  mockCustomers,
  calcTotal,
  nextNumber,
  nextId,
} from './store'

export const mockPurchases = [
  { id: 'PO-20261023', number: 'PO-20261023', vendorName: 'Nemotron Traders', vendorContact: 'Arjun Khanna', vendorInvoiceNumber: 'NEMO/88812', purchaseDate: '2026-10-26T10:10:00', items: [{ productId: 'prod-03', name: 'OnePlus 12', qty: 5, unit: 'pcs', price: 169900, taxPct: 18, discount: 0 }], discount: 0, subtotal: 849500, taxTotal: 152910, total: 1002410, advance: 0, paid: 0, due: 1002410, status: 'Outstanding' },
  { id: 'PO-20261027', number: 'PO-20261027', vendorName: 'HardwarePlus', vendorContact: 'Vikas Joshi', vendorInvoiceNumber: 'HW/7742', purchaseDate: '2026-10-28T16:05:00', items: [{ productId: 'prod-04', name: 'Dell Inspiron 3540 Laptop', qty: 5, unit: 'pcs', price: 99900, taxPct: 18, discount: 0 }], discount: 0, subtotal: 499500, taxTotal: 89910, total: 589410, advance: 18000, paid: 18000, due: 571410, status: 'Partially Paid' },
]

export const mockPurchaseOrders = [
  { id: 'POO-20261101', number: 'PO-20261101', vendorName: 'HardwarePlus', orderDate: '2026-10-30T09:00:00', expectedDelivery: '2026-11-12', items: [{ productId: 'prod-02', name: 'Samsung Galaxy S24 Ultra', qty: 5, unit: 'pcs', price: 349900, taxPct: 18, discount: 0 }], discount: 0, subtotal: 1749500, taxTotal: 314850, total: 2064350, receivedQty: 5, status: 'Received' },
  { id: 'POO-20261102', number: 'PO-20261102', vendorName: 'Nemotron Traders', orderDate: '2026-11-01T08:00:00', expectedDelivery: '2026-11-10', items: [{ productId: 'prod-07', name: 'Nike Dri-FIT T-Shirt', qty: 100, unit: 'pcs', price: 810, taxPct: 18, discount: 0 }], discount: 0, subtotal: 81000, taxTotal: 14580, total: 95580, receivedQty: 0, status: 'Approved' },
  { id: 'POO-20261103', number: 'PO-20261103', vendorName: 'Vinayak Associates Hardware', orderDate: '2026-11-05T14:30:00', expectedDelivery: '2026-11-20', items: [{ productId: 'prod-25', name: 'Moisture Meter', qty: 10, unit: 'pcs', price: 6990, taxPct: 18, discount: 0 }], discount: 0, subtotal: 69900, taxTotal: 12582, total: 82482, receivedQty: 4, status: 'Partially Received' },
]

export const mockQuotations = [
  { id: 'Q-20261101', number: 'QUOT-20261101', customerId: 'CUST-001', customerName: 'Globe Cart Papers & Stationery', date: '2026-10-28T09:15:00', expiryDate: '2026-11-08', items: [{ productId: 'prod-01', name: 'Apple iPhone 15 Pro Max', qty: 8, unit: 'pcs', price: 37990, taxPct: 18, discount: 0 }], discount: 0, subtotal: 303920, taxTotal: 54705, total: 358625, status: 'Sent' },
  { id: 'Q-20261102', number: 'QUOT-20261102', customerId: 'CUST-003', customerName: 'Reliance Retail', date: '2026-10-30T14:00:00', expiryDate: '2026-11-15', items: [{ productId: 'prod-03', name: 'OnePlus 12', qty: 3, unit: 'pcs', price: 199900, taxPct: 18, discount: 0 }], discount: 0, subtotal: 599700, taxTotal: 107946, total: 707646, status: 'Accepted' },
  { id: 'Q-20261103', number: 'QUOT-20261103', customerId: 'CUST-002', customerName: 'H&M Cotton T-Shirt Group', date: '2026-11-02T16:00:00', expiryDate: '2026-11-25', items: [{ productId: 'prod-07', name: 'Nike Dri-FIT T-Shirt', qty: 25, unit: 'pcs', price: 810, taxPct: 18, discount: 300 }], discount: 300, subtotal: 20250, taxTotal: 3400.5, total: 23541, status: 'Draft' },
]

export function getPurchases() {
  return mockPurchases.map((purchase) => ({ ...purchase }))
}

export function getPurchaseById(id) {
  return mockPurchases.find((purchase) => purchase.id === id) ?? null
}

export function createPurchase(purchaseData) {
  const { items, discount = 0, taxPct = 18 } = purchaseData
  if (!items || items.length === 0) throw new Error('Purchase requires at least one product')

  const subtotal = items.reduce((sum, item) => sum + item.qty * item.price, 0)
  const taxTotal = calcTotal(subtotal, discount, taxPct) - subtotal + discount
  const total = calcTotal(subtotal, discount, taxPct)

  const purchase = {
    id: nextId('PO'),
    number: nextNumber('PO'),
    vendorName: purchaseData.vendorName,
    vendorContact: purchaseData.vendorContact ?? '',
    vendorInvoiceNumber: purchaseData.vendorInvoiceNumber ?? '',
    purchaseDate: purchaseData.purchaseDate ?? new Date().toISOString(),
    items,
    discount,
    subtotal,
    taxTotal,
    total,
    advance: purchaseData.advance ?? 0,
    paid: 0,
    due: total,
    status: 'Outstanding',
  }
  mockPurchases.push(purchase)
  return { ...purchase }
}

export function updatePurchase(id, purchaseData) {
  const purchase = getPurchaseById(id)
  if (!purchase) return null
  return { ...purchase, ...purchaseData }
}

export function deletePurchase(id) {
  const index = mockPurchases.findIndex((purchase) => purchase.id === id)
  if (index === -1) return false
  mockPurchases.splice(index, 1)
  return true
}

export function recordPurchasePayment(purchaseId, amount, mode, accountId, notes = '') {
  const purchase = getPurchaseById(purchaseId)
  if (!purchase) throw new Error('Purchase not found')

  purchase.paid = Math.round((purchase.paid + amount) * 100) / 100
  purchase.due = Math.max(0, Math.round((purchase.due - amount) * 100) / 100)
  purchase.status = purchase.due === 0 ? 'Paid' : 'Partially Paid'

  const accountRecord = accountId ? mockTransactions.find((entry) => entry.id === accountId) : null
  if (accountRecord) accountRecord.balance = Math.round((accountRecord.balance - amount) * 100) / 100

  mockTransactions.push({
    id: nextId('txn'),
    type: 'purchase',
    date: new Date().toISOString(),
    amount,
    balance: purchase.due,
    description: `Purchase payment: ${purchase.number}`,
    accountId,
    customerId: null,
    productId: purchase.items[0]?.productId,
  })

  return { ...purchase }
}

export function confirmPurchase(purchaseId) {
  const purchase = getPurchaseById(purchaseId)
  if (!purchase) return null
  // Updating inventory when goods are received happens in the purchase-order
  // or receiving flow; purchases only record the bill.
  return { ...purchase }
}

export function getPurchaseOrders() {
  return mockPurchaseOrders.map((order) => ({ ...order }))
}

export function getPurchaseOrderById(id) {
  return mockPurchaseOrders.find((order) => order.id === id) ?? null
}

export function createPurchaseOrder(orderData) {
  const order = {
    id: nextId('POO'),
    number: nextNumber('PO'),
    vendorName: orderData.vendorName,
    orderDate: orderData.orderDate ?? new Date().toISOString(),
    expectedDelivery: orderData.expectedDelivery ?? '',
    items: orderData.items,
    discount: orderData.discount ?? 0,
    subtotal: orderData.items.reduce((sum, item) => sum + item.qty * item.price, 0),
    taxTotal: 0,
    status: 'Draft',
    receivedQty: 0,
  }
  order.taxTotal = calcTotal(order.subtotal, order.discount, 18) - order.subtotal + order.discount
  order.total = order.subtotal + order.taxTotal
  mockPurchaseOrders.push(order)
  return { ...order }
}

export function updatePurchaseOrder(id, orderData) {
  const order = getPurchaseOrderById(id)
  if (!order) return null
  return { ...order, ...orderData }
}

export function confirmPurchaseOrder(id) {
  const order = getPurchaseOrderById(id)
  if (!order) return null
  return { ...order, status: 'Approved' }
}

export function receivePurchaseOrderStock(id, items) {
  const order = getPurchaseOrderById(id)
  if (!order) return null
  for (const item of items) {
    const product = getProducts().find((entry) => entry.id === item.productId)
    if (product) {
      updateProductQuantity(product.id, (product.quantity ?? 0) + item.qty)
    }
  }
  order.receivedQty = items.reduce((sum, item) => sum + item.qty, 0)
  order.status = 'Partially Received'
  return { ...order }
}

export function getQuotations() {
  return mockQuotations.map((quote) => ({ ...quote }))
}

export function getQuotationById(id) {
  return mockQuotations.find((quote) => quote.id === id) ?? null
}

export function createQuotation(quoteData) {
  const quote = {
    id: nextId('Q'),
    number: nextNumber('QUOT'),
    customerId: quoteData.customerId,
    customerName: quoteData.customerName,
    date: quoteData.date ?? new Date().toISOString(),
    expiryDate: quoteData.expiryDate ?? '',
    items: quoteData.items,
    discount: quoteData.discount ?? 0,
    subtotal: quoteData.items.reduce((sum, item) => sum + item.qty * item.price, 0),
    taxTotal: 0,
    status: 'Draft',
  }
  quote.taxTotal = calcTotal(quote.subtotal, quote.discount, 18) - quote.subtotal + quote.discount
  quote.total = quote.subtotal + quote.taxTotal
  mockQuotations.push(quote)
  return { ...quote }
}

export function updateQuotation(id, quoteData) {
  const quote = getQuotationById(id)
  if (!quote) return null
  return { ...quote, ...quoteData }
}

export function markQuotationAccepted(id) {
  const quote = getQuotationById(id)
  if (!quote) return null
  const index = mockQuotations.findIndex((entry) => entry.id === id)
  mockQuotations[index] = { ...quote, status: 'Accepted' }
  return { ...mockQuotations[index] }
}

export function convertQuotationToSaleOrder(id) {
  const quote = getQuotationById(id)
  if (!quote) throw new Error('Quotation not found')

  const order = {
    id: nextId('SO'),
    number: quote.number.replace(/^QUOT/, 'SO'),
    customerId: quote.customerId,
    customerName: quote.customerName,
    orderDate: new Date().toISOString(),
    expectedDelivery: quote.expiryDate,
    items: quote.items,
    discount: quote.discount,
    subtotal: quote.subtotal,
    taxTotal: quote.taxTotal,
    total: quote.total,
    fulfilledQty: 0,
    status: 'Draft',
  }
  mockSalesOrders.push(order)
  return { ...order }
}

export const mockSalesOrders = [
  { id: 'SO-20261101', number: 'SO-20261101', customerId: 'CUST-001', customerName: 'Globe Cart Papers & Stationery', orderDate: '2026-10-30T09:00:00', expectedDelivery: '2026-11-10', items: [{ productId: 'prod-03', name: 'OnePlus 12', qty: 5, unit: 'pcs', price: 199900, taxPct: 18, discount: 0 }], discount: 0, subtotal: 999500, taxTotal: 179910, total: 1179410, fulfilledQty: 5, status: 'Completed' },
  { id: 'SO-20261102', number: 'SO-20261102', customerId: 'CUST-002', customerName: 'H&M Cotton T-Shirt Group', orderDate: '2026-11-04T08:00:00', expectedDelivery: '2026-11-12', items: [{ productId: 'prod-15', name: 'Samsung Galaxy S24', qty: 4, unit: 'pcs', price: 289900, taxPct: 18, discount: 0 }], discount: 0, subtotal: 1159600, taxTotal: 208728, total: 1368328, fulfilledQty: 0, status: 'Pending' },
  { id: 'SO-20261103', number: 'SO-20261103', customerId: 'CUST-003', customerName: 'Reliance Retail', orderDate: '2026-11-01T10:00:00', expectedDelivery: '2026-11-08', items: [{ productId: 'prod-16', name: 'Realme 13 Pro', qty: 10, unit: 'pcs', price: 129900, taxPct: 18, discount: 0 }], discount: 0, subtotal: 1299000, taxTotal: 233820, total: 1532820, fulfilledQty: 0, status: 'Confirmed' },
  { id: 'SO-20261104', number: 'SO-20261104', customerId: 'CUST-009', customerName: 'Commercial Automata Pvt Ltd', orderDate: '2026-11-06T14:30:00', expectedDelivery: '2026-11-15', items: [{ productId: 'prod-25', name: 'Moisture Meter', qty: 5, unit: 'pcs', price: 6990, taxPct: 18, discount: 0 }], discount: 0, subtotal: 34950, taxTotal: 6291, total: 41241, fulfilledQty: 3, status: 'Partially Fulfilled' },
  { id: 'SO-20261105', number: 'SO-20261105', customerId: 'CUST-004', customerName: 'Bulk Way Traders', orderDate: '2026-11-08T16:00:00', expectedDelivery: '2026-11-14', items: [{ productId: 'prod-28', name: 'Industrial Vacuum', qty: 1, unit: 'pcs', price: 34500, taxPct: 18, discount: 0 }], discount: 0, subtotal: 34500, taxTotal: 6210, total: 40710, fulfilledQty: 0, status: 'Draft' },
]

export function getSalesOrders() {
  return mockSalesOrders.map((order) => ({ ...order }))
}

export function getSalesOrderById(id) {
  return mockSalesOrders.find((order) => order.id === id) ?? null
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

export function confirmSalesOrder(id) {
  const order = getSalesOrderById(id)
  if (!order) return null
  return { ...order, status: 'Confirmed' }
}

export function fulfillSalesOrder(id, qty) {
  const order = getSalesOrderById(id)
  if (!order) return null
  for (const item of order.items) {
    const product = getProducts().find((entry) => entry.id === item.productId)
    if (product) {
      updateProductQuantity(product.id, (product.quantity ?? 0) - item.qty)
    }
  }
  order.fulfilledQty = Math.max(0, order.fulfilledQty + qty)
  const remaining = order.items.reduce((sum, item) => sum + item.qty, 0) - order.fulfilledQty
  order.status = remaining <= 0 ? 'Completed' : order.fulfilledQty > 0 ? 'Partially Fulfilled' : order.status
  return { ...order }
}

export function cancelSalesOrder(id) {
  const order = getSalesOrderById(id)
  if (!order) return null
  return { ...order, status: 'Cancelled' }
}

/* --------------------------------------------------------------------------
   Payment In / Out (Payments module, Part 9)
   -------------------------------------------------------------------------- */

export const mockPaymentsIn = [
  { id: 'PAYI-01', customerId: 'CUST-009', invoiceId: 'SAL-04', date: '2026-11-04T16:00:00', amount: 2000, mode: 'Bank Transfer', accountId: 'acc-bank-2', status: 'Paid', notes: 'Advance on INV-20261057' },
  { id: 'PAYI-02', customerId: 'CUST-005', invoiceId: 'SAL-02', date: '2026-11-04T18:05:00', amount: 617000, mode: 'Cash', accountId: 'acc-cash-1', status: 'Paid', notes: 'Partial payment on INV-20261052' },
]

export const mockPaymentsOut = [
  { id: 'PAYO-01', vendorName: 'Nemotron Traders', purchaseId: 'PO-20261023', date: '2026-10-30T12:00:00', amount: 500000, mode: 'Bank Transfer', accountId: 'acc-bank-3', status: 'Paid', notes: 'Initial payment on PO-20261023' },
]

export function getPaymentsIn(filters = {}) {
  return mockPaymentsIn.filter((payment) => {
    if (filters.customerId && payment.customerId !== filters.customerId) return false
    if (filters.mode && payment.mode !== filters.mode) return false
    if (filters.status && payment.status !== filters.status) return false
    return true
  })
}

export function getPaymentsOut(filters = {}) {
  return mockPaymentsOut.filter((payment) => {
    if (filters.vendorName && payment.vendorName !== filters.vendorName) return false
    if (filters.mode && payment.mode !== filters.mode) return false
    return true
  })
}

export function recordPaymentInFinance(data) {
  const payment = {
    id: nextId('PAYI'),
    date: new Date().toISOString(),
    status: 'Paid',
    mode: data.mode,
    accountId: data.accountId,
    notes: data.notes ?? '',
    ...data,
  }
  mockPaymentsIn.push(payment)

  if (data.customerId && data.amount) {
    const customer = mockCustomers.find((entry) => entry.id === data.customerId)
    if (customer) customer.openingBalance = Math.max(0, Math.round((customer.openingBalance - data.amount) * 100) / 100)
  }

  if (data.accountId) {
    const account = mockTransactions.find((entry) => entry.id === data.accountId)
    if (account) account.balance = Math.round((account.balance + data.amount) * 100) / 100
  }

  mockTransactions.push({
    id: nextId('txn'),
    type: 'sale',
    date: payment.date,
    amount: data.amount,
    balance: 0,
    description: `Payment in: ${data.invoiceId ?? '—'}`,
    accountId: data.accountId,
    customerId: data.customerId ?? null,
    productId: null,
  })

  return { ...payment }
}

export function recordPaymentOutFinance(data) {
  const payment = {
    id: nextId('PAYO'),
    date: new Date().toISOString(),
    status: 'Paid',
    mode: data.mode,
    accountId: data.accountId,
    notes: data.notes ?? '',
    ...data,
  }
  mockPaymentsOut.push(payment)

  if (data.accountId) {
    const account = mockTransactions.find((entry) => entry.id === data.accountId)
    if (account) account.balance = Math.round((account.balance - data.amount) * 100) / 100
  }

  mockTransactions.push({
    id: nextId('txn'),
    type: 'purchase',
    date: payment.date,
    amount: data.amount,
    balance: 0,
    description: `Payment out: ${data.purchaseId ?? data.expenseId ?? data.vendorName}`,
    accountId: data.accountId,
    customerId: null,
    productId: null,
  })

  return { ...payment }
}

/* --------------------------------------------------------------------------
   Fund Transfers (Part 9.5)
   -------------------------------------------------------------------------- */

export function recordFundTransfer(transfer) {
  const from = mockTransactions.find((entry) => entry.id === transfer.fromAccountId)
  const to = mockTransactions.find((entry) => entry.id === transfer.toAccountId)

  if (!from || !to) throw new Error('Account not found')
  if (transfer.fromAccountId === transfer.toAccountId) throw new Error('Transfer must be between different accounts')
  if (from.balance < transfer.amount) throw new Error('Insufficient funds')

  from.balance = Math.round((from.balance - transfer.amount) * 100) / 100
  to.balance = Math.round((to.balance + transfer.amount) * 100) / 100

  mockTransactions.push({
    id: nextId('txn'),
    type: 'transfer',
    date: new Date().toISOString(),
    amount: transfer.amount,
    balance: 0,
    description: `Fund transfer: ${from.id} → ${to.id}`,
    accountId: transfer.fromAccountId,
    customerId: null,
    productId: null,
  })

  return { fromId: from.id, toId: to.id, amount: transfer.amount }
}
