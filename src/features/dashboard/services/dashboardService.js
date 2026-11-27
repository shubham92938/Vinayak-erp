/**
 * Dashboard service layer.
 *
 * The UI only depends on the shape returned by `fetchDashboardData`.
 * Today that shape is assembled from the imported record collections. When an
 * API is available, replace the internals of this file: keep the returned
 * shape and no dashboard component needs to change.
 */

import { getFirms } from '../../../core/firmStore'
import {
  DEMO_DATA_LABEL,
  DEMO_DATA_NOTICE,
  DEMO_ORDERS,
  DEMO_PRODUCTS,
  DEMO_TODAY,
  DEMO_TRANSACTIONS,
} from '../data/dashboardDemoData'
import {
  buildBuckets,
  formatRangeLabel,
  getBucketGranularity,
  getPreviousRange,
  isWithin,
} from '../utils/dateRange'

const DEMO_LATENCY = 220

function waitForDemoData() {
  return new Promise((resolve) => {
    window.setTimeout(resolve, DEMO_LATENCY)
  })
}

function filterTransactions(transactions, startDate, endDate, firmId, allowedFirmIds = null) {
  return transactions.filter((transaction) => {
    if (!isWithin(transaction.date, startDate, endDate)) return false
    if (firmId !== 'all' && transaction.firmId !== firmId) return false
    if (firmId === 'all' && allowedFirmIds && !allowedFirmIds.includes(transaction.firmId)) return false
    return true
  })
}

function sumBy(items, getValue) {
  return items.reduce((sum, item) => sum + getValue(item), 0)
}

function onlyOfType(transactions, type) {
  return transactions.filter((transaction) => transaction.type === type)
}

function inventoryStatus(product) {
  if (product.stock <= 0) return 'out'
  if (product.stock <= product.minStock) return 'low'
  return 'healthy'
}

function computeKpis(transactions, previousTransactions, { endDate, previousEndDate, firmId, allowedFirmIds }) {
  const sales = onlyOfType(transactions, 'sale')
  const previousSales = onlyOfType(previousTransactions, 'sale')
  const purchases = onlyOfType(transactions, 'purchase')
  const previousPurchases = onlyOfType(previousTransactions, 'purchase')
  const expenses = onlyOfType(transactions, 'expense')
  const previousExpenses = onlyOfType(previousTransactions, 'expense')

  const revenue = sumBy(sales, (sale) => sale.amount)
  const previousRevenue = sumBy(previousSales, (sale) => sale.amount)
  const grossSales = sumBy(sales, (sale) => sale.amount + sale.discount)
  const previousGrossSales = sumBy(
    previousSales,
    (sale) => sale.amount + sale.discount,
  )
  const cogs = sumBy(sales, (sale) => sale.costTotal)
  const previousCogs = sumBy(previousSales, (sale) => sale.costTotal)
  const expenseTotal = sumBy(expenses, (expense) => expense.amount)
  const previousExpenseTotal = sumBy(
    previousExpenses,
    (expense) => expense.amount,
  )

  const productsInScope = DEMO_PRODUCTS.filter((product) => {
    if (firmId !== 'all' && product.firmId !== firmId) return false
    if (firmId === 'all' && allowedFirmIds && !allowedFirmIds.includes(product.firmId)) return false
    return product.addedAt <= endDate
  })
  const previousProducts = DEMO_PRODUCTS.filter((product) => {
    if (firmId !== 'all' && product.firmId !== firmId) return false
    if (firmId === 'all' && allowedFirmIds && !allowedFirmIds.includes(product.firmId)) return false
    return product.addedAt <= previousEndDate
  })
  const lowStockProducts = productsInScope.filter((product) =>
    Boolean(product.lowStockSince && product.lowStockSince <= endDate),
  )
  const previousLowStockProducts = previousProducts.filter((product) =>
    Boolean(
      product.lowStockSince && product.lowStockSince <= previousEndDate,
    ),
  )

  return {
    totalSales: { value: grossSales, previous: previousGrossSales },
    totalPurchases: {
      value: sumBy(purchases, (purchase) => purchase.amount),
      previous: sumBy(previousPurchases, (purchase) => purchase.amount),
    },
    totalRevenue: { value: revenue, previous: previousRevenue },
    totalExpenses: {
      value: expenseTotal,
      previous: previousExpenseTotal,
    },
    grossProfit: {
      value: revenue - cogs,
      previous: previousRevenue - previousCogs,
    },
    netProfit: {
      value: revenue - cogs - expenseTotal,
      previous: previousRevenue - previousCogs - previousExpenseTotal,
    },
    outstandingReceivables: {
      value: sumBy(sales, (sale) => sale.balanceDue),
      previous: sumBy(previousSales, (sale) => sale.balanceDue),
    },
    outstandingPayables: {
      value: sumBy(purchases, (purchase) => purchase.balanceDue),
      previous: sumBy(previousPurchases, (purchase) => purchase.balanceDue),
    },
    totalProducts: {
      value: productsInScope.length,
      previous: previousProducts.length,
    },
    lowStockProducts: {
      value: lowStockProducts.length,
      previous: previousLowStockProducts.length,
    },
  }
}

function bucketValue(transactions, bucket, getValue) {
  return transactions.reduce((total, transaction) => {
    if (transaction.date < bucket.start || transaction.date > bucket.end) {
      return total
    }

    return total + getValue(transaction)
  }, 0)
}

function buildSalesOverview(transactions, previousTransactions, startDate, endDate) {
  const granularity = getBucketGranularity(startDate, endDate)
  const buckets = buildBuckets(startDate, endDate, granularity)
  const previousRange = getPreviousRange(startDate, endDate)
  const previousBuckets = buildBuckets(
    previousRange.start,
    previousRange.end,
    granularity,
  )
  const sales = onlyOfType(transactions, 'sale')
  const previousSales = onlyOfType(previousTransactions, 'sale')

  const points = buckets.map((bucket, index) => {
    const previousBucket =
      previousBuckets[index] ?? previousBuckets.at(-1)

    return {
      key: bucket.key,
      label: bucket.label,
      fullLabel: bucket.fullLabel,
      current: bucketValue(sales, bucket, (sale) => sale.amount),
      previous: previousBucket
        ? bucketValue(previousSales, previousBucket, (sale) => sale.amount)
        : 0,
    }
  })

  return {
    granularity,
    points,
    previousRangeLabel: formatRangeLabel(
      previousRange.start,
      previousRange.end,
    ),
  }
}

function buildRevenueExpense(transactions, startDate, endDate) {
  const granularity = getBucketGranularity(startDate, endDate)
  const buckets = buildBuckets(startDate, endDate, granularity)
  const sales = onlyOfType(transactions, 'sale')
  const expenses = onlyOfType(transactions, 'expense')

  return {
    granularity,
    points: buckets.map((bucket) => ({
      key: bucket.key,
      label: bucket.label,
      fullLabel: bucket.fullLabel,
      revenue: bucketValue(sales, bucket, (sale) => sale.amount),
      expenses: bucketValue(expenses, bucket, (expense) => expense.amount),
    })),
  }
}

function buildPaymentCollection(transactions, startDate, endDate) {
  const granularity = getBucketGranularity(startDate, endDate)
  const buckets = buildBuckets(startDate, endDate, granularity)
  const sales = onlyOfType(transactions, 'sale')
  const paymentsIn = onlyOfType(transactions, 'payment-in')

  const points = buckets.map((bucket) => {
    const collectedFromSales = bucketValue(
      sales,
      bucket,
      (sale) => sale.paidAmount,
    )
    const collectedFromPayments = bucketValue(
      paymentsIn,
      bucket,
      (payment) => payment.amount,
    )
    const pending = bucketValue(
      sales,
      bucket,
      (sale) => sale.balanceDue,
    )

    return {
      key: bucket.key,
      label: bucket.label,
      fullLabel: bucket.fullLabel,
      collected: collectedFromSales + collectedFromPayments,
      pending,
    }
  })

  const totals = points.reduce(
    (summary, point) => ({
      collected: summary.collected + point.collected,
      pending: summary.pending + point.pending,
    }),
    { collected: 0, pending: 0 },
  )
  const collectionBase = totals.collected + totals.pending

  return {
    granularity,
    points,
    totals: {
      ...totals,
      rate: collectionBase > 0 ? (totals.collected / collectionBase) * 100 : 0,
      paymentCount: paymentsIn.length,
    },
  }
}

function buildTopProducts(transactions) {
  const productPerformance = new Map()

  for (const sale of onlyOfType(transactions, 'sale')) {
    for (const line of sale.lines ?? []) {
      const current = productPerformance.get(line.productId) ?? {
        id: line.productId,
        name: line.productName,
        code: line.productCode,
        quantity: 0,
        revenue: 0,
        orderCount: 0,
      }

      current.quantity += line.quantity
      current.revenue += line.lineTotal
      current.orderCount += 1
      productPerformance.set(line.productId, current)
    }
  }

  return [...productPerformance.values()]
    .sort((left, right) => right.revenue - left.revenue)
    .slice(0, 6)
}

function buildFirmPerformance(startDate, endDate, selectedFirmId, firms, allowedFirmIds) {
  const transactions = filterTransactions(
    DEMO_TRANSACTIONS,
    startDate,
    endDate,
    'all',
    allowedFirmIds,
  )
  const previousRange = getPreviousRange(startDate, endDate)
  const previousTransactions = filterTransactions(
    DEMO_TRANSACTIONS,
    previousRange.start,
    previousRange.end,
    'all',
    allowedFirmIds,
  )

  const firmsInScope = selectedFirmId === 'all'
    ? firms
    : firms.filter((firm) => firm.id === selectedFirmId)

  return firmsInScope.map((firm) => {
    const firmSales = transactions.filter(
      (transaction) =>
        transaction.type === 'sale' && transaction.firmId === firm.id,
    )
    const previousFirmSales = previousTransactions.filter(
      (transaction) =>
        transaction.type === 'sale' && transaction.firmId === firm.id,
    )

    return {
      firmId: firm.id,
      firmName: firm.name,
      shortName: firm.name.replace('Vinayak ', ''),
      sales: sumBy(firmSales, (sale) => sale.amount),
      previousSales: sumBy(previousFirmSales, (sale) => sale.amount),
      invoiceCount: firmSales.length,
      selected: selectedFirmId === firm.id,
    }
  })
}

function buildInventory(firmId, endDate, firms, allowedFirmIds) {
  const items = DEMO_PRODUCTS.filter((product) => {
    if (firmId !== 'all' && product.firmId !== firmId) return false
    if (firmId === 'all' && allowedFirmIds && !allowedFirmIds.includes(product.firmId)) return false
    return product.addedAt <= endDate
  }).map((product) => {
    const firm = firms.find((item) => item.id === product.firmId)
    const status = inventoryStatus(product)

    return {
      ...product,
      firmName: firm?.name ?? product.firmId,
      status,
      shortfall: Math.max(product.minStock - product.stock, 0),
    }
  })

  const priority = { out: 0, low: 1, healthy: 2 }
  items.sort((left, right) => {
    if (priority[left.status] !== priority[right.status]) {
      return priority[left.status] - priority[right.status]
    }

    return left.stock / Math.max(left.minStock, 1) - right.stock / Math.max(right.minStock, 1)
  })

  return {
    items,
    total: items.length,
    attentionCount: items.filter((item) => item.status !== 'healthy').length,
  }
}

function buildTopCustomers(transactions) {
  const customers = new Map()

  for (const sale of onlyOfType(transactions, 'sale')) {
    const current = customers.get(sale.partyId) ?? {
      id: sale.partyId,
      name: sale.party,
      totalPurchases: 0,
      outstanding: 0,
      invoiceCount: 0,
    }

    current.totalPurchases += sale.amount
    current.outstanding += sale.balanceDue
    current.invoiceCount += 1
    customers.set(sale.partyId, current)
  }

  return [...customers.values()]
    .sort((left, right) => right.totalPurchases - left.totalPurchases)
    .slice(0, 5)
}

function buildPendingOrders(startDate, endDate, firmId, allowedFirmIds) {
  return DEMO_ORDERS.filter((order) => {
    if (!isWithin(order.date, startDate, endDate)) return false
    if (firmId !== 'all' && order.firmId !== firmId) return false
    if (firmId === 'all' && allowedFirmIds && !allowedFirmIds.includes(order.firmId)) return false
    return order.status !== 'completed'
  })
    .sort((left, right) => right.date.localeCompare(left.date))
    .slice(0, 6)
}

function buildUpcomingPayments(startDate, endDate, firmId, allowedFirmIds) {
  const unpaidInvoices = DEMO_TRANSACTIONS.filter((transaction) => {
    if (transaction.type !== 'sale' && transaction.type !== 'purchase') {
      return false
    }

    if (firmId !== 'all' && transaction.firmId !== firmId) return false
    if (firmId === 'all' && allowedFirmIds && !allowedFirmIds.includes(transaction.firmId)) return false
    if (transaction.balanceDue <= 0) return false
    if (!transaction.dueDate) return false

    return isWithin(transaction.dueDate, startDate, endDate)
  })

  return unpaidInvoices
    .sort((left, right) => left.dueDate.localeCompare(right.dueDate))
    .slice(0, 6)
    .map((invoice) => ({
      id: invoice.id,
      party: invoice.party,
      partyType: invoice.partyType,
      dueDate: invoice.dueDate,
      amount: invoice.balanceDue,
      paymentType:
        invoice.type === 'sale' ? 'Receivable' : 'Payable',
      status: invoice.dueDate < DEMO_TODAY ? 'overdue' : 'upcoming',
      firmName: invoice.firmName,
    }))
}

function buildTransactionRows(transactions) {
  return [...transactions]
    .sort((left, right) => {
      if (left.date === right.date) return right.id.localeCompare(left.id)
      return right.date.localeCompare(left.date)
    })
    .map((transaction) => ({
      id: transaction.id,
      date: transaction.date,
      type: transaction.type,
      party: transaction.party,
      partyType: transaction.partyType,
      firmId: transaction.firmId,
      firmName: transaction.firmName,
      amount: transaction.amount,
      paidAmount: transaction.paidAmount,
      balanceDue: transaction.balanceDue,
      status: transaction.status,
      dueDate: transaction.dueDate,
      method: transaction.method ?? null,
      category: transaction.category ?? null,
      lineCount: transaction.lines?.length ?? 0,
    }))
}

export async function fetchDashboardData({
  startDate,
  endDate,
  firmId = 'all',
  financialYear,
  firms = getFirms(),
}) {
  await waitForDemoData()

  const allowedFirmIds = firms.map((firm) => firm.id)
  if (firmId !== 'all' && !allowedFirmIds.includes(firmId)) {
    throw new Error('You do not have access to the selected firm')
  }
  const effectiveFirmId = firmId
  const previousRange = getPreviousRange(startDate, endDate)
  const transactions = filterTransactions(
    DEMO_TRANSACTIONS,
    startDate,
    endDate,
    effectiveFirmId,
    allowedFirmIds,
  )
  const previousTransactions = filterTransactions(
    DEMO_TRANSACTIONS,
    previousRange.start,
    previousRange.end,
    effectiveFirmId,
    allowedFirmIds,
  )

  return {
    meta: {
      label: DEMO_DATA_LABEL,
      notice: DEMO_DATA_NOTICE,
      source: 'synthetic-demo-data',
    },
    scope: {
      startDate,
      endDate,
      firmId: effectiveFirmId,
      financialYear,
      rangeLabel: formatRangeLabel(startDate, endDate),
      previousRangeLabel: formatRangeLabel(
        previousRange.start,
        previousRange.end,
      ),
    },
    lastUpdated: new Date().toISOString(),
    kpis: computeKpis(transactions, previousTransactions, {
      endDate,
      previousEndDate: previousRange.end,
      firmId: effectiveFirmId,
      allowedFirmIds,
    }),
    salesOverview: buildSalesOverview(
      transactions,
      previousTransactions,
      startDate,
      endDate,
    ),
    revenueExpense: buildRevenueExpense(transactions, startDate, endDate),
    paymentCollection: buildPaymentCollection(
      transactions,
      startDate,
      endDate,
    ),
    topProducts: buildTopProducts(transactions),
    firmPerformance: buildFirmPerformance(startDate, endDate, effectiveFirmId, firms, allowedFirmIds),
    inventory: buildInventory(effectiveFirmId, endDate, firms, allowedFirmIds),
    topCustomers: buildTopCustomers(transactions),
    pendingOrders: buildPendingOrders(startDate, endDate, effectiveFirmId, allowedFirmIds),
    upcomingPayments: buildUpcomingPayments(startDate, endDate, effectiveFirmId, allowedFirmIds),
    transactions: buildTransactionRows(transactions),
  }
}
