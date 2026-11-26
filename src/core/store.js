/**
 * Central mock data layer for the ERP frontend.
 *
 * All interconnected records live here so changes flow across modules:
 * products, customers, sales, invoices, stock movements, transactions, etc.
 * Feature modules read from and mutate this store through their services.
 */
import { DEFAULT_FIRM_ID } from '../config/firms'
import { getActiveFirmId } from './firmContextStore'
import { getProducts } from '../features/products/services/productService'
import { nextId, roundMoney } from './numbers'
import { formatMoney as formatMoneyBase, formatDate as formatDateBase } from './numbers'

export { nextId, nextNumber, calcTax, calcTotal, decimalAdd, decimalSub } from './numbers'

export const formatMoney = formatMoneyBase
export const formatDate = formatDateBase

/* --------------------------------------------------------------------------
   Central store
   -------------------------------------------------------------------------- */

export const mockAccounts = [
  { id: 'acc-cash-1', name: 'Cash in Hand', type: 'Cash', balance: 120000 },
  { id: 'acc-bank-1', name: 'Vinayak Associates Current Account', type: 'Bank', balance: 850000 },
  { id: 'acc-bank-2', name: 'Vinayak Associates Savings Account', type: 'Bank', balance: 210000 },
  { id: 'acc-bank-3', name: 'Vinayak Traders Account', type: 'Bank', balance: 45000 },
  { id: 'acc-bank-4', name: 'Vinayak Logistics Account', type: 'Bank', balance: 175000 },
]

mockAccounts.forEach((account) => {
  account.firmId = account.id === 'acc-bank-3'
    ? 'vinayak-traders'
    : account.id === 'acc-bank-4'
      ? 'vinayak-logistics'
      : DEFAULT_FIRM_ID
})

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

export const mockTransactions = [
  { id: 'txn-01', type: 'sale', date: '2026-11-01T09:30:00', amount: 268852, balance: 0, description: 'Sale: INV-20261045 (Cash)', accountId: 'acc-cash-1', customerId: 'CUST-001', productId: 'prod-01' },
  { id: 'txn-02', type: 'sale', date: '2026-11-03T14:10:00', amount: 1238646, balance: 1238646, description: 'Sale: INV-20261052 (Bank)', accountId: 'acc-bank-1', customerId: 'CUST-005', productId: 'prod-02' },
  { id: 'txn-03', type: 'purchase', date: '2026-10-28T16:05:00', amount: 589410, balance: 18000, description: 'Purchase: PO-20261027 (HardwarePlus)', accountId: 'acc-bank-3', customerId: null, productId: 'prod-04' },
  { id: 'txn-04', type: 'expense', date: '2026-11-02T08:45:00', amount: 4800, balance: 0, description: 'Office Rent (November)', accountId: 'acc-cash-1', customerId: null, productId: null },
  { id: 'txn-05', type: 'sale', date: '2026-11-05T11:20:00', amount: 38232, balance: 0, description: 'Sale: INV-20261061 (Bank)', accountId: 'acc-bank-2', customerId: 'CUST-002', productId: 'prod-07' },
  { id: 'txn-06', type: 'purchase', date: '2026-10-26T10:10:00', amount: 1002410, balance: 0, description: 'Purchase: PO-20261023 (Nemotron Traders)', accountId: 'acc-bank-3', customerId: null, productId: 'prod-03' },
  { id: 'txn-07', type: 'expense', date: '2026-11-01T12:05:00', amount: 3750, balance: 0, description: 'Rent (Vinayak Associates office)', accountId: 'acc-bank-1', customerId: null, productId: null },
  { id: 'txn-08', type: 'sale', date: '2026-11-04T15:55:00', amount: 44828, balance: 42828, description: 'Sale: INV-20261057 (Bank, outstanding)', accountId: 'acc-bank-2', customerId: 'CUST-009', productId: 'prod-01' },
]

mockTransactions.forEach((transaction) => {
  if (!transaction.firmId) {
    transaction.firmId = getProducts().find((product) => product.id === transaction.productId)?.firmId ?? DEFAULT_FIRM_ID
  }
})

export const mockExpenses = [
  { id: 'exp-01', date: '2026-11-02T08:45:00', type: 'Rent', category: 'Operating Expenses', description: 'Office Rent (November)', amount: 4800, mode: 'Cash', status: 'Paid', firmId: 'vinayak-associates' },
  { id: 'exp-02', date: '2026-10-29T07:30:00', type: 'Travel', category: 'Sales & Marketing', description: 'Client visit - Pune', amount: 9200, mode: 'UPI', status: 'Paid', firmId: 'vinayak-associates' },
  { id: 'exp-03', date: '2026-11-03T16:20:00', type: 'Internet', category: 'Operating Expenses', description: 'Broadband (Month of November)', amount: 2250, mode: 'Bank Transfer', status: 'Paid', firmId: 'vinayak-associates' },
  { id: 'exp-04', date: '2026-10-31T11:45:00', type: 'Telephone', category: 'Operating Expenses', description: 'Landline charges', amount: 5100, mode: 'Cash', status: 'Paid', firmId: 'vinayak-associates' },
  { id: 'exp-05', date: '2026-11-01T13:10:00', type: 'Repairs', category: 'Maintenance', description: 'Shop maintenance', amount: 1200, mode: 'Cash', status: 'Paid', firmId: 'vinayak-associates' },
]

export const mockNotifications = [
  { id: 'notif-01', type: 'low-stock', title: 'Low stock: 6 units of Samsung Galaxy S24 Ultra', body: 'Available: 3, Minimum: 2', read: false, createdAt: '2026-11-20T08:00:00' },
  { id: 'notif-02', type: 'new-sale', title: 'New sale: INV-20261061 ₹9600.00', body: 'Customer: H&M Cotton T-Shirt - Vinayak Associates', read: true, createdAt: '2026-11-05T11:20:00' },
  { id: 'notif-03', type: 'purchase-order', title: 'New purchase order: PO-20261027 - Apple iPhone 15 Pro Max', body: 'Vendor: HardwarePlus - due in 5 days', read: false, createdAt: '2026-10-28T16:10:00' },
  { id: 'notif-04', type: 'payment-due', title: 'Payment due: INV-20261052 ₹2900.00', body: 'Customer: Vinayak Associates - due by 10th Nov', read: false, createdAt: '2026-11-03T14:30:00' },
  { id: 'notif-05', type: 'system', title: 'Backup completed', body: 'System backup has been uploaded to the cloud.', read: true, createdAt: '2026-11-22T03:00:00' },
  { id: 'notif-06', type: 'expense-recorded', title: 'Expense: Office Rent ₹4800.00', body: 'Paid in Cash - November 2026', read: false, createdAt: '2026-11-02T08:45:00' },
  { id: 'notif-07', type: 'payment-received', title: 'Payment received: ₹3205.00', body: 'INV-20261057 - Globe Cart Papers & Stationery', read: true, createdAt: '2026-11-04T16:00:00' },
]

mockNotifications.forEach((notification) => { notification.firmId = notification.firmId ?? DEFAULT_FIRM_ID })

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

export const mockStockMovements = [
  { id: 'stm-01', type: 'stock-in', productId: 'prod-01', qty: 10, unit: 'pcs', reference: 'PO-20261048', previousStock: 2, newStock: 12, reason: 'Stock in from supplier', date: '2026-10-15T10:00:00', demo: false },
  { id: 'stm-02', type: 'stock-out', productId: 'prod-01', qty: 6, unit: 'pcs', reference: 'INV-20261045', previousStock: 12, newStock: 6, reason: 'Sold', date: '2026-11-01T09:30:00', demo: false },
  { id: 'stm-03', type: 'stock-out', productId: 'prod-02', qty: 3, unit: 'pcs', reference: 'INV-20261061', previousStock: 3, newStock: 0, reason: 'Sold', date: '2026-11-03T14:10:00', demo: false },
  { id: 'stm-04', type: 'stock-in', productId: 'prod-03', qty: 8, unit: 'pcs', reference: 'PO-20261027', previousStock: 2, newStock: 10, reason: 'Stock in from supplier', date: '2026-10-28T16:00:00', demo: false },
  { id: 'stm-05', type: 'adjustment', productId: 'prod-04', qty: 2, unit: 'pcs', reference: 'INV-20261061', previousStock: 2, newStock: 4, reason: 'Recount adjustment', date: '2026-11-05T11:20:00', demo: false },
  { id: 'stm-06', type: 'stock-in', productId: 'prod-07', qty: 40, unit: 'pcs', reference: 'PO-20261060', previousStock: 10, newStock: 50, reason: 'Stock in from supplier', date: '2026-11-02T09:15:00', demo: false },
  { id: 'stm-07', type: 'stock-out', productId: 'prod-07', qty: 40, unit: 'pcs', reference: 'INV-20261061', previousStock: 50, newStock: 10, reason: 'Sold', date: '2026-11-05T11:20:00', demo: false },
  { id: 'stm-08', type: 'adjustment', productId: 'prod-13', qty: 6, unit: 'pcs', reference: 'ADJ-20261101', previousStock: 26, newStock: 20, reason: 'Spoilage / qc rejection', date: '2026-11-01T11:30:00', demo: false },
  { id: 'stm-09', type: 'stock-out', productId: 'prod-19', qty: 2, unit: 'pcs', reference: 'INV-20261057', previousStock: 22, newStock: 20, reason: 'Sold', date: '2026-11-04T15:55:00', demo: false },
  { id: 'stm-10', type: 'stock-in', productId: 'prod-28', qty: 2, unit: 'pcs', reference: 'PO-20261055', previousStock: 1, newStock: 3, reason: 'Stock in from supplier', date: '2026-10-31T14:45:00', demo: false },
]

mockStockMovements.forEach((movement) => {
  movement.firmId = movement.firmId ?? getProducts().find((product) => product.id === movement.productId)?.firmId ?? DEFAULT_FIRM_ID
})

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

export const mockCustomers = [
  { id: 'CUST-001', code: 'VAA-01', name: 'Globe Cart Papers & Stationery', type: 'Regular Customer', contactPerson: 'Priya Desai', phone: '+91-20-5555-1001', email: 'priya.desai@globecart.in', alternatePhone: '', address: '104, Centrally Located Building', city: 'Mumbai', state: 'Maharashtra', pinCode: '400002', gst: '27AABCC1443L1', pan: 'ABCTZ0C87', creditLimit: 100000, openingBalance: 25000, paymentTerms: '30 Days', status: 'Active', firmId: 'vinayak-associates', customerType: 'REGULAR' },
  { id: 'CUST-002', code: 'VAA-02', name: 'H&M Cotton T-Shirt Group', type: 'Regular Customer', contactPerson: 'Amit Patel', phone: '+91-22-5555-1002', email: 'amit.patel@hscotter.com', alternatePhone: '', address: '121, Shri Krishna Building', city: 'Bengaluru', state: 'Karnataka', pinCode: '560001', gst: '29AACCH0026L1', pan: 'MTCFH4529', creditLimit: 50000, openingBalance: 3000, paymentTerms: '30 Days', status: 'Active', firmId: 'vinayak-associates', customerType: 'REGULAR' },
  { id: 'CUST-003', code: 'VAA-03', name: 'Reliance Retail', type: 'Regular Customer', contactPerson: 'Neha Sharma', phone: '+91-20-5555-1003', email: '', alternatePhone: '+91-20-5555-7003', address: '3, Lower Parel, Unit No 4', city: 'Mumbai', state: 'Maharashtra', pinCode: '400012', gst: '27AADCP8897X1', pan: 'NSCPR9411', creditLimit: 250000, openingBalance: 120000, paymentTerms: '45 Days', status: 'Active', firmId: 'vinayak-associates', customerType: 'REGULAR' },
  { id: 'CUST-004', code: 'VTR-01', name: 'Bulk Way Traders', type: 'Dealer', contactPerson: 'Riya Nair', phone: '+91-253-555-1001', email: 'sales@bulkway.in', alternatePhone: '', address: 'Plot No 5, Industrial Estate', city: 'Nagpur', state: 'Maharashtra', pinCode: '440001', gst: '27AACFB2667K1', pan: 'BWWPSC4287', creditLimit: 50000, openingBalance: 0, paymentTerms: '15 Days', status: 'Active', firmId: 'vinayak-traders', customerType: 'DEALER' },
  { id: 'CUST-005', code: 'VTR-02', name: 'HardwarePlus', type: 'Dealer', contactPerson: 'Vikas Joshi', phone: '+91-22-5555-1004', email: 'procurement@hardwareplus.com', alternatePhone: '+91-22-5555-7004', address: '17/A, Second Floor', city: 'Pune', state: 'Maharashtra', pinCode: '411005', gst: '27AAACR7766G1', pan: 'HPJPV4590', creditLimit: 100000, openingBalance: 8000, paymentTerms: '30 Days', status: 'Active', firmId: 'vinayak-traders', customerType: 'DEALER' },
  { id: 'CUST-006', code: 'VTR-03', name: 'Metro Stationers', type: 'Regular Customer', contactPerson: 'Fahad carn poles', phone: '+91-253-555-1002', email: 'fahad@metrostationers.in', alternatePhone: '', address: 'Near Railway Station, Opposite Post Office', city: 'Kolhapur', state: 'Maharashtra', pinCode: '416001', gst: '27AAACG5673G1', pan: 'MTSFC8332', creditLimit: 25000, openingBalance: 0, paymentTerms: '30 Days', status: 'Active', firmId: 'vinayak-traders', customerType: 'REGULAR' },
  { id: 'CUST-007', code: 'VLL-01', name: 'Surgical Safety Supplies', type: 'Dealer', contactPerson: 'Meera desert', phone: '+91-712-555-1005', email: 'rnd@surgicalshield.org', alternatePhone: '', address: 'Research Wing, 2nd Floor', city: 'Indore', state: 'Madhya Pradesh', pinCode: '452001', gst: '16AAACG3185R1', pan: 'SCSHM6810', creditLimit: 250000, openingBalance: 4500, paymentTerms: '15 Days', status: 'Active', firmId: 'vinayak-logistics', customerType: 'DEALER' },
  { id: 'CUST-008', code: 'VLL-02', name: 'PrintCare corporation', type: 'Dealer', contactPerson: 'Arjun Patel', phone: '+91-261-555-1006', email: 'arjun@printcare.net', alternatePhone: '', address: 'Technical Estate, Plot 4', city: 'Indore', state: 'Madhya Pradesh', pinCode: '452002', gst: '16AAACP1654Q1', pan: 'PCLAR8955', creditLimit: 75000, openingBalance: 0, paymentTerms: '30 Days', status: 'Active', firmId: 'vinayak-logistics', customerType: 'DEALER' },
  { id: 'CUST-009', code: 'VLL-03', name: 'Commercial Automata Pvt Ltd', type: 'Dealer', contactPerson: 'Nirav Desai', phone: '+91-261-555-1007', email: 'sales@commercialautomata.com', alternatePhone: '', address: 'Near Commercial Street, Ground Floor', city: 'Indore', state: 'Madhya Pradesh', pinCode: '452001', gst: '16AACPN3391A1', pan: 'CAAPK8146', creditLimit: 100000, openingBalance: 13205, paymentTerms: '45 Days', status: 'Active', firmId: 'vinayak-logistics', customerType: 'DEALER' },
]

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
