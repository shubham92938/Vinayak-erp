/*
 * Synthetic demo workspace data.
 *
 * Every record is assigned to one of the local demo firms. Keeping the seed
 * data together makes it easy to inspect the product end to end while the
 * firm context store continues to enforce isolation in each service.
 */

const FIRMS = [
  { id: 'shree-vinayak-agency', code: 'SVA', key: 'sva', city: 'Ujjain', brand: 'Vinayak' },
  { id: 'indore-agro-supplies', code: 'IAS', key: 'ias', city: 'Indore', brand: 'Malwa' },
  { id: 'malwa-irrigation-traders', code: 'MIT', key: 'mit', city: 'Dewas', brand: 'Narmada' },
]

const CATEGORY_TEMPLATES = [
  { key: 'drip', name: 'Drip Irrigation', code: 'DRIP', description: 'Drip lines and water-saving accessories' },
  { key: 'pipes', name: 'PVC Pipes & Fittings', code: 'PVC', description: 'PVC pipes, connectors and valves' },
  { key: 'sprinkler', name: 'Sprinklers', code: 'SPRAY', description: 'Sprinkler and spray irrigation products' },
  { key: 'farm', name: 'Farm Supplies', code: 'FARM', description: 'Seeds, tools and farm services' },
]

const PRODUCT_TEMPLATES = [
  { key: 'drip-line', category: 'drip', name: 'Drip Lateral Pipe 16mm 300m', code: 'DRIP-016', unit: 'mtr', quantity: 84, minStock: 20, buyingPrice: 850, sellingPrice: 1100 },
  { key: 'pvc-pipe', category: 'pipes', name: 'PVC Pipe 63mm Heavy Duty', code: 'PVC-063', unit: 'pcs', quantity: 34, minStock: 12, buyingPrice: 320, sellingPrice: 450 },
  { key: 'mini-sprinkler', category: 'sprinkler', name: 'Mini Sprinkler 360 Degree', code: 'SPR-360', unit: 'pcs', quantity: 52, minStock: 15, buyingPrice: 90, sellingPrice: 120 },
  { key: 'spray-pipe', category: 'sprinkler', name: 'Spray Pipe 32mm Green 750m', code: 'SPR-032', unit: 'mtr', quantity: 126, minStock: 25, buyingPrice: 210, sellingPrice: 280 },
  { key: 'filter', category: 'drip', name: 'Drip Filter 120 Mesh', code: 'DRIP-120', unit: 'pcs', quantity: 19, minStock: 10, buyingPrice: 480, sellingPrice: 650 },
  { key: 'valve', category: 'pipes', name: 'Union Valve 75mm PVC', code: 'PVC-075', unit: 'pcs', quantity: 9, minStock: 12, buyingPrice: 145, sellingPrice: 210 },
  { key: 'seed', category: 'farm', name: 'Potato Seed Kufri Jyoti 50kg', code: 'SEED-050', unit: 'bags', quantity: 18, minStock: 6, buyingPrice: 720, sellingPrice: 850 },
]

const CUSTOMER_TEMPLATES = [
  { key: 'raj-agro', name: 'Raj Agro Centre', contactPerson: 'Rajesh Patel', phone: '9876543210', city: 'Ujjain', type: 'Dealer', openingBalance: 16450 },
  { key: 'kisan-mart', name: 'Kisan Mart', contactPerson: 'Amit Sharma', phone: '9826012345', city: 'Indore', type: 'Regular Customer', openingBalance: 8200 },
  { key: 'national-machinery', name: 'National Machinery', contactPerson: 'Neha Verma', phone: '9812345678', city: 'Bhopal', type: 'Dealer', openingBalance: 4600 },
]

const VENDORS = [
  ['Greenline Suppliers', '9777777777'],
  ['ABC Irrigation Traders', '9898989898'],
  ['Kisan Hardware Depot', '9811122233'],
]

const round = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100

function firmRef(firmKey) {
  return FIRMS.find((firm) => firm.key === firmKey)
}

function productId(firmKey, productKey) {
  return `${firmKey}-prod-${productKey}`
}

function categoryId(firmKey, categoryKey) {
  return `${firmKey}-cat-${categoryKey}`
}

function customerId(firmKey, customerKey) {
  return `${firmKey}-cust-${customerKey}`
}

export const DEMO_CATEGORIES = FIRMS.flatMap((firm) =>
  CATEGORY_TEMPLATES.map((category, index) => ({
    id: categoryId(firm.key, category.key),
    firmId: firm.id,
    name: `${category.name}`,
    code: `${firm.code}-${category.code}`,
    description: category.description,
    status: index === 3 && firm.key === 'mit' ? 'inactive' : 'active',
    createdAt: `2026-04-${String(4 + index).padStart(2, '0')}T09:00:00Z`,
  })),
)

export const DEMO_PRODUCTS = FIRMS.flatMap((firm, firmIndex) =>
  PRODUCT_TEMPLATES.map((template, productIndex) => ({
    id: productId(firm.key, template.key),
    firmId: firm.id,
    name: `${firm.brand} ${template.name}`,
    code: `${firm.code}-${template.code}`,
    catalogKey: template.key,
    categoryId: categoryId(firm.key, template.category),
    quantity: template.quantity + firmIndex * 7 - (productIndex === 5 ? firmIndex * 2 : 0),
    minStock: template.minStock,
    unit: template.unit,
    buyingPrice: template.buyingPrice + firmIndex * 12,
    sellingPrice: template.sellingPrice + firmIndex * 20,
    mrp: template.sellingPrice + firmIndex * 20 + 40,
    status: productIndex === 6 && firm.key === 'mit' ? 'inactive' : 'active',
    stockTracking: true,
    image: null,
    description: `${template.name} supplied by ${firm.brand}.`,
    notes: 'Synthetic demo record for local workspace preview.',
    createdAt: `2026-05-${String(10 + productIndex).padStart(2, '0')}T10:00:00Z`,
    updatedAt: '2026-11-24T09:30:00Z',
  })),
)

export const DEMO_CUSTOMERS = FIRMS.flatMap((firm, firmIndex) =>
  CUSTOMER_TEMPLATES.map((customer, index) => ({
    id: customerId(firm.key, customer.key),
    firmId: firm.id,
    code: `${firm.code}-CUS-${String(index + 1).padStart(3, '0')}`,
    name: `${customer.name} · ${firm.city}`,
    customerType: customer.type,
    type: customer.type,
    contactPerson: customer.contactPerson,
    phone: `${Number(customer.phone) + firmIndex * 1111}`,
    email: `${customer.key}.${firm.key}@demo.example`,
    city: index === 1 ? firm.city : customer.city,
    state: 'Madhya Pradesh',
    openingBalance: customer.openingBalance + firmIndex * 1250,
    status: index === 2 && firm.key === 'mit' ? 'Inactive' : 'Active',
    createdAt: `2026-06-${String(2 + index + firmIndex).padStart(2, '0')}T09:00:00Z`,
  })),
)

export const DEMO_ACCOUNTS = FIRMS.flatMap((firm, firmIndex) => [
  { id: `${firm.key}-account-cash`, firmId: firm.id, name: 'Cash Counter', type: 'cash', openingBalance: 42000 + firmIndex * 8400, balance: 48500 + firmIndex * 9200, status: 'active' },
  { id: `${firm.key}-account-bank`, firmId: firm.id, name: 'HDFC Current Account', type: 'bank', openingBalance: 200000 + firmIndex * 16000, balance: 212400 + firmIndex * 17600, status: 'active' },
  { id: `${firm.key}-account-upi`, firmId: firm.id, name: 'UPI Collection', type: 'digital', openingBalance: 16000 + firmIndex * 3800, balance: 18450 + firmIndex * 4100, status: 'active' },
])

function getFirmProducts(firmKey) {
  return DEMO_PRODUCTS.filter((product) => product.firmId === firmRef(firmKey).id)
}

function getFirmCustomers(firmKey) {
  return DEMO_CUSTOMERS.filter((customer) => customer.firmId === firmRef(firmKey).id)
}

function makeLine(product, qty, price = product.sellingPrice, taxPct = 18) {
  return {
    productId: product.id,
    name: product.name,
    code: product.code,
    qty,
    quantity: qty,
    price,
    buyingPrice: product.buyingPrice,
    taxPct,
    lineTotal: round(qty * price),
    image: product.image,
  }
}

function totals(items, discount = 0, advance = 0) {
  const subtotal = round(items.reduce((sum, item) => sum + Number(item.qty) * Number(item.price), 0))
  const taxTotal = round(items.reduce((sum, item) => sum + (Number(item.qty) * Number(item.price) * Number(item.taxPct ?? 18)) / 100, 0))
  const total = round(subtotal - Number(discount) + taxTotal)
  return {
    subtotal,
    taxTotal,
    total,
    advance: round(advance),
    paid: round(advance),
    due: round(Math.max(0, total - Number(advance))),
  }
}

function makeSale(firmKey, index, customer, items, date, advance, status) {
  const firm = firmRef(firmKey)
  const amounts = totals(items, 0, advance)
  return {
    id: `${firmKey}-sale-${String(index).padStart(3, '0')}`,
    number: `${firm.code}-INV-${String(index).padStart(4, '0')}`,
    type: 'Invoice',
    documentNumber: `${firm.code}/26-27/${String(index).padStart(3, '0')}`,
    customerId: customer.id,
    customerName: customer.name,
    date: `${date}T12:15:00Z`,
    items,
    discount: 0,
    ...amounts,
    paymentMode: advance > 0 ? 'Bank Transfer' : 'Online',
    buyerType: customer.customerType === 'Dealer' ? 'Dealer' : 'Customer',
    saleType: 'Retail',
    detailStatus: status,
    status,
    notes: 'Synthetic demo invoice',
    firmId: firm.id,
  }
}

export const DEMO_SALES = FIRMS.flatMap((firm) => {
  const products = getFirmProducts(firm.key)
  const customers = getFirmCustomers(firm.key)
  return [
    makeSale(firm.key, 1, customers[0], [makeLine(products[0], 12), makeLine(products[4], 3)], '2026-11-21', 5000, 'Partially Paid'),
    makeSale(firm.key, 2, customers[1], [makeLine(products[1], 8, products[1].sellingPrice), makeLine(products[2], 10)], '2026-11-18', 0, 'APPROVED'),
    makeSale(firm.key, 3, customers[2], [makeLine(products[3], 18), makeLine(products[5], 4)], '2026-11-11', 0, 'APPROVED'),
  ]
})

export const DEMO_CHALLANS = FIRMS.map((firm) => {
  const products = getFirmProducts(firm.key)
  const customer = getFirmCustomers(firm.key)[1]
  const items = [makeLine(products[0], 6)]
  const amounts = totals(items)
  return {
    id: `${firm.key}-challan-001`,
    number: `${firm.code}-CHL-0001`,
    type: 'Challan',
    documentNumber: `${firm.code}/CHL/001`,
    customerId: customer.id,
    customerName: customer.name,
    date: '2026-11-08T10:00:00Z',
    items,
    discount: 0,
    ...amounts,
    paymentMode: 'N/A',
    status: 'Delivered',
    notes: 'Synthetic demo delivery challan',
    firmId: firm.id,
  }
})

export const DEMO_PAYMENTS = DEMO_SALES.map((sale) => ({
  id: `${sale.id}-payment-in`,
  invoiceId: sale.id,
  customerId: sale.customerId,
  date: '2026-11-22T10:30:00Z',
  amount: 5000,
  mode: 'Bank Transfer',
  accountId: `${FIRMS.find((firm) => firm.id === sale.firmId).key}-account-bank`,
  status: 'Paid',
  notes: 'Advance collected against invoice',
  firmId: sale.firmId,
}))

export const DEMO_PURCHASES = FIRMS.flatMap((firm, firmIndex) => {
  const products = getFirmProducts(firm.key)
  const vendor = VENDORS[firmIndex]
  const purchaseRows = [
    { index: 1, product: products[3], qty: 45, date: '2026-11-16', advance: 7000, status: 'Partially Paid' },
    { index: 2, product: products[1], qty: 30, date: '2026-11-04', advance: 0, status: 'Draft' },
  ]
  return purchaseRows.map((row) => {
    const items = [makeLine(row.product, row.qty, row.product.buyingPrice)]
    const amounts = totals(items, row.index === 1 ? 250 : 0, row.advance)
    return {
      id: `${firm.key}-purchase-${String(row.index).padStart(3, '0')}`,
      number: `${firm.code}-PUR-${String(row.index).padStart(4, '0')}`,
      vendorName: `${vendor[0]} · ${firm.city}`,
      vendorInvoiceNumber: `${firm.code}-V-${100 + row.index}`,
      vendorContact: vendor[1],
      purchaseDate: `${row.date}T15:00:00Z`,
      items,
      discount: row.index === 1 ? 250 : 0,
      ...amounts,
      status: row.status,
      paymentMode: row.advance > 0 ? 'Bank Transfer' : '—',
      notes: 'Synthetic demo purchase bill',
      firmId: firm.id,
    }
  })
})

export const DEMO_PURCHASE_ORDERS = FIRMS.flatMap((firm, firmIndex) => {
  const products = getFirmProducts(firm.key)
  const vendor = VENDORS[(firmIndex + 1) % VENDORS.length]
  return [1, 2].map((index) => {
    const product = products[index === 1 ? 5 : 4]
    const qty = index === 1 ? 24 : 36
    const items = [makeLine(product, qty, product.buyingPrice)]
    const amounts = totals(items)
    const receivedQty = index === 1 ? 8 : qty
    return {
      id: `${firm.key}-purchase-order-${String(index).padStart(3, '0')}`,
      number: `${firm.code}-PO-${String(index).padStart(4, '0')}`,
      vendorName: `${vendor[0]} · ${firm.city}`,
      orderDate: `2026-11-${String(12 + index).padStart(2, '0')}T10:30:00Z`,
      expectedDelivery: `2026-11-${String(26 + index).padStart(2, '0')}`,
      items,
      discount: 0,
      ...amounts,
      total: amounts.total,
      status: receivedQty >= qty ? 'Received' : 'Partially Received',
      receivedQty,
      receivedItems: [{ productId: product.id, qty: receivedQty }],
      firmId: firm.id,
    }
  })
})

export const DEMO_SALES_ORDERS = FIRMS.flatMap((firm, firmIndex) => {
  const products = getFirmProducts(firm.key)
  const customer = getFirmCustomers(firm.key)[0]
  return [1, 2].map((index) => {
    const product = products[index === 1 ? 0 : 3]
    const qty = index === 1 ? 26 : 18
    const items = [makeLine(product, qty)]
    const amounts = totals(items, 0, index === 1 ? 8000 : amountsForOrderAdvance(product, qty))
    const fulfilledQty = index === 1 ? 8 : qty
    return {
      id: `${firm.key}-sales-order-${String(index).padStart(3, '0')}`,
      number: `${firm.code}-SO-${String(index).padStart(4, '0')}`,
      customerId: customer.id,
      customerName: customer.name,
      orderDate: `2026-11-${String(14 + firmIndex + index).padStart(2, '0')}T11:00:00Z`,
      expectedDelivery: `2026-11-${String(27 + index).padStart(2, '0')}`,
      items,
      discount: 0,
      subtotal: amounts.subtotal,
      taxTotal: amounts.taxTotal,
      total: amounts.total,
      advance: amounts.advance,
      paymentMode: 'Online',
      saleType: 'Retail',
      orderType: 'Customer',
      invoiceType: 'Tax Invoice',
      vehicleNumber: '',
      driverNumber: '',
      reference: 'Website enquiry',
      notes: 'Synthetic demo sales order',
      status: fulfilledQty >= qty ? 'Completed' : 'Processing',
      fulfilledQty,
      fulfilledItems: [{ productId: product.id, qty: fulfilledQty }],
      firmId: firm.id,
    }
  })
})

function amountsForOrderAdvance(product, qty) {
  return round(product.sellingPrice * qty * 0.25)
}

export const DEMO_QUOTATIONS = FIRMS.flatMap((firm) => {
  const products = getFirmProducts(firm.key)
  const customer = getFirmCustomers(firm.key)[2]
  return [1, 2].map((index) => {
    const items = [makeLine(products[index === 1 ? 4 : 2], index === 1 ? 8 : 14)]
    const amounts = totals(items)
    return {
      id: `${firm.key}-quotation-${String(index).padStart(3, '0')}`,
      number: `${firm.code}-QUOT-${String(index).padStart(4, '0')}`,
      customerId: customer.id,
      customerName: customer.name,
      date: `2026-11-${String(5 + index).padStart(2, '0')}T10:00:00Z`,
      expiryDate: `2026-12-${String(5 + index).padStart(2, '0')}T10:00:00Z`,
      items,
      discount: 0,
      subtotal: amounts.subtotal,
      taxTotal: amounts.taxTotal,
      total: amounts.total,
      status: index === 1 ? 'Sent' : 'Accepted',
      firmId: firm.id,
    }
  })
})

export const DEMO_EXPENSES = FIRMS.flatMap((firm, firmIndex) => [
  {
    id: `${firm.key}-expense-001`,
    firmId: firm.id,
    date: '2026-11-22T10:00:00Z',
    type: 'Utilities',
    category: 'Office Expenses',
    description: `${firm.city} warehouse electricity bill`,
    amount: 4250 + firmIndex * 500,
    mode: 'Bank Transfer',
    accountId: `${firm.key}-account-bank`,
    status: 'Paid',
  },
  {
    id: `${firm.key}-expense-002`,
    firmId: firm.id,
    date: '2026-11-18T11:00:00Z',
    type: 'Travel',
    category: 'Operating Expenses',
    description: `Customer delivery fuel — ${firm.city}`,
    amount: 1800 + firmIndex * 250,
    mode: 'Cash',
    accountId: `${firm.key}-account-cash`,
    status: 'Draft',
  },
])

export const DEMO_STOCK_MOVEMENTS = FIRMS.flatMap((firm) => {
  const products = getFirmProducts(firm.key)
  return [
    { id: `${firm.key}-stock-001`, firmId: firm.id, productId: products[0].id, type: 'stock-in', qty: 100, unit: products[0].unit, reference: `${firm.code}-GRN-001`, reason: 'Opening demo stock', previousStock: 0, newStock: 100, date: '2026-11-01T09:00:00Z' },
    { id: `${firm.key}-stock-002`, firmId: firm.id, productId: products[2].id, type: 'stock-out', qty: 8, unit: products[2].unit, reference: `${firm.code}-INV-0001`, reason: 'Demo sales dispatch', previousStock: 60, newStock: 52, date: '2026-11-21T12:00:00Z' },
    { id: `${firm.key}-stock-003`, firmId: firm.id, productId: products[5].id, type: 'adjustment', qty: -2, unit: products[5].unit, reference: `${firm.code}-ADJ-001`, reason: 'Damaged units', previousStock: 11, newStock: 9, date: '2026-11-23T08:00:00Z' },
  ]
})

export const DEMO_NOTIFICATIONS = FIRMS.flatMap((firm) => {
  const products = getFirmProducts(firm.key)
  const customer = getFirmCustomers(firm.key)[0]
  return [
    { id: `${firm.key}-notification-001`, firmId: firm.id, title: `Low stock: ${products[5].name}`, body: `Only ${products[5].quantity} ${products[5].unit} remain below the minimum level of ${products[5].minStock}.`, type: 'inventory', read: false, createdAt: '2026-11-24T09:45:00Z' },
    { id: `${firm.key}-notification-002`, firmId: firm.id, title: `Payment due: ${customer.name}`, body: `₹${customer.openingBalance.toLocaleString('en-IN')} is outstanding on the customer account.`, type: 'payment', read: false, createdAt: '2026-11-23T12:00:00Z' },
    { id: `${firm.key}-notification-003`, firmId: firm.id, title: 'Expense awaiting approval', body: 'A draft operating expense requires review.', type: 'approval', read: true, createdAt: '2026-11-22T11:00:00Z' },
  ]
})

export const DEMO_TRANSACTIONS = [
  ...DEMO_SALES.map((sale) => ({
    id: `${sale.id}-txn`,
    firmId: sale.firmId,
    type: 'sale',
    date: sale.date,
    amount: sale.total,
    balance: sale.due,
    description: `Invoice ${sale.number}`,
    accountId: `${firmRef(FIRMS.find((firm) => firm.id === sale.firmId).key).key}-account-cash`,
    customerId: sale.customerId,
    productId: sale.items[0]?.productId ?? null,
  })),
  ...DEMO_PURCHASES.map((purchase) => ({
    id: `${purchase.id}-txn`,
    firmId: purchase.firmId,
    type: 'purchase',
    date: purchase.purchaseDate,
    amount: -purchase.total,
    balance: purchase.due,
    description: `Purchase bill ${purchase.number}`,
    accountId: `${firmRef(FIRMS.find((firm) => firm.id === purchase.firmId).key).key}-account-bank`,
    customerId: null,
    productId: purchase.items[0]?.productId ?? null,
  })),
  ...DEMO_EXPENSES.filter((expense) => expense.status === 'Paid').map((expense) => ({
    id: `${expense.id}-txn`,
    expenseId: expense.id,
    firmId: expense.firmId,
    type: 'expense',
    date: expense.date,
    amount: -expense.amount,
    balance: 0,
    description: expense.description,
    accountId: expense.accountId,
    customerId: null,
    productId: null,
  })),
  ...DEMO_PAYMENTS.map((payment) => ({
    id: `${payment.id}-txn`,
    firmId: payment.firmId,
    type: 'payment-in',
    date: payment.date,
    amount: payment.amount,
    balance: 0,
    description: `Payment received for ${payment.invoiceId}`,
    accountId: payment.accountId,
    customerId: payment.customerId,
    productId: null,
  })),
  ...FIRMS.map((firm) => ({
    id: `${firm.key}-payment-out-001-txn`,
    firmId: firm.id,
    type: 'payment-out',
    date: '2026-11-20T13:00:00Z',
    amount: -3500,
    balance: 0,
    description: `Vendor payment — ${firm.city}`,
    accountId: `${firm.key}-account-bank`,
    customerId: null,
    productId: null,
  })),
  ...FIRMS.map((firm) => ({
    id: `${firm.key}-transfer-001`,
    firmId: firm.id,
    type: 'transfer',
    date: '2026-11-15T14:00:00Z',
    amount: 5000,
    balance: 0,
    description: 'Fund transfer: bank to cash counter',
    accountId: `${firm.key}-account-bank`,
    customerId: null,
    productId: null,
  })),
]

export const DEMO_PAYMENTS_OUT = FIRMS.map((firm) => ({
  id: `${firm.key}-payment-out-001`,
  purchaseId: `${firm.key}-purchase-001`,
  vendorName: `Vendor payment · ${firm.city}`,
  date: '2026-11-20T13:00:00Z',
  amount: 3500,
  mode: 'Bank Transfer',
  accountId: `${firm.key}-account-bank`,
  status: 'Paid',
  notes: 'Synthetic demo payment out',
  firmId: firm.id,
}))

export const DEMO_PRICE_HISTORY = DEMO_PRODUCTS.flatMap((product) => [
  {
    id: `${product.id}-price-001`,
    productId: product.id,
    firmId: product.firmId,
    type: 'OLD_PRICE',
    oldValue: product.sellingPrice - 40,
    newValue: product.sellingPrice - 20,
    mrp: product.mrp - 20,
    date: '2026-09-01T09:00:00Z',
    note: 'Opening demo price update',
  },
  {
    id: `${product.id}-price-002`,
    productId: product.id,
    firmId: product.firmId,
    type: 'NEW_PRICE',
    oldValue: product.sellingPrice - 20,
    newValue: product.sellingPrice,
    mrp: product.mrp,
    date: '2026-11-01T09:00:00Z',
    note: 'Current demo price list',
  },
])

export const DEMO_STOCK_HISTORY = DEMO_STOCK_MOVEMENTS.map((movement) => ({
  ...movement,
  type: movement.type === 'stock-in' ? 'IN' : movement.type === 'stock-out' ? 'OUT' : 'ADJUST',
  note: movement.reason,
  refNo: movement.reference,
  demo: true,
  change: movement.type === 'stock-out' ? -movement.qty : movement.qty,
}))

export const DEMO_FIRMS = FIRMS.map((firm) => ({ ...firm }))
