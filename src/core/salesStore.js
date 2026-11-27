/**
 * Sales store: invoices, challans, payments.
 * Interconnects with the central store (products, customers, transactions).
 */
import { getProducts, updateProductQuantity as updateProductQty } from '../features/products/services/productService'
import { DEFAULT_FIRM_ID } from '../config/firms'
import { getActiveFirmId } from './firmContextStore'
import {
  mockTransactions,
  mockAccounts,
  updateCustomerBalance,
  calcTotal,
  nextNumber,
  nextId,
} from './store'
import { SVA_SALES_DATA } from '../features/sales/data/svaSalesData'
import { isStabilityModeEnabled } from './stabilityMode'
import { DEMO_CHALLANS, DEMO_PAYMENTS, DEMO_SALES } from './demoData'

const STABILITY_MODE = isStabilityModeEnabled()

// Stability mode keeps the imported single-firm sales fixture. Normal local
// workspaces use synthetic invoice, challan and payment records for all firms.
export const mockSales = (STABILITY_MODE ? SVA_SALES_DATA : DEMO_SALES).map((sale) => ({
  ...sale,
  items: sale.items.map((item) => ({ ...item })),
}))

export const mockChallans = (STABILITY_MODE ? [] : DEMO_CHALLANS).map((challan) => ({
  ...challan,
  items: challan.items.map((item) => ({ ...item })),
}))

export const mockPayments = (STABILITY_MODE ? [] : DEMO_PAYMENTS).map((payment) => ({ ...payment }))

function inferFirmId(record) {
  return record.firmId ?? getProducts().find((product) => product.id === record.items?.[0]?.productId)?.firmId ?? DEFAULT_FIRM_ID
}

mockSales.forEach((sale) => { sale.firmId = inferFirmId(sale) })
mockChallans.forEach((challan) => { challan.firmId = inferFirmId(challan) })
mockPayments.forEach((payment) => { payment.firmId = mockSales.find((sale) => sale.id === payment.invoiceId)?.firmId ?? DEFAULT_FIRM_ID })

function inActiveFirm(record) {
  const activeFirmId = getActiveFirmId()
  return !activeFirmId || record.firmId === activeFirmId
}

export const SALES_STATUSES = [
  { value: 'all', label: 'All statuses' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'Paid', label: 'Paid' },
  { value: 'Outstanding', label: 'Outstanding' },
  { value: 'Partially Paid', label: 'Partially Paid' },
  { value: 'Delivered', label: 'Delivered' },
]

export function getSales() {
  return [...mockSales, ...mockChallans].filter(inActiveFirm)
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
  return [...mockSales, ...mockChallans].find((sale) => sale.id === saleId && inActiveFirm(sale)) ?? null
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

  const hasLineTaxes = items.some((item) => item.taxPct !== undefined && item.taxPct !== null)
  const subtotal = items.reduce((sum, item) => sum + Number(item.qty ?? 0) * Number(item.price ?? 0), 0)
  const taxTotal = hasLineTaxes
    ? items.reduce((sum, item) => sum + (Number(item.qty ?? 0) * Number(item.price ?? 0) * Number(item.taxPct ?? 0)) / 100, 0)
    : (calcTotal(subtotal, discount, taxPct) - subtotal + Number(discount ?? 0))
  const total = subtotal - Number(discount ?? 0) + taxTotal
  const advance = saleData.advance ?? 0
  const due = Math.max(0, total - advance)
  const sale = {
    id: nextId('SAL'),
    number: nextNumber('ORD'),
    type: saleData.type ?? 'Invoice',
    documentNumber: saleData.reference ?? '',
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
    paymentMode: saleData.paymentMode ?? saleData.paymentType ?? 'N/A',
    buyerType: saleData.buyerType ?? (saleData.orderType === 'Dealer' ? 'Dealer' : 'Customer'),
    saleType: saleData.saleType ?? saleData.orderType ?? 'Retail',
    invoiceType: saleData.invoiceType ?? '',
    vehicleNumber: saleData.vehicleNumber ?? '',
    driverNumber: saleData.driverNumber ?? '',
    orderType: saleData.orderType ?? '',
    detailStatus: saleData.detailStatus ?? 'Completed',
    status: status ?? 'APPROVED',
    notes: saleData.notes ?? '',
    firmId: getActiveFirmId() ?? saleData.firmId ?? DEFAULT_FIRM_ID,
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
  const collection = sale.type === 'Challan' ? mockChallans : mockSales
  const index = collection.findIndex((entry) => entry.id === saleId && inActiveFirm(entry))
  if (index === -1) return null
  const updated = { ...collection[index], ...saleData, firmId: collection[index].firmId }
  collection[index] = updated
  return { ...updated }
}

export function cancelSale(saleId) {
  return updateSale(saleId, { status: 'Cancelled', due: 0, paid: 0 })
}

export function deleteSale(saleId) {
  const index = mockSales.findIndex((sale) => sale.id === saleId && inActiveFirm(sale))
  if (index === -1) return false
  mockSales.splice(index, 1)
  return true
}

export function recordPaymentIn(saleId, amount, mode, accountId, notes = '', options = {}) {
  const sale = getSaleById(saleId)
  if (!sale) throw new Error('Sale not found in the selected firm')

  const numericAmount = Number(amount)
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw new Error('Payment amount must be greater than zero')
  }
  if (numericAmount > (sale.due ?? 0)) {
    throw new Error('Payment exceeds the invoice balance')
  }

  const accountRecord = accountId
    ? mockAccounts.find((entry) =>
      entry.id === accountId &&
      entry.firmId === sale.firmId &&
      inActiveFirm(entry),
    )
    : null
  if (!accountRecord) throw new Error('Account not found in the selected firm')

  const payment = {
    id: nextId('PAY'),
    invoiceId: sale.id,
    customerId: sale.customerId,
    date: options.date ?? new Date().toISOString(),
    amount: numericAmount,
    mode,
    accountId: accountRecord.id,
    status: 'Paid',
    notes,
    firmId: sale.firmId,
  }
  mockPayments.push(payment)

  sale.paid = Math.round((sale.paid + numericAmount) * 100) / 100
  sale.due = Math.max(0, Math.round((sale.due - numericAmount) * 100) / 100)
  sale.status = sale.due === 0 ? 'Paid' : 'Partially Paid'

  accountRecord.balance = Math.round((accountRecord.balance + numericAmount) * 100) / 100

  if (sale.customerId) {
    updateCustomerBalance(sale.customerId, -numericAmount)
  }

  mockTransactions.push({
    id: nextId('txn'),
    type: 'payment-in',
    date: payment.date,
    amount: numericAmount,
    balance: sale.due,
    description: `Payment received: ${sale.number}`,
    accountId: accountRecord.id,
    customerId: sale.customerId,
    productId: sale.items[0]?.productId,
    firmId: sale.firmId,
  })

  return { ...payment, sale: { id: sale.id, paid: sale.paid, due: sale.due, status: sale.status } }
}

export function getPayments(filters = {}) {
  const { saleId, customerId, mode } = filters
  return mockPayments
    .filter((payment) => {
      if (!inActiveFirm(payment)) return false
      if (saleId && payment.invoiceId !== saleId) return false
      if (customerId && customerId !== 'all' && payment.customerId !== customerId) return false
      if (mode && payment.mode !== mode) return false
      return true
    })
    .map((payment) => ({ ...payment }))
}
