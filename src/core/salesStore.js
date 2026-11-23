/**
 * Sales store: invoices, challans, payments.
 * Interconnects with the central store (products, customers, transactions).
 */
import { getProducts, updateProductQuantity as updateProductQty } from '../features/products/services/productService'
import {
  mockTransactions,
  updateCustomerBalance,
  calcTotal,
  nextNumber,
  nextId,
} from './store'

export const mockSales = [
  { id: 'SAL-01', number: 'INV-20261045', type: 'Invoice', customerId: 'CUST-001', customerName: 'Globe Cart Papers & Stationery', date: '2026-11-01T09:30:00', items: [{ productId: 'prod-01', name: 'Apple iPhone 15 Pro Max', qty: 6, unit: 'pcs', price: 37990, taxPct: 18, discount: 0 }], discount: 0, subtotal: 227940, taxTotal: 40912.2, total: 268852, advance: 0, paid: 268852, due: 0, status: 'Paid' },
  { id: 'SAL-02', number: 'INV-20261052', type: 'Invoice', customerId: 'CUST-005', customerName: 'HardwarePlus', date: '2026-11-03T14:10:00', items: [{ productId: 'prod-02', name: 'Samsung Galaxy S24 Ultra', qty: 3, unit: 'pcs', price: 349900, taxPct: 18, discount: 0 }], discount: 0, subtotal: 1049700, taxTotal: 188946, total: 1238646, advance: 0, paid: 0, due: 1238646, status: 'Outstanding' },
  { id: 'SAL-03', number: 'INV-20261061', type: 'Invoice', customerId: 'CUST-002', customerName: 'H&M Cotton T-Shirt Group', date: '2026-11-05T11:20:00', items: [{ productId: 'prod-07', name: 'Nike Dri-FIT T-Shirt', qty: 40, unit: 'pcs', price: 810, taxPct: 18, discount: 0 }], discount: 0, subtotal: 32400, taxTotal: 5832, total: 38232, advance: 0, paid: 38232, due: 0, status: 'Paid' },
  { id: 'SAL-04', number: 'INV-20261057', type: 'Invoice', customerId: 'CUST-009', customerName: 'Commercial Automata Pvt Ltd', date: '2026-11-04T15:55:00', items: [{ productId: 'prod-01', name: 'Apple iPhone 15 Pro Max', qty: 1, unit: 'pcs', price: 37990, taxPct: 18, discount: 0 }], discount: 0, subtotal: 37990, taxTotal: 6838.2, total: 44828, advance: 2000, paid: 2000, due: 42828, status: 'Outstanding' },
]

export const mockChallans = [
  { id: 'CHL-20261101', number: 'CHAL-20261101', date: '2026-11-02T10:00:00', customerId: 'CUST-001', customerName: 'Globe Cart Papers & Stationery', items: [{ productId: 'prod-01', name: 'Apple iPhone 15 Pro Max', qty: 2, unit: 'pcs', price: 37990, taxPct: 18, discount: 0 }], discount: 0, subtotal: 75980, taxTotal: 13676.4, total: 89656.4, status: 'Delivered' },
]

export const mockPayments = [
  { id: 'PAY-01', invoiceId: 'SAL-04', customerId: 'CUST-009', date: '2026-11-04T16:00:00', amount: 2000, mode: 'Bank Transfer', accountId: 'acc-bank-2', status: 'Paid', notes: 'Advance on INV-20261057' },
]

export const SALES_STATUSES = [
  { value: 'all', label: 'All statuses' },
  { value: 'Paid', label: 'Paid' },
  { value: 'Outstanding', label: 'Outstanding' },
  { value: 'Partially Paid', label: 'Partially Paid' },
  { value: 'Delivered', label: 'Delivered' },
]

export function getSales() {
  return [...mockSales, ...mockChallans]
}

export function getSalesFiltered(filters = {}) {
  const { search, customerId, status, type, fromDate, toDate } = filters
  const query = String(search ?? '').trim().toLowerCase()

  return getSales().filter((sale) => {
    if (query) {
      const haystack = `${sale.number} ${sale.customerName} ${sale.notes ?? ''}`.toLowerCase()
      if (!haystack.includes(query)) return false
    }
    if (customerId && customerId !== 'all' && sale.customerId !== customerId) return false
    if (status && status !== 'all' && sale.status !== status) return false
    if (type && type !== 'all' && sale.type !== type) return false
    if (fromDate && String(sale.date).slice(0, 10) < fromDate) return false
    if (toDate && String(sale.date).slice(0, 10) > toDate) return false
    return true
  })
}

export function getSaleById(saleId) {
  return [...mockSales, ...mockChallans].find((sale) => sale.id === saleId) ?? null
}

export function computeTotals(items, discount, taxPct) {
  const subtotal = items.reduce((sum, item) => sum + item.qty * item.price, 0)
  const taxTotal = calcTotal(subtotal, discount, taxPct) - subtotal + discount
  const total = calcTotal(subtotal, discount, taxPct)
  return { subtotal, taxTotal, total }
}

export function createSale(saleData) {
  const { items, discount = 0, taxPct = 18, status } = saleData

  if (items.length === 0) throw new Error('Sale requires at least one product')

  for (const item of items) {
    const product = getProducts().find((entry) => entry.id === item.productId)
    if (!product) throw new Error(`Product not found: ${item.productId}`)
    if (product.stockTracking !== false && item.qty > (product.quantity ?? 0)) {
      throw new Error(`Insufficient stock: ${product.name}. Available ${product.quantity}, need ${item.qty}`)
    }
    if (item.qty <= 0) throw new Error(`Quantity must be greater than 0: ${product.name}`)
  }

  const { subtotal, taxTotal, total } = computeTotals(items, discount, taxPct)
  const advance = saleData.advance ?? 0
  const due = Math.max(0, total - advance)
  const sale = {
    id: nextId('SAL'),
    number: nextNumber('INV'),
    type: 'Invoice',
    customerId: saleData.customerId,
    customerName: saleData.customerName,
    date: saleData.date ?? new Date().toISOString(),
    items,
    discount,
    subtotal,
    taxTotal,
    total,
    advance,
    paid: advance,
    due,
    status: status ?? (due === 0 ? 'Paid' : 'Outstanding'),
    notes: saleData.notes ?? '',
  }

  mockSales.push(sale)

  // Update inventory (stock out on sale dispatch)
  for (const item of items) {
    updateProductQty(item.productId, (getProducts().find((product) => product.id === item.productId)?.quantity ?? 0) - item.qty)
  }

  // Update customer outstanding balance
  if (sale.customerId) updateCustomerBalance(sale.customerId, due)

  return { ...sale }
}

export function updateSale(saleId, saleData) {
  const sale = getSaleById(saleId)
  if (!sale) return null
  return { ...sale, ...saleData }
}

export function deleteSale(saleId) {
  const index = mockSales.findIndex((sale) => sale.id === saleId)
  if (index === -1) return false
  mockSales.splice(index, 1)
  return true
}

export function recordPaymentIn(saleId, amount, mode, accountId, notes = '') {
  const sale = getSaleById(saleId)
  if (!sale) throw new Error('Sale not found')

  const payment = {
    id: nextId('PAY'),
    invoiceId: sale.id,
    customerId: sale.customerId,
    date: new Date().toISOString(),
    amount,
    mode,
    accountId,
    status: 'Paid',
    notes,
  }
  mockPayments.push(payment)

  sale.paid = Math.round((sale.paid + amount) * 100) / 100
  sale.due = Math.max(0, Math.round((sale.due - amount) * 100) / 100)
  sale.status = sale.due === 0 ? 'Paid' : 'Partially Paid'

  if (accountId) {
    const accountRecord = mockTransactions.find((entry) => entry.id === accountId)
    if (accountRecord) accountRecord.balance = Math.round((accountRecord.balance + amount) * 100) / 100
  }

  if (sale.customerId && accountId) {
    updateCustomerBalance(sale.customerId, -amount)
  }

  mockTransactions.push({
    id: nextId('txn'),
    type: 'sale',
    date: payment.date,
    amount,
    balance: sale.due,
    description: `Payment received: ${sale.number}`,
    accountId,
    customerId: sale.customerId,
    productId: sale.items[0]?.productId,
  })

  return { ...payment, sale: { id: sale.id, paid: sale.paid, due: sale.due, status: sale.status } }
}

export function getPayments(filters = {}) {
  const { saleId, customerId, mode } = filters
  return mockPayments.filter((payment) => {
    if (saleId && payment.invoiceId !== saleId) return false
    if (customerId && customerId !== 'all' && payment.customerId !== customerId) return false
    if (mode && payment.mode !== mode) return false
    return true
  })
}
