/**
 * DEMO DATA — LOCAL DEVELOPMENT ONLY
 *
 * Every number in this file is generated demonstration data. It is not
 * connected to a backend, an accounting ledger, or a real business.
 * The data is intentionally isolated here so it can be replaced by an API
 * response behind services/dashboardService.js without touching the UI.
 */

import { SAMPLE_FIRMS } from '../../../config/firms'
import {
  addDays,
  diffInDays,
  fromISODate,
  getFinancialYearStart,
  startOfDay,
  toISODate,
} from '../utils/dateRange'

export const DEMO_DATA_LABEL = 'Demo data'
export const DEMO_DATA_NOTICE =
  'All figures on this dashboard are locally generated demo values for interface development. They are not live business data.'

export const DEMO_TODAY = toISODate(startOfDay(new Date()))
const REFERENCE_DATE = startOfDay(new Date())
const CURRENT_FY_START = getFinancialYearStart(REFERENCE_DATE)
export const DEMO_DATA_START = `${CURRENT_FY_START - 3}-04-01`

const daysAgo = (days) => toISODate(addDays(REFERENCE_DATE, -days))
const money = (value) => Math.round(value / 10) * 10

export const DEMO_CUSTOMERS = [
  {
    id: 'cust-va-1',
    name: 'Shreeji Enterprises',
    firmId: 'vinayak-associates',
    city: 'Pune',
  },
  {
    id: 'cust-va-2',
    name: 'Deccan Industrial Supply',
    firmId: 'vinayak-associates',
    city: 'Pune',
  },
  {
    id: 'cust-va-3',
    name: 'Sahyadri Traders',
    firmId: 'vinayak-associates',
    city: 'Satara',
  },
  {
    id: 'cust-va-4',
    name: 'Poona Engineering Works',
    firmId: 'vinayak-associates',
    city: 'Pimpri',
  },
  {
    id: 'cust-vt-1',
    name: 'Mehta & Sons',
    firmId: 'vinayak-traders',
    city: 'Mumbai',
  },
  {
    id: 'cust-vt-2',
    name: 'Coastal Retail Mart',
    firmId: 'vinayak-traders',
    city: 'Thane',
  },
  {
    id: 'cust-vt-3',
    name: 'Girgaon Provisions',
    firmId: 'vinayak-traders',
    city: 'Mumbai',
  },
  {
    id: 'cust-vt-4',
    name: 'Malabar Food Traders',
    firmId: 'vinayak-traders',
    city: 'Navi Mumbai',
  },
  {
    id: 'cust-vl-1',
    name: 'Godavari Transport Co.',
    firmId: 'vinayak-logistics',
    city: 'Nashik',
  },
  {
    id: 'cust-vl-2',
    name: 'Nashik Fleet Services',
    firmId: 'vinayak-logistics',
    city: 'Nashik',
  },
  {
    id: 'cust-vl-3',
    name: 'Sahyadri Logistics',
    firmId: 'vinayak-logistics',
    city: 'Sinnar',
  },
  {
    id: 'cust-vl-4',
    name: 'Trimbak Roadways',
    firmId: 'vinayak-logistics',
    city: 'Nashik',
  },
]

export const DEMO_SUPPLIERS = [
  {
    id: 'supp-va-1',
    name: 'Bharat Steel Depot',
    firmId: 'vinayak-associates',
    city: 'Pune',
  },
  {
    id: 'supp-va-2',
    name: 'Shakti Bearings Pvt Ltd',
    firmId: 'vinayak-associates',
    city: 'Mumbai',
  },
  {
    id: 'supp-vt-1',
    name: 'Konkan Agro Foods',
    firmId: 'vinayak-traders',
    city: 'Ratnagiri',
  },
  {
    id: 'supp-vt-2',
    name: 'Sahyadri Oils',
    firmId: 'vinayak-traders',
    city: 'Kolhapur',
  },
  {
    id: 'supp-vl-1',
    name: 'AutoParts India',
    firmId: 'vinayak-logistics',
    city: 'Pune',
  },
  {
    id: 'supp-vl-2',
    name: 'Deccan Lubricants',
    firmId: 'vinayak-logistics',
    city: 'Aurangabad',
  },
]

export const DEMO_PRODUCTS = [
  {
    id: 'prod-va-1',
    code: 'VA-6205',
    name: 'Industrial Bearing 6205',
    firmId: 'vinayak-associates',
    category: 'Bearings',
    unit: 'pcs',
    sellingPrice: 1250,
    costPrice: 920,
    stock: 18,
    minStock: 40,
    addedAt: '2023-05-12',
    lowStockSince: daysAgo(128),
  },
  {
    id: 'prod-va-2',
    code: 'VA-HO20',
    name: 'Hydraulic Oil 20L',
    firmId: 'vinayak-associates',
    category: 'Lubricants',
    unit: 'can',
    sellingPrice: 3400,
    costPrice: 2650,
    stock: 0,
    minStock: 12,
    addedAt: '2023-06-02',
    lowStockSince: daysAgo(87),
  },
  {
    id: 'prod-va-3',
    code: 'VA-SB12',
    name: 'Steel Bracket 12mm',
    firmId: 'vinayak-associates',
    category: 'Hardware',
    unit: 'pcs',
    sellingPrice: 480,
    costPrice: 360,
    stock: 142,
    minStock: 50,
    addedAt: '2023-05-12',
    lowStockSince: null,
  },
  {
    id: 'prod-va-4',
    code: 'VA-SH04',
    name: 'Safety Helmet',
    firmId: 'vinayak-associates',
    category: 'Safety',
    unit: 'pcs',
    sellingPrice: 780,
    costPrice: 590,
    stock: 76,
    minStock: 30,
    addedAt: '2023-08-19',
    lowStockSince: null,
  },
  {
    id: 'prod-va-5',
    code: 'VA-CW15',
    name: 'Copper Wire 1.5mm',
    firmId: 'vinayak-associates',
    category: 'Electrical',
    unit: 'roll',
    sellingPrice: 7200,
    costPrice: 6100,
    stock: 12,
    minStock: 25,
    addedAt: daysAgo(410),
    lowStockSince: daysAgo(64),
  },
  {
    id: 'prod-va-6',
    code: 'VA-WR315',
    name: 'Welding Rod 3.15mm',
    firmId: 'vinayak-associates',
    category: 'Fabrication',
    unit: 'box',
    sellingPrice: 950,
    costPrice: 720,
    stock: 220,
    minStock: 80,
    addedAt: '2023-07-21',
    lowStockSince: null,
  },
  {
    id: 'prod-va-7',
    code: 'VA-PV2',
    name: 'PVC Pipe 2in',
    firmId: 'vinayak-associates',
    category: 'Plumbing',
    unit: 'length',
    sellingPrice: 320,
    costPrice: 230,
    stock: 0,
    minStock: 30,
    addedAt: '2023-09-04',
    lowStockSince: daysAgo(42),
  },
  {
    id: 'prod-va-8',
    code: 'VA-CG07',
    name: 'Cotton Work Gloves',
    firmId: 'vinayak-associates',
    category: 'Safety',
    unit: 'pair',
    sellingPrice: 180,
    costPrice: 120,
    stock: 54,
    minStock: 20,
    addedAt: '2023-10-16',
    lowStockSince: null,
  },
  {
    id: 'prod-vt-1',
    code: 'VT-BR25',
    name: 'Premium Basmati Rice 25kg',
    firmId: 'vinayak-traders',
    category: 'Staples',
    unit: 'bag',
    sellingPrice: 2650,
    costPrice: 2180,
    stock: 34,
    minStock: 30,
    addedAt: '2023-04-18',
    lowStockSince: null,
  },
  {
    id: 'prod-vt-2',
    code: 'VT-SO15',
    name: 'Sunflower Oil 15L',
    firmId: 'vinayak-traders',
    category: 'Edible Oil',
    unit: 'tin',
    sellingPrice: 1950,
    costPrice: 1620,
    stock: 8,
    minStock: 20,
    addedAt: '2023-04-18',
    lowStockSince: daysAgo(35),
  },
  {
    id: 'prod-vt-3',
    code: 'VT-WF50',
    name: 'Wheat Flour 50kg',
    firmId: 'vinayak-traders',
    category: 'Staples',
    unit: 'bag',
    sellingPrice: 1780,
    costPrice: 1480,
    stock: 55,
    minStock: 40,
    addedAt: '2023-05-22',
    lowStockSince: null,
  },
  {
    id: 'prod-vt-4',
    code: 'VT-TD30',
    name: 'Toor Dal 30kg',
    firmId: 'vinayak-traders',
    category: 'Pulses',
    unit: 'bag',
    sellingPrice: 3250,
    costPrice: 2780,
    stock: 0,
    minStock: 15,
    addedAt: '2023-06-11',
    lowStockSince: daysAgo(18),
  },
  {
    id: 'prod-vt-5',
    code: 'VT-SG50',
    name: 'Sugar 50kg',
    firmId: 'vinayak-traders',
    category: 'Staples',
    unit: 'bag',
    sellingPrice: 2450,
    costPrice: 2050,
    stock: 44,
    minStock: 25,
    addedAt: '2023-04-18',
    lowStockSince: null,
  },
  {
    id: 'prod-vt-6',
    code: 'VT-TL10',
    name: 'Tea Leaves 10kg',
    firmId: 'vinayak-traders',
    category: 'Beverages',
    unit: 'carton',
    sellingPrice: 4200,
    costPrice: 3500,
    stock: 16,
    minStock: 18,
    addedAt: '2023-11-09',
    lowStockSince: daysAgo(140),
  },
  {
    id: 'prod-vt-7',
    code: 'VT-GO15',
    name: 'Groundnut Oil 15L',
    firmId: 'vinayak-traders',
    category: 'Edible Oil',
    unit: 'tin',
    sellingPrice: 2250,
    costPrice: 1860,
    stock: 62,
    minStock: 25,
    addedAt: '2024-01-15',
    lowStockSince: null,
  },
  {
    id: 'prod-vt-8',
    code: 'VT-RS25',
    name: 'Rock Salt 25kg',
    firmId: 'vinayak-traders',
    category: 'Staples',
    unit: 'bag',
    sellingPrice: 480,
    costPrice: 320,
    stock: 110,
    minStock: 40,
    addedAt: '2024-03-08',
    lowStockSince: null,
  },
  {
    id: 'prod-vl-1',
    code: 'VL-DO20',
    name: 'Diesel Engine Oil 20L',
    firmId: 'vinayak-logistics',
    category: 'Lubricants',
    unit: 'can',
    sellingPrice: 4100,
    costPrice: 3300,
    stock: 11,
    minStock: 24,
    addedAt: '2023-05-30',
    lowStockSince: daysAgo(210),
  },
  {
    id: 'prod-vl-2',
    code: 'VL-TT100',
    name: 'Truck Tyre 10.00R20',
    firmId: 'vinayak-logistics',
    category: 'Tyres',
    unit: 'pcs',
    sellingPrice: 18500,
    costPrice: 15200,
    stock: 6,
    minStock: 12,
    addedAt: daysAgo(190),
    lowStockSince: daysAgo(31),
  },
  {
    id: 'prod-vl-3',
    code: 'VL-BP12',
    name: 'Brake Pad Set',
    firmId: 'vinayak-logistics',
    category: 'Spares',
    unit: 'set',
    sellingPrice: 2800,
    costPrice: 2100,
    stock: 48,
    minStock: 20,
    addedAt: '2023-07-14',
    lowStockSince: null,
  },
  {
    id: 'prod-vl-4',
    code: 'VL-AF09',
    name: 'Air Filter',
    firmId: 'vinayak-logistics',
    category: 'Filters',
    unit: 'pcs',
    sellingPrice: 1250,
    costPrice: 890,
    stock: 0,
    minStock: 15,
    addedAt: '2023-08-22',
    lowStockSince: daysAgo(26),
  },
  {
    id: 'prod-vl-5',
    code: 'VL-CL05',
    name: 'Coolant 5L',
    firmId: 'vinayak-logistics',
    category: 'Lubricants',
    unit: 'can',
    sellingPrice: 850,
    costPrice: 600,
    stock: 80,
    minStock: 30,
    addedAt: '2024-02-10',
    lowStockSince: null,
  },
  {
    id: 'prod-vl-6',
    code: 'VL-HL22',
    name: 'Headlamp Assembly',
    firmId: 'vinayak-logistics',
    category: 'Electrical',
    unit: 'pcs',
    sellingPrice: 5600,
    costPrice: 4400,
    stock: 14,
    minStock: 10,
    addedAt: '2023-12-01',
    lowStockSince: null,
  },
  {
    id: 'prod-vl-7',
    code: 'VL-WB18',
    name: 'Wiper Blade',
    firmId: 'vinayak-logistics',
    category: 'Spares',
    unit: 'pair',
    sellingPrice: 450,
    costPrice: 300,
    stock: 22,
    minStock: 15,
    addedAt: daysAgo(22),
    lowStockSince: null,
  },
  {
    id: 'prod-vl-8',
    code: 'VL-GO10',
    name: 'Gear Oil 10L',
    firmId: 'vinayak-logistics',
    category: 'Lubricants',
    unit: 'can',
    sellingPrice: 2600,
    costPrice: 2050,
    stock: 5,
    minStock: 18,
    addedAt: '2023-09-26',
    lowStockSince: daysAgo(53),
  },
]

const FIRM_NAME_BY_ID = Object.fromEntries(
  SAMPLE_FIRMS.map((firm) => [firm.id, firm.name]),
)

function groupBy(items, keySelector) {
  return items.reduce((groups, item) => {
    const key = keySelector(item)
    groups[key] = groups[key] ?? []
    groups[key].push(item)
    return groups
  }, {})
}

const CUSTOMERS_BY_FIRM = groupBy(DEMO_CUSTOMERS, (item) => item.firmId)
const SUPPLIERS_BY_FIRM = groupBy(DEMO_SUPPLIERS, (item) => item.firmId)
const PRODUCTS_BY_FIRM = groupBy(DEMO_PRODUCTS, (item) => item.firmId)

const EXPENSE_SCHEDULE = [
  {
    day: 1,
    category: 'Rent',
    vendors: ['Vinayak Business Park', 'Hiranandani Estates', 'Godavari Complex'],
    min: 28_000,
    max: 42_000,
  },
  {
    day: 2,
    category: 'Salaries',
    vendors: ['Staff payroll'],
    min: 55_000,
    max: 78_000,
  },
  {
    day: 6,
    category: 'Utilities',
    vendors: ['MSEDCL', 'Tata Power', 'Mahanagar Gas'],
    min: 8_000,
    max: 16_000,
  },
  {
    day: 10,
    category: 'Logistics',
    vendors: ['Blue Dart', 'VRL Logistics', 'Delhivery'],
    min: 10_000,
    max: 24_000,
  },
  {
    day: 15,
    category: 'Marketing',
    vendors: ['TradeIndia', 'Sulekha Business', 'Meta Ads'],
    min: 8_000,
    max: 22_000,
  },
  {
    day: 20,
    category: 'Maintenance',
    vendors: ['Sahyadri Facility Services', 'PuneTech Systems'],
    min: 6_000,
    max: 15_000,
  },
  {
    day: 25,
    category: 'Office',
    vendors: ['Stationery Mart', 'PrintWorks', 'Sai Stationers'],
    min: 2_500,
    max: 7_000,
  },
]

function createRandom(seed) {
  let state = seed >>> 0

  return function random() {
    state = (state + 0x6d2b79f5) >>> 0
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296
  }
}

const random = createRandom(2_604_112)
const settlementRandom = createRandom(2_604_113)

function randomInteger(min, max) {
  return Math.floor(random() * (max - min + 1)) + min
}

function pick(items) {
  return items[Math.floor(random() * items.length)]
}

function weightedPick(items, weights) {
  const total = weights.reduce((sum, weight) => sum + weight, 0)
  let cursor = random() * total

  for (let index = 0; index < items.length; index += 1) {
    cursor -= weights[index]
    if (cursor <= 0) return items[index]
  }

  return items.at(-1)
}

function lineQuantity(unitPrice) {
  if (unitPrice >= 15_000) return randomInteger(1, 5)
  if (unitPrice >= 5_000) return randomInteger(2, 8)
  if (unitPrice >= 1_000) return randomInteger(5, 20)
  return randomInteger(20, 90)
}

function settlement(amount, dueDate, { invoiceAge }) {
  // Payment behaviour depends on invoice age rather than only on the due
  // date. That keeps current and previous period balances comparable while
  // still leaving older invoices mostly reconciled.
  let fullProbability
  let partialProbability

  if (invoiceAge > 120) {
    fullProbability = 0.985
    partialProbability = 0.005
  } else if (invoiceAge > 60) {
    fullProbability = 0.88
    partialProbability = 0.06
  } else {
    // Keep collection behaviour consistent across recent periods so the
    // period-over-period comparison is not dominated by invoice age.
    fullProbability = 0.42
    partialProbability = 0.22
  }

  const roll = settlementRandom()

  let paidAmount = 0

  if (roll < fullProbability) {
    paidAmount = amount
  } else if (roll < fullProbability + partialProbability) {
    paidAmount = money(amount * (0.32 + settlementRandom() * 0.3))
  }

  const isPartiallyPaid = paidAmount > 0 && paidAmount < amount
  let status = 'pending'

  if (paidAmount >= amount) status = 'paid'
  else if (dueDate < DEMO_TODAY) status = 'overdue'
  else if (isPartiallyPaid) status = 'partial'

  return {
    paidAmount,
    balanceDue: Math.max(amount - paidAmount, 0),
    status,
  }
}

const transactions = []
const orders = []

function buildSaleLines(firmId) {
  const products = PRODUCTS_BY_FIRM[firmId]
  const lineCount = randomInteger(1, 3)
  const chosen = []

  while (chosen.length < lineCount) {
    const product = pick(products)
    if (!chosen.some((line) => line.productId === product.id)) {
      chosen.push(product)
    }
  }

  return chosen.map((product) => {
    const quantity = lineQuantity(product.sellingPrice)

    return {
      productId: product.id,
      productCode: product.code,
      productName: product.name,
      quantity,
      unitPrice: product.sellingPrice,
      costPrice: product.costPrice,
      lineTotal: money(quantity * product.sellingPrice),
    }
  })
}

function createSale(date) {
  const firm = weightedPick(SAMPLE_FIRMS, [0.38, 0.36, 0.26])
  const customer = pick(CUSTOMERS_BY_FIRM[firm.id])
  const lines = buildSaleLines(firm.id)
  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0)
  const discount = money(subtotal * random() * 0.05)
  const amount = Math.max(subtotal - discount, 0)
  const costTotal = lines.reduce(
    (sum, line) => sum + line.quantity * line.costPrice,
    0,
  )
  const dueDate = toISODate(
    addDays(date, weightedPick([7, 15, 30], [0.2, 0.45, 0.35])),
  )
  const invoiceAge = diffInDays(toISODate(date), DEMO_TODAY)
  const payment = settlement(amount, dueDate, { invoiceAge })
  const sale = {
    date: toISODate(date),
    type: 'sale',
    partyId: customer.id,
    party: customer.name,
    partyType: 'customer',
    firmId: firm.id,
    firmName: FIRM_NAME_BY_ID[firm.id],
    amount,
    discount,
    subtotal,
    costTotal,
    paidAmount: payment.paidAmount,
    balanceDue: payment.balanceDue,
    status: payment.status,
    dueDate,
    lines,
  }

  transactions.push(sale)
}

function createPurchase(date) {
  const firm = weightedPick(SAMPLE_FIRMS, [0.4, 0.35, 0.25])
  const supplier = pick(SUPPLIERS_BY_FIRM[firm.id])
  const products = PRODUCTS_BY_FIRM[firm.id]
  const lineCount = randomInteger(1, 2)
  const amount = money(
    Array.from({ length: lineCount }).reduce((sum) => {
      const product = pick(products)
      return sum + product.costPrice * randomInteger(4, 24)
    }, 0),
  )
  const dueDate = toISODate(
    addDays(date, weightedPick([15, 30, 45], [0.3, 0.5, 0.2])),
  )
  const invoiceAge = diffInDays(toISODate(date), DEMO_TODAY)
  const payment = settlement(amount, dueDate, {
    invoiceAge,
  })

  transactions.push({
    date: toISODate(date),
    type: 'purchase',
    partyId: supplier.id,
    party: supplier.name,
    partyType: 'supplier',
    firmId: firm.id,
    firmName: FIRM_NAME_BY_ID[firm.id],
    amount,
    paidAmount: payment.paidAmount,
    balanceDue: payment.balanceDue,
    status: payment.status,
    dueDate,
  })
}

function createPayment(date, direction) {
  const firm = weightedPick(SAMPLE_FIRMS, [0.38, 0.37, 0.25])
  const isIncoming = direction === 'in'
  const party = isIncoming
    ? pick(CUSTOMERS_BY_FIRM[firm.id])
    : pick(SUPPLIERS_BY_FIRM[firm.id])
  const amount = money(weightedPick([1, 2, 4], [0.45, 0.35, 0.2]) * 22_500)
  const method = pick(['NEFT', 'UPI', 'Cheque', 'Bank transfer'])

  transactions.push({
    date: toISODate(date),
    type: isIncoming ? 'payment-in' : 'payment-out',
    partyId: party.id,
    party: party.name,
    partyType: isIncoming ? 'customer' : 'supplier',
    firmId: firm.id,
    firmName: FIRM_NAME_BY_ID[firm.id],
    amount,
    paidAmount: amount,
    balanceDue: 0,
    status: 'paid',
    dueDate: toISODate(date),
    method,
  })
}

function createExpense(date, expenseType) {
  const firm = weightedPick(SAMPLE_FIRMS, [0.36, 0.36, 0.28])
  const vendor = pick(expenseType.vendors)
  const amount = money(
    expenseType.min + random() * (expenseType.max - expenseType.min),
  )
  const dueDate = toISODate(addDays(date, 7))
  const invoiceAge = diffInDays(toISODate(date), DEMO_TODAY)
  const isPastDue = dueDate < DEMO_TODAY
  let paidAmount = amount
  let status = 'paid'

  if (isPastDue && random() > 0.88) {
    paidAmount = 0
    status = 'overdue'
  } else if (!isPastDue && random() > 0.82) {
    paidAmount = random() > 0.55 ? money(amount * 0.5) : 0
    status = paidAmount > 0 ? 'partial' : 'pending'
  } else if (invoiceAge < 2 && random() > 0.7) {
    paidAmount = 0
    status = 'pending'
  }

  transactions.push({
    date: toISODate(date),
    type: 'expense',
    partyId: null,
    party: vendor,
    partyType: 'vendor',
    firmId: firm.id,
    firmName: FIRM_NAME_BY_ID[firm.id],
    amount,
    paidAmount,
    balanceDue: Math.max(amount - paidAmount, 0),
    status,
    dueDate,
    category: expenseType.category,
  })
}

function generateTransactions() {
  const finalDate = fromISODate(DEMO_TODAY)
  let cursor = fromISODate(DEMO_DATA_START)

  while (cursor <= finalDate) {
    const dayOfWeek = cursor.getDay()
    const isSunday = dayOfWeek === 0
    const isSaturday = dayOfWeek === 6

    const salesCount = weightedPick([0, 1, 2, 3], [0.2, 0.43, 0.28, 0.09])
    const purchasesCount = weightedPick([0, 1, 2], [0.43, 0.44, 0.13])
    const incomingCount = weightedPick([0, 1, 2], [0.36, 0.49, 0.15])
    const outgoingCount = weightedPick([0, 1], [0.62, 0.38])
    const scheduledExpenses = EXPENSE_SCHEDULE.filter(
      (expense) => expense.day === cursor.getDate(),
    )

    if (!isSunday || random() < 0.35) {
      for (let index = 0; index < salesCount; index += 1) {
        createSale(cursor)
      }
    }

    if (!isSaturday && !isSunday) {
      for (let index = 0; index < purchasesCount; index += 1) {
        createPurchase(cursor)
      }
    }

    for (let index = 0; index < incomingCount; index += 1) {
      createPayment(cursor, 'in')
    }

    for (let index = 0; index < outgoingCount; index += 1) {
      createPayment(cursor, 'out')
    }

    for (const expense of scheduledExpenses) {
      createExpense(cursor, expense)
    }

    cursor = addDays(cursor, 1)
  }
}

function generateOrders() {
  let cursor = fromISODate(DEMO_DATA_START)
  const finalDate = fromISODate(DEMO_TODAY)
  let sequence = 0

  while (cursor <= finalDate) {
    const orderCount = weightedPick([1, 2, 3], [0.38, 0.44, 0.18])

    for (let index = 0; index < orderCount; index += 1) {
      const orderDate = addDays(cursor, randomInteger(0, 6))
      if (orderDate > finalDate) continue

      const firm = weightedPick(SAMPLE_FIRMS, [0.4, 0.34, 0.26])
      const customer = pick(CUSTOMERS_BY_FIRM[firm.id])
      const age = diffInDays(toISODate(orderDate), DEMO_TODAY)
      const status =
        age > 45
          ? weightedPick(
              ['pending', 'processing', 'confirmed', 'completed'],
              [0.1, 0.1, 0.12, 0.68],
            )
          : weightedPick(
              ['pending', 'processing', 'confirmed', 'completed'],
              [0.38, 0.22, 0.14, 0.26],
            )
      const amount = money(18_000 + random() * 320_000)

      sequence += 1
      orders.push({
        id: `order-${sequence}`,
        orderNumber: `SO-${orderDate.getFullYear()}-${String(sequence).padStart(4, '0')}`,
        date: toISODate(orderDate),
        customerId: customer.id,
        customerName: customer.name,
        firmId: firm.id,
        firmName: FIRM_NAME_BY_ID[firm.id],
        amount,
        status,
        itemCount: randomInteger(2, 9),
      })
    }

    cursor = addDays(cursor, 7)
  }
}

const ID_PREFIXES = {
  sale: 'INV',
  purchase: 'PUR',
  'payment-in': 'RCP',
  'payment-out': 'PAY',
  expense: 'EXP',
}

generateTransactions()
generateOrders()

transactions.sort((left, right) => {
  if (left.date === right.date) return left.type.localeCompare(right.type)
  return left.date.localeCompare(right.date)
})

const counters = {}

for (const transaction of transactions) {
  counters[transaction.type] = (counters[transaction.type] ?? 0) + 1
  transaction.id = `${ID_PREFIXES[transaction.type]}-${String(
    counters[transaction.type],
  ).padStart(4, '0')}`
}

orders.sort((left, right) => left.date.localeCompare(right.date))

export const DEMO_TRANSACTIONS = transactions
export const DEMO_ORDERS = orders
