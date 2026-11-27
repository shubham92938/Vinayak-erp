import { SVA_FIRM_ID } from '../config/firms'

const DATE = '2026-11-24'

export const STABILITY_CATEGORIES = [
  { id: 'cat-drip', firmId: SVA_FIRM_ID, name: 'DRIP', code: 'DRIP', description: 'Drip irrigation products', status: 'active', createdAt: '2026-01-08T09:00:00Z' },
  { id: 'cat-pvc', firmId: SVA_FIRM_ID, name: 'PVC PIPE & FITTING', code: 'PVC', description: 'PVC pipes and fittings', status: 'active', createdAt: '2026-01-08T09:05:00Z' },
  { id: 'cat-mini', firmId: SVA_FIRM_ID, name: 'MINI', code: 'MINI', description: 'Mini irrigation parts', status: 'active', createdAt: '2026-01-08T09:10:00Z' },
  { id: 'cat-spray', firmId: SVA_FIRM_ID, name: 'SPRAY PIPE', code: 'SPRAY', description: 'Spray pipe products', status: 'active', createdAt: '2026-01-08T09:15:00Z' },
  { id: 'cat-seed', firmId: SVA_FIRM_ID, name: 'POTATO SEED', code: 'SEED', description: 'Seed inventory', status: 'active', createdAt: '2026-01-08T09:20:00Z' },
  { id: 'cat-archive', firmId: SVA_FIRM_ID, name: 'ARCHIVED ITEMS', code: 'ARCH', description: 'Inactive catalogue items', status: 'inactive', createdAt: '2026-01-08T09:25:00Z' },
]

function product({ id, name, code, categoryId, quantity, minStock, unit, buyingPrice, sellingPrice, status = 'active', stockTracking = true, image = null }) {
  return {
    id,
    firmId: SVA_FIRM_ID,
    name,
    code,
    categoryId,
    quantity,
    minStock,
    unit,
    buyingPrice,
    sellingPrice,
    status,
    stockTracking,
    image,
    description: `${name} — stability-test fixture`,
    notes: 'Synthetic stability-test data. Not real business data.',
    createdAt: '2026-06-12T10:00:00Z',
    updatedAt: `${DATE}T09:30:00Z`,
  }
}

export const STABILITY_PRODUCTS = [
  product({ id: 'stability-prod-001', name: 'DRIP LATERAL PIPE 16MM 300 MTR', code: 'SVA-DRIP-016', categoryId: 'cat-drip', quantity: 42, minStock: 10, unit: 'mtr', buyingPrice: 850, sellingPrice: 1100 }),
  product({ id: 'stability-prod-002', name: 'PVC PIPE 63MM HEAVY DUTY', code: 'SVA-PVC-063', categoryId: 'cat-pvc', quantity: 8, minStock: 10, unit: 'pcs', buyingPrice: 320, sellingPrice: 450 }),
  product({ id: 'stability-prod-003', name: 'MINI SPRINKLER 360 DEGREE WITH RISER', code: 'SVA-MINI-003', categoryId: 'cat-mini', quantity: 0, minStock: 8, unit: 'pcs', buyingPrice: 90, sellingPrice: 120 }),
  product({ id: 'stability-prod-004', name: 'SPRAY PIPE 32MM GREEN 750 MTR', code: 'SVA-SPRAY-032', categoryId: 'cat-spray', quantity: 126, minStock: 25, unit: 'mtr', buyingPrice: 210, sellingPrice: 280 }),
  product({ id: 'stability-prod-005', name: 'POTATO SEED — KUFRI JYOTI 50KG', code: 'SVA-SEED-050', categoryId: 'cat-seed', quantity: 3, minStock: 5, unit: 'bags', buyingPrice: 720, sellingPrice: 850 }),
  product({ id: 'stability-prod-006', name: 'AUTOMATE 75MM UNION VALVE PVC', code: 'SVA-PVC-075', categoryId: 'cat-pvc', quantity: 64, minStock: 12, unit: 'pcs', buyingPrice: 145, sellingPrice: 210 }),
  product({ id: 'stability-prod-007', name: 'JAIN 3/4 INCH RISER PIPE EXTRA LONG NAME FOR TABLE WRAPPING', code: 'SVA-MINI-007', categoryId: 'cat-mini', quantity: 27, minStock: 5, unit: 'pcs', buyingPrice: 60, sellingPrice: 95 }),
  product({ id: 'stability-prod-008', name: 'DRIP FILTER 120 MESH', code: 'SVA-DRIP-120', categoryId: 'cat-drip', quantity: 14, minStock: 8, unit: 'pcs', buyingPrice: 480, sellingPrice: 650 }),
  product({ id: 'stability-prod-009', name: 'PVC ELBOW 63MM', code: 'SVA-PVC-ELB', categoryId: 'cat-pvc', quantity: 5, minStock: 10, unit: 'pcs', buyingPrice: 32, sellingPrice: 55 }),
  product({ id: 'stability-prod-010', name: 'OLD 40MM SPRAY PIPE', code: 'SVA-ARCH-040', categoryId: 'cat-archive', quantity: 19, minStock: 4, unit: 'mtr', buyingPrice: 130, sellingPrice: 180, status: 'inactive' }),
  product({ id: 'stability-prod-011', name: 'FARM SERVICE INSTALLATION', code: 'SVA-SERVICE-001', categoryId: 'cat-mini', quantity: 0, minStock: 0, unit: 'service', buyingPrice: 0, sellingPrice: 2500, stockTracking: false }),
  product({ id: 'stability-prod-012', name: 'BULK PVC PIPE 110MM 6MTR', code: 'SVA-PVC-110', categoryId: 'cat-pvc', quantity: 2, minStock: 2, unit: 'lengths', buyingPrice: 2100, sellingPrice: 2800 }),
]

export const STABILITY_CUSTOMERS = [
  { id: 'stability-customer-001', firmId: SVA_FIRM_ID, code: 'CUS-001', name: 'Rajesh Patel', customerType: 'Dealer', type: 'Dealer', contactPerson: 'Rajesh Patel', phone: '9876543210', email: 'rajesh@example.com', city: 'Indore', state: 'Madhya Pradesh', openingBalance: 16450, status: 'Active', createdAt: '2026-08-01T09:00:00Z' },
  { id: 'stability-customer-002', firmId: SVA_FIRM_ID, code: 'CUS-002', name: 'Kannu Agritech', customerType: 'Regular Customer', type: 'Regular Customer', contactPerson: 'Amit Sharma', phone: '9826012345', email: 'accounts@kannu.example', city: 'Ujjain', state: 'Madhya Pradesh', openingBalance: 8200, status: 'Active', createdAt: '2026-08-07T09:00:00Z' },
  { id: 'stability-customer-003', firmId: SVA_FIRM_ID, code: 'CUS-003', name: 'National Machinery', customerType: 'Dealer', type: 'Dealer', contactPerson: 'Neha Verma', phone: '9812345678', email: '', city: 'Bhopal', state: 'Madhya Pradesh', openingBalance: 0, status: 'Active', createdAt: '2026-08-14T09:00:00Z' },
  { id: 'stability-customer-004', firmId: SVA_FIRM_ID, code: 'CUS-004', name: 'Archived Customer Record With A Long Name', customerType: 'Regular Customer', type: 'Regular Customer', contactPerson: '', phone: '', email: '', city: 'Dewas', state: 'Madhya Pradesh', openingBalance: 0, status: 'Inactive', createdAt: '2026-04-14T09:00:00Z' },
]

export const STABILITY_ACCOUNTS = [
  { id: 'stability-account-cash', firmId: SVA_FIRM_ID, name: 'Cash', type: 'cash', balance: 48500, status: 'active' },
  { id: 'stability-account-bank', firmId: SVA_FIRM_ID, name: 'HDFC Current Account', type: 'bank', balance: 212400, status: 'active' },
  { id: 'stability-account-upi', firmId: SVA_FIRM_ID, name: 'UPI Collection', type: 'digital', balance: 18450, status: 'active' },
]

export const STABILITY_EXPENSES = [
  { id: 'stability-exp-001', firmId: SVA_FIRM_ID, date: `${DATE}T08:30:00Z`, type: 'Travel', category: 'Operating Expenses', description: 'Delivery fuel and local travel', amount: 1800, mode: 'Cash', status: 'Paid' },
  { id: 'stability-exp-002', firmId: SVA_FIRM_ID, date: '2026-11-22T10:00:00Z', type: 'Utilities', category: 'Office Expenses', description: 'Warehouse electricity bill', amount: 4250, mode: 'Bank Transfer', status: 'Paid' },
  { id: 'stability-exp-003', firmId: SVA_FIRM_ID, date: '2026-11-18T11:00:00Z', type: 'Repairs', category: 'Maintenance', description: 'Forklift maintenance — awaiting approval', amount: 9600, mode: 'UPI / Digital Wallet', status: 'Draft' },
]

export const STABILITY_TRANSACTIONS = [
  { id: 'stability-txn-001', firmId: SVA_FIRM_ID, type: 'payment-in', date: `${DATE}T09:20:00Z`, amount: 25000, balance: 25000, description: 'Payment received from Rajesh Patel', accountId: 'stability-account-bank', customerId: 'stability-customer-001', productId: null },
  { id: 'stability-txn-002', firmId: SVA_FIRM_ID, type: 'expense', expenseId: 'stability-exp-002', date: '2026-11-22T10:00:00Z', amount: -4250, balance: 20750, description: 'Warehouse electricity bill', accountId: 'stability-account-bank', customerId: null, productId: null },
  { id: 'stability-txn-003', firmId: SVA_FIRM_ID, type: 'sale', date: '2026-11-21T12:15:00Z', amount: 32400, balance: 53150, description: 'Invoice INV-STABILITY-001', accountId: 'stability-account-cash', customerId: 'stability-customer-002', productId: 'stability-prod-001' },
  { id: 'stability-txn-004', firmId: SVA_FIRM_ID, type: 'purchase', date: '2026-11-19T15:00:00Z', amount: -18200, balance: 34950, description: 'Purchase bill PUR-STABILITY-003', accountId: 'stability-account-bank', customerId: null, productId: 'stability-prod-004' },
]

export const STABILITY_NOTIFICATIONS = [
  { id: 'stability-notification-001', firmId: SVA_FIRM_ID, title: 'Low stock: PVC Pipe 63mm', body: 'Only 8 pcs remain, below the minimum level of 10.', type: 'inventory', read: false, createdAt: `${DATE}T09:45:00Z` },
  { id: 'stability-notification-002', firmId: SVA_FIRM_ID, title: 'Payment due: Rajesh Patel', body: '₹16,450 is outstanding on the customer account.', type: 'payment', read: false, createdAt: '2026-11-23T12:00:00Z' },
  { id: 'stability-notification-003', firmId: SVA_FIRM_ID, title: 'Expense awaiting approval', body: 'Forklift maintenance expense requires review.', type: 'approval', read: true, createdAt: '2026-11-22T11:00:00Z' },
]

export const STABILITY_PURCHASES = [
  { id: 'stability-purchase-001', firmId: SVA_FIRM_ID, number: 'PUR-STABILITY-003', vendorName: 'ABC Irrigation Traders', vendorInvoiceNumber: 'ABC-7788', vendorContact: '9898989898', purchaseDate: '2026-11-19T15:00:00Z', items: [{ productId: 'stability-prod-004', qty: 100, price: 210, taxPct: 18 }], discount: 0, subtotal: 21000, taxTotal: 3780, total: 24780, advance: 12000, paid: 12000, due: 12780, status: 'Partially Paid', paymentMode: 'Bank Transfer', notes: 'Stability-test purchase' },
  { id: 'stability-purchase-002', firmId: SVA_FIRM_ID, number: 'PUR-STABILITY-002', vendorName: 'Greenline Suppliers', vendorInvoiceNumber: 'GL-1092', vendorContact: '9777777777', purchaseDate: '2026-11-12T10:00:00Z', items: [{ productId: 'stability-prod-002', qty: 50, price: 320, taxPct: 18 }], discount: 500, subtotal: 16000, taxTotal: 2790, total: 18290, advance: 18290, paid: 18290, due: 0, status: 'Paid', paymentMode: 'UPI / Digital Wallet', notes: 'Stability-test purchase' },
]

export const STABILITY_PURCHASE_ORDERS = [
  { id: 'stability-purchase-order-001', firmId: SVA_FIRM_ID, number: 'PO-STABILITY-001', vendorName: 'ABC Irrigation Traders', orderDate: `${DATE}T10:30:00Z`, expectedDelivery: '2026-11-28', items: [{ productId: 'stability-prod-006', qty: 40, price: 145, taxPct: 18 }], discount: 0, subtotal: 5800, taxTotal: 1044, total: 6844, status: 'Partially Received', receivedQty: 12, receivedItems: [{ productId: 'stability-prod-006', qty: 12 }] },
  { id: 'stability-purchase-order-002', firmId: SVA_FIRM_ID, number: 'PO-STABILITY-002', vendorName: 'Greenline Suppliers', orderDate: '2026-11-16T10:30:00Z', expectedDelivery: '2026-11-23', items: [{ productId: 'stability-prod-009', qty: 100, price: 32, taxPct: 18 }], discount: 0, subtotal: 3200, taxTotal: 576, total: 3776, status: 'Received', receivedQty: 100, receivedItems: [{ productId: 'stability-prod-009', qty: 100 }] },
]

export const STABILITY_SALES_ORDERS = [
  { id: 'stability-order-001', firmId: SVA_FIRM_ID, number: 'SO-STABILITY-001', customerId: 'stability-customer-001', customerName: 'Rajesh Patel', orderDate: `${DATE}T11:00:00Z`, expectedDelivery: '2026-11-27', items: [{ productId: 'stability-prod-001', qty: 50, price: 1100, taxPct: 18 }], discount: 0, subtotal: 55000, taxTotal: 9900, total: 64900, advance: 20000, paymentMode: 'Online', status: 'Processing', fulfilledQty: 10, fulfilledItems: [{ productId: 'stability-prod-001', qty: 10 }], notes: 'Stability-test order' },
  { id: 'stability-order-002', firmId: SVA_FIRM_ID, number: 'SO-STABILITY-002', customerId: 'stability-customer-002', customerName: 'Kannu Agritech', orderDate: '2026-11-20T11:00:00Z', expectedDelivery: '2026-11-25', items: [{ productId: 'stability-prod-004', qty: 20, price: 280, taxPct: 18 }], discount: 0, subtotal: 5600, taxTotal: 1008, total: 6608, advance: 6608, paymentMode: 'Cash', status: 'Completed', fulfilledQty: 20, fulfilledItems: [{ productId: 'stability-prod-004', qty: 20 }], notes: 'Stability-test order' },
]

export const STABILITY_QUOTATIONS = [
  { id: 'stability-quotation-001', firmId: SVA_FIRM_ID, number: 'QUOT-STABILITY-001', customerId: 'stability-customer-003', customerName: 'National Machinery', date: '2026-11-23T10:00:00Z', expiryDate: '2026-12-07T10:00:00Z', items: [{ productId: 'stability-prod-008', qty: 12, price: 650 }], discount: 0, subtotal: 7800, taxTotal: 1404, total: 9204, status: 'Sent' },
  { id: 'stability-quotation-002', firmId: SVA_FIRM_ID, number: 'QUOT-STABILITY-002', customerId: 'stability-customer-001', customerName: 'Rajesh Patel', date: '2026-11-17T10:00:00Z', expiryDate: '2026-12-01T10:00:00Z', items: [{ productId: 'stability-prod-004', qty: 20, price: 280 }], discount: 0, subtotal: 5600, taxTotal: 1008, total: 6608, status: 'Accepted' },
]

export const STABILITY_STOCK_MOVEMENTS = [
  { id: 'stability-stock-001', firmId: SVA_FIRM_ID, productId: 'stability-prod-001', type: 'stock-in', qty: 100, unit: 'mtr', reference: 'GRN-STABILITY-001', reason: 'Opening stock fixture', previousStock: 0, newStock: 100, date: '2026-11-01T09:00:00Z' },
  { id: 'stability-stock-002', firmId: SVA_FIRM_ID, productId: 'stability-prod-003', type: 'stock-out', qty: 8, unit: 'pcs', reference: 'INV-STABILITY-001', reason: 'Opening stock fixture', previousStock: 8, newStock: 0, date: '2026-11-21T12:00:00Z' },
  { id: 'stability-stock-003', firmId: SVA_FIRM_ID, productId: 'stability-prod-002', type: 'adjustment', qty: -2, unit: 'pcs', reference: 'ADJ-STABILITY-001', reason: 'Damaged units', previousStock: 10, newStock: 8, date: `${DATE}T08:00:00Z` },
]
