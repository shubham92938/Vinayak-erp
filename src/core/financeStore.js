/**
 * Finance compatibility facade.
 *
 * Finance screens historically imported several collections from this module.
 * The record stores now live in their own modules; this facade keeps the old
 * imports working while routing purchases, orders, sales orders and payments
 * through those canonical stores.
 */
import {
  mockAccounts,
  mockExpenses,
  mockTransactions,
  getAccounts,
  calcTotal,
  nextId,
  nextNumber,
} from './store'
import {
  mockSales,
  mockPayments as centralPayments,
  getSales,
  getPayments as getSalesPayments,
  recordPaymentIn,
} from './salesStore'
import {
  mockPurchases as centralPurchases,
  getPurchases as getCentralPurchases,
  getPurchaseById as getCentralPurchaseById,
  createPurchase as createCentralPurchase,
  updatePurchase as updateCentralPurchase,
  deletePurchase as deleteCentralPurchase,
  recordPurchasePayment as recordCentralPurchasePayment,
  confirmPurchase as confirmCentralPurchase,
} from './purchaseStore'
import {
  mockPurchaseOrders as centralPurchaseOrders,
  getPurchaseOrders as getCentralPurchaseOrders,
  getPurchaseOrderById as getCentralPurchaseOrderById,
  createPurchaseOrder as createCentralPurchaseOrder,
  updatePurchaseOrder as updateCentralPurchaseOrder,
  confirmPurchaseOrder as confirmCentralPurchaseOrder,
  orderStock as orderCentralStock,
} from './purchaseOrderStore'
import {
  mockSalesOrders as centralSalesOrders,
  getSalesOrders as getCentralSalesOrders,
  getSalesOrderById as getCentralSalesOrderById,
  createSalesOrder,
  updateSalesOrder,
  confirmSalesOrder,
  fulfillSalesOrder,
  cancelSalesOrder,
  SALES_ORDER_STATUSES,
} from './salesOrdersStore'
import { getProducts } from '../features/products/services/productService'
import { DEFAULT_FIRM_ID } from '../config/firms'
import { getActiveFirmId } from './firmContextStore'

export { formatMoney, formatDate } from './numbers'
export { mockAccounts, mockExpenses, getAccounts }

// Compatibility exports now point at the canonical stores rather than a
// second, independently mutable finance collection.
export {
  centralPurchases as mockPurchases,
  getCentralPurchases as getPurchases,
  getCentralPurchaseById as getPurchaseById,
  createCentralPurchase as createPurchase,
  updateCentralPurchase as updatePurchase,
  deleteCentralPurchase as deletePurchase,
  recordCentralPurchasePayment as recordPurchasePayment,
  confirmCentralPurchase as confirmPurchase,
  centralPurchaseOrders as mockPurchaseOrders,
  getCentralPurchaseOrders as getPurchaseOrders,
  getCentralPurchaseOrderById as getPurchaseOrderById,
  createCentralPurchaseOrder as createPurchaseOrder,
  updateCentralPurchaseOrder as updatePurchaseOrder,
  confirmCentralPurchaseOrder as confirmPurchaseOrder,
  orderCentralStock as receivePurchaseOrderStock,
  centralSalesOrders as mockSalesOrders,
  getCentralSalesOrders as getSalesOrders,
  getCentralSalesOrderById as getSalesOrderById,
  createSalesOrder,
  updateSalesOrder,
  confirmSalesOrder,
  fulfillSalesOrder,
  cancelSalesOrder,
  SALES_ORDER_STATUSES,
  centralPayments as mockPaymentsIn,
}

function inferFirmId(record) {
  return record.firmId
    ?? getProducts().find((product) => product.id === record.items?.[0]?.productId)?.firmId
    ?? DEFAULT_FIRM_ID
}

function inActiveFirm(record) {
  const activeFirmId = getActiveFirmId()
  return !activeFirmId || record?.firmId === activeFirmId
}

/* --------------------------------------------------------------------------
   Quotations
   -------------------------------------------------------------------------- */

export const mockQuotations = [
  { id: 'Q-20261101', number: 'QUOT-20261101', customerId: 'CUST-001', customerName: 'Globe Cart Papers & Stationery', date: '2026-10-28T09:15:00', expiryDate: '2026-11-08', items: [{ productId: 'prod-01', name: 'Apple iPhone 15 Pro Max', qty: 8, unit: 'pcs', price: 37990, taxPct: 18, discount: 0 }], discount: 0, subtotal: 303920, taxTotal: 54705, total: 358625, status: 'Sent' },
  { id: 'Q-20261102', number: 'QUOT-20261102', customerId: 'CUST-003', customerName: 'Reliance Retail', date: '2026-10-30T14:00:00', expiryDate: '2026-11-15', items: [{ productId: 'prod-03', name: 'OnePlus 12', qty: 3, unit: 'pcs', price: 199900, taxPct: 18, discount: 0 }], discount: 0, subtotal: 599700, taxTotal: 107946, total: 707646, status: 'Accepted' },
  { id: 'Q-20261103', number: 'QUOT-20261103', customerId: 'CUST-002', customerName: 'H&M Cotton T-Shirt Group', date: '2026-11-02T16:00:00', expiryDate: '2026-11-25', items: [{ productId: 'prod-07', name: 'Nike Dri-FIT T-Shirt', qty: 25, unit: 'pcs', price: 810, taxPct: 18, discount: 300 }], discount: 300, subtotal: 20250, taxTotal: 3400.5, total: 23541, status: 'Draft' },
]

mockQuotations.forEach((quote) => {
  quote.firmId = inferFirmId(quote)
})

export function getQuotations() {
  return mockQuotations
    .filter(inActiveFirm)
    .map((quote) => ({ ...quote }))
}

export function getQuotationById(id) {
  const quote = mockQuotations.find((entry) => entry.id === id && inActiveFirm(entry))
  return quote ? { ...quote } : null
}

export function createQuotation(quoteData) {
  if (!quoteData.items?.length) throw new Error('Quotation requires at least one product')

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
    firmId: getActiveFirmId() ?? quoteData.firmId ?? DEFAULT_FIRM_ID,
  }
  quote.taxTotal = calcTotal(quote.subtotal, quote.discount, 18) - quote.subtotal + quote.discount
  quote.total = calcTotal(quote.subtotal, quote.discount, 18)
  mockQuotations.push(quote)
  return { ...quote }
}

export function updateQuotation(id, quoteData) {
  const quote = mockQuotations.find((entry) => entry.id === id && inActiveFirm(entry))
  if (!quote) return null
  const index = mockQuotations.findIndex((entry) => entry.id === id && inActiveFirm(entry))
  const updated = { ...mockQuotations[index], ...quoteData, firmId: mockQuotations[index].firmId }
  mockQuotations[index] = updated
  return { ...updated }
}

export function markQuotationAccepted(id) {
  return updateQuotation(id, { status: 'Accepted' })
}

export function convertQuotationToSaleOrder(id) {
  const quote = getQuotationById(id)
  if (!quote) throw new Error('Quotation not found')
  if (quote.status !== 'Accepted') throw new Error('Only accepted quotations can be converted')

  const order = createSalesOrder({
    customerId: quote.customerId,
    customerName: quote.customerName,
    expectedDelivery: quote.expiryDate,
    items: quote.items,
    firmId: quote.firmId,
  })
  const index = mockQuotations.findIndex((entry) => entry.id === id && inActiveFirm(entry))
  if (index !== -1) mockQuotations[index] = { ...mockQuotations[index], status: 'Converted' }
  return order
}

/* --------------------------------------------------------------------------
   Payment In
   -------------------------------------------------------------------------- */

function paymentInFirm(payment) {
  return payment.firmId
    ?? mockSales.find((sale) => sale.id === payment.invoiceId || sale.number === payment.invoiceId)?.firmId
    ?? DEFAULT_FIRM_ID
}

export function getPaymentsIn(filters = {}) {
  return getSalesPayments().filter((payment) => {
    const scopedPayment = { ...payment, firmId: paymentInFirm(payment) }
    if (!inActiveFirm(scopedPayment)) return false
    if (filters.customerId && payment.customerId !== filters.customerId) return false
    if (filters.mode && payment.mode !== filters.mode) return false
    if (filters.status && payment.status !== filters.status) return false
    return true
  }).map((payment) => ({ ...payment, firmId: paymentInFirm(payment) }))
}

export function recordPaymentInFinance(data) {
  const amount = Number(data.amount)
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Payment amount must be greater than zero')

  const sale = getSales().find((entry) =>
    (entry.number === data.invoiceId || entry.id === data.invoiceId) &&
    (!data.customerId || entry.customerId === data.customerId),
  )
  if (!sale) throw new Error('Invoice not found in the selected firm')
  if (amount > (sale.due ?? 0)) throw new Error('Payment exceeds the invoice balance')

  const account = data.accountId
    ? mockAccounts.find((entry) => entry.id === data.accountId && inActiveFirm(entry))
    : null
  if (!account) throw new Error('Account not found in the selected firm')

  return recordPaymentIn(
    sale.id,
    amount,
    data.mode,
    account.id,
    data.notes ?? '',
    { date: data.date },
  )
}

/* --------------------------------------------------------------------------
   Payment Out
   -------------------------------------------------------------------------- */

export const mockPaymentsOut = [
  { id: 'PAYO-01', vendorName: 'Nemotron Traders', purchaseId: 'PO-20261023', date: '2026-10-30T12:00:00', amount: 500000, mode: 'Bank Transfer', accountId: 'acc-bank-1', status: 'Paid', notes: 'Initial payment on PO-20261023' },
]

mockPaymentsOut.forEach((payment) => {
  payment.firmId = centralPurchases.find((purchase) =>
    purchase.id === payment.purchaseId || purchase.number === payment.purchaseId,
  )?.firmId ?? DEFAULT_FIRM_ID
})

export function getPaymentsOut(filters = {}) {
  return mockPaymentsOut.filter((payment) => {
    if (!inActiveFirm(payment)) return false
    if (filters.vendorName && payment.vendorName !== filters.vendorName) return false
    if (filters.mode && payment.mode !== filters.mode) return false
    return true
  }).map((payment) => ({ ...payment }))
}

export function recordPaymentOutFinance(data) {
  const amount = Number(data.amount)
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Payment amount must be greater than zero')

  const purchase = data.purchaseId
    ? getCentralPurchaseById(data.purchaseId)
    : null
  if (data.purchaseId && !purchase) throw new Error('Purchase not found in the selected firm')
  if (purchase && amount > (purchase.due ?? 0)) throw new Error('Payment exceeds the purchase balance')

  const account = data.accountId
    ? mockAccounts.find((entry) => entry.id === data.accountId && inActiveFirm(entry))
    : null
  if (!account) throw new Error('Account not found in the selected firm')

  const updatedPurchase = purchase
    ? recordCentralPurchasePayment(purchase.number ?? purchase.id, amount, data.mode, data.notes ?? '')
    : null
  const payment = {
    id: nextId('PAYO'),
    date: data.date ?? new Date().toISOString(),
    status: 'Paid',
    mode: data.mode,
    accountId: account.id,
    notes: data.notes ?? '',
    ...data,
    purchaseId: updatedPurchase?.number ?? data.purchaseId ?? null,
    vendorName: data.vendorName ?? updatedPurchase?.vendorName ?? 'Vendor',
    firmId: getActiveFirmId() ?? updatedPurchase?.firmId ?? data.firmId ?? DEFAULT_FIRM_ID,
  }

  account.balance = Math.round((account.balance - amount) * 100) / 100
  mockPaymentsOut.push(payment)
  mockTransactions.push({
    id: nextId('txn'),
    type: 'payment-out',
    date: payment.date,
    amount: -amount,
    balance: updatedPurchase?.due ?? 0,
    description: `Payment out: ${payment.purchaseId ?? payment.expenseId ?? payment.vendorName}`,
    accountId: account.id,
    customerId: null,
    productId: null,
    firmId: payment.firmId,
  })

  return { ...payment, purchase: updatedPurchase }
}

/* --------------------------------------------------------------------------
   Fund Transfers
   -------------------------------------------------------------------------- */

export function recordFundTransfer(transfer) {
  const activeFirmId = getActiveFirmId()
  const amount = Number(transfer.amount)
  const from = mockAccounts.find((entry) =>
    entry.id === transfer.fromAccountId && (!activeFirmId || entry.firmId === activeFirmId),
  )
  const to = mockAccounts.find((entry) =>
    entry.id === transfer.toAccountId && (!activeFirmId || entry.firmId === activeFirmId),
  )

  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Transfer amount must be greater than zero')
  if (!from || !to) throw new Error('Account not found in the selected firm')
  if (from.firmId !== to.firmId) throw new Error('Transfer accounts must belong to the same firm')
  if (transfer.fromAccountId === transfer.toAccountId) throw new Error('Transfer must be between different accounts')
  if (from.balance < amount) throw new Error('Insufficient funds')

  from.balance = Math.round((from.balance - amount) * 100) / 100
  to.balance = Math.round((to.balance + amount) * 100) / 100

  mockTransactions.push({
    id: nextId('txn'),
    type: 'transfer',
    date: new Date().toISOString(),
    amount,
    balance: 0,
    description: `Fund transfer: ${from.id} → ${to.id}${transfer.notes ? ` (${transfer.notes})` : ''}`,
    accountId: from.id,
    customerId: null,
    productId: null,
    firmId: activeFirmId ?? from.firmId ?? DEFAULT_FIRM_ID,
  })

  return { fromId: from.id, toId: to.id, amount }
}
