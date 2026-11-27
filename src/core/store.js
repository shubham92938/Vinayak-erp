/**
 * Central mock data layer for the ERP frontend.
 *
 * All interconnected records live here so changes flow across modules:
 * products, customers, sales, invoices, stock movements, transactions, etc.
 * Feature modules read from and mutate this store through their services.
 */
import { DEFAULT_FIRM_ID } from '../config/firms'
import { getActiveFirmId } from './firmContextStore'
import { nextId, roundMoney } from './numbers'
import { formatMoney as formatMoneyBase, formatDate as formatDateBase } from './numbers'
import { isStabilityModeEnabled } from './stabilityMode'
import {
  STABILITY_ACCOUNTS,
  STABILITY_CUSTOMERS,
  STABILITY_EXPENSES,
  STABILITY_NOTIFICATIONS,
  STABILITY_STOCK_MOVEMENTS,
  STABILITY_TRANSACTIONS,
} from './stabilityData'
import {
  DEMO_ACCOUNTS,
  DEMO_CUSTOMERS,
  DEMO_EXPENSES,
  DEMO_NOTIFICATIONS,
  DEMO_STOCK_MOVEMENTS,
  DEMO_TRANSACTIONS,
} from './demoData'

const STABILITY_MODE = isStabilityModeEnabled()

export { nextId, nextNumber, calcTax, calcTotal, decimalAdd, decimalSub } from './numbers'

export const formatMoney = formatMoneyBase
export const formatDate = formatDateBase

/* --------------------------------------------------------------------------
   Central store
   -------------------------------------------------------------------------- */

// The default local workspace includes synthetic account masters for each
// demo firm. Stability mode swaps in its focused one-firm fixture.
export const mockAccounts = (STABILITY_MODE ? STABILITY_ACCOUNTS : DEMO_ACCOUNTS).map((account) => ({ ...account }))

export function getAccounts() {
  const activeFirmId = getActiveFirmId()
  return activeFirmId ? mockAccounts.filter((account) => account.firmId === activeFirmId) : mockAccounts
}

export const mockFinancialSettings = {
  currency: 'INR',
  currencySymbol: '₹',
  dateFormat: 'dd/MM/yyyy',
  timeZone: 'Asia/Kolkata',
  financialYear: '1 April 2025 – 31 March 2026',
  taxRates: { gst: 18, igst: 18, cgst: 9, sgst: 9, serviceTax: 15, tds: 1 },
  paymentModes: [
    { id: 'mode-cash', name: 'Cash' },
    { id: 'mode-bank', name: 'Bank Transfer' },
    { id: 'mode-upi', name: 'UPI / Digital Wallet' },
    { id: 'mode-cheque', name: 'Cheque' },
    { id: 'mode-dd', name: 'Demand Draft' },
  ],
  numberFormats: {
    invoice: 'INV/{MM}{YY}/{NNNN}',
    challan: 'CHAL/{MM}{YY}/{NNNN}',
    quotation: 'QUOT/{MM}{YY}/{NNNN}',
    purchaseOrder: 'PO/{MM}{YY}/{NNNN}',
  },
}

// Transactions, expenses and notifications start populated so every local
// firm has a useful finance trail before the first user action.
export const mockTransactions = (STABILITY_MODE ? STABILITY_TRANSACTIONS : DEMO_TRANSACTIONS).map((transaction) => ({ ...transaction }))

export const mockExpenses = (STABILITY_MODE ? STABILITY_EXPENSES : DEMO_EXPENSES).map((expense) => ({ ...expense }))

export const mockNotifications = (STABILITY_MODE ? STABILITY_NOTIFICATIONS : DEMO_NOTIFICATIONS).map((notification) => ({ ...notification }))

export function getTransactions() {
  const activeFirmId = getActiveFirmId()
  return activeFirmId
    ? mockTransactions.filter((transaction) => (transaction.firmId ?? DEFAULT_FIRM_ID) === activeFirmId)
    : mockTransactions
}

export function getNotifications() {
  const activeFirmId = getActiveFirmId()
  return activeFirmId
    ? mockNotifications.filter((notification) => notification.firmId === activeFirmId)
    : mockNotifications
}

export function getUnreadNotificationCount() {
  return getNotifications().filter((item) => !item.read).length
}

export function markNotificationRead(notificationId) {
  const item = getNotifications().find((entry) => entry.id === notificationId)
  if (item) item.read = true
}

export function markAllNotificationsRead() {
  getNotifications().forEach((item) => (item.read = true))
}

export function deleteNotification(notificationId) {
  const item = getNotifications().find((entry) => entry.id === notificationId)
  if (!item) return
  const index = mockNotifications.findIndex((entry) => entry.id === item.id)
  if (index !== -1) mockNotifications.splice(index, 1)
}

export function filterNotifications(search, status) {
  const query = String(search ?? '').trim().toLowerCase()
  return getNotifications().filter((item) => {
    if (status && status !== 'all' && item.read !== (status === 'read')) return false
    if (query && !`${item.title} ${item.body}`.toLowerCase().includes(query)) return false
    return true
  })
}

// Stock history is seeded per firm and remains mutable as inventory actions
// are recorded.
export const mockStockMovements = (STABILITY_MODE ? STABILITY_STOCK_MOVEMENTS : DEMO_STOCK_MOVEMENTS).map((movement) => ({ ...movement }))

export function getStockMovements(productId) {
  const activeFirmId = getActiveFirmId()
  return mockStockMovements.filter((entry) =>
    (productId ? entry.productId === productId : true) &&
    (!activeFirmId || entry.firmId === activeFirmId),
  )
}

export function recordStockMovement(entry) {
  const record = { demo: false, ...entry, firmId: entry.firmId ?? getActiveFirmId() ?? DEFAULT_FIRM_ID, id: nextId('STM') }
  mockStockMovements.push(record)
  return record
}

/* --------------------------------------------------------------------------
   Customers
   -------------------------------------------------------------------------- */

// Customer masters are synthetic local records and are scoped by the active
// firm in the same way as products and transactions.
export const mockCustomers = (STABILITY_MODE ? STABILITY_CUSTOMERS : DEMO_CUSTOMERS).map((customer) => ({ ...customer }))

export function getCustomers(filters = {}) {
  const { query, type, status, firmId } = filters
  const search = String(query ?? '').trim().toLowerCase()

  return mockCustomers.filter((customer) => {
    if (search && !`${customer.name} ${customer.code} ${customer.city} ${customer.email}`.toLowerCase().includes(search)) return false
    if (type && type !== 'all' && customer.customerType !== type) return false
    if (status && status !== 'all' && customer.status !== status) return false
    const activeFirmId = getActiveFirmId()
    // The selected workspace is authoritative in the mock layer. A caller may
    // narrow to that firm, but cannot use a form/query firmId to escape it.
    const requestedFirmId = firmId && firmId !== 'all' ? firmId : null
    const scopedFirmId = activeFirmId ?? requestedFirmId
    if (scopedFirmId && customer.firmId !== scopedFirmId) return false
    return true
  })
}

mockCustomers.forEach((customer, index) => {
  if (!customer.createdAt) {
    customer.createdAt = `2026-08-0${index + 1}T10:00:00`
  }
})

export function getCustomerById(customerId) {
  const activeFirmId = getActiveFirmId()
  return mockCustomers.find((customer) =>
    customer.id === customerId && (!activeFirmId || customer.firmId === activeFirmId),
  ) ?? null
}

export function createCustomer(customerData) {
  const activeFirmId = getActiveFirmId()
  const requestedFirmId = customerData.firmId ?? activeFirmId ?? DEFAULT_FIRM_ID
  const firmId = activeFirmId ?? requestedFirmId
  const customer = { id: `CUST-${String(mockCustomers.length + 1).padStart(3, '0')}`, status: 'Active', customerType: 'Regular Customer', ...customerData, firmId }
  customer.customerType = customer.customerType === 'Dealer' ? 'Dealer' : 'Regular Customer'
  customer.type = customer.customerType === 'Dealer' ? 'Dealer' : 'Regular Customer'
  mockCustomers.push(customer)
  return customer
}

export function saveCustomer(customerId, customerData) {
  const index = mockCustomers.findIndex((customer) => customer.id === customerId && (!getActiveFirmId() || customer.firmId === getActiveFirmId()))
  if (index === -1) return null
  const customer = { ...mockCustomers[index], ...customerData, firmId: mockCustomers[index].firmId }
  mockCustomers[index] = customer
  return customer
}

export function deleteCustomer(customerId) {
  const index = mockCustomers.findIndex((customer) => customer.id === customerId && (!getActiveFirmId() || customer.firmId === getActiveFirmId()))
  if (index === -1) return false
  mockCustomers.splice(index, 1)
  return true
}

export function updateCustomerBalance(customerId, delta) {
  const customer = getCustomerById(customerId)
  if (customer) customer.openingBalance = roundMoney(customer.openingBalance + delta)
}
