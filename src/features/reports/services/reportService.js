/**
 * Report aggregation helpers — reads from the central stores.
 */
import { getSales } from '../../../core/salesStore'
import { getPurchases } from '../../../core/financeStore'
import { mockStockMovements, getStockMovements } from '../../../core/store'
import { mockTransactions, mockAccounts, getCustomers, formatMoney } from '../../../core/store'
import { getProducts } from '../../products/services/productService'

export function getSalesReport(filters = {}) {
  const sales = getSales(filters)
  const byMonth = {}
  sales.forEach((sale) => {
    const month = String(sale.saleDate ?? sale.date ?? '').slice(0, 7)
    const entry = byMonth[month] ?? { month, count: 0, total: 0, revenue: 0 }
    entry.count += 1
    entry.total += Number(sale.total ?? 0)
    entry.revenue += Number(sale.total ?? 0)
    byMonth[month] = entry
  })
  return Object.values(byMonth).sort((a, b) => a.month.localeCompare(b.month))
}

export function getTopProductsByRevenue() {
  const totals = {}
  getSales().forEach((sale) => {
    (sale.items ?? []).forEach((item) => {
      const id = item.productId ?? item.name ?? 'Other'
      const amount = Number(item.qty ?? 0) * Number(item.price ?? 0)
      totals[id] = (totals[id] ?? 0) + amount
    })
  })
  return Object.entries(totals)
    .map(([id, value]) => ({ id, name: getProducts().find((product) => product.id === id)?.name ?? id, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)
}

export function getPurchaseReport() {
  const purchases = getPurchases()
  const byMonth = {}
  purchases.forEach((purchase) => {
    const month = String(purchase.purchaseDate ?? purchase.date ?? '').slice(0, 7)
    const entry = byMonth[month] ?? { month, count: 0, total: 0 }
    entry.count += 1
    entry.total += Number(purchase.total ?? 0)
    byMonth[month] = entry
  })
  return Object.values(byMonth).sort((a, b) => a.month.localeCompare(b.month))
}

export function getTopVendorsBySpend() {
  const totals = {}
  getPurchases().forEach((purchase) => {
    const vendor = purchase.vendorName ?? 'Other'
    totals[vendor] = (totals[vendor] ?? 0) + Number(purchase.total ?? 0)
  })
  return Object.entries(totals)
    .map(([vendor, value]) => ({ vendor, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)
}

export function getInventoryReport() {
  const products = getProducts()
  const movements = mockStockMovements
  return products.map((product) => {
    const rows = movements.filter((movement) => movement.productId === product.id)
    const movedIn = rows.filter((movement) => movement.type === 'in').reduce((sum, row) => sum + Number(row.qty ?? 0), 0)
    const movedOut = rows.filter((movement) => movement.type === 'out').reduce((sum, row) => sum + Number(row.qty ?? 0), 0)
    const adjusted = rows.filter((movement) => movement.type === 'adjustment').reduce((sum, row) => sum + Number(row.qty ?? 0), 0)
    return {
      productId: product.id,
      productName: product.name,
      movedIn,
      movedOut,
      adjusted,
      netChange: movedIn - movedOut + adjusted,
      currentStock: product.stock ?? 0,
    }
  })
}

export function getFinancialReport() {
  const byAccount = {}
  mockTransactions.forEach((txn) => {
    const account = txn.accountId ?? 'Other'
    const entry = byAccount[account] ?? { accountId: account, totalCredit: 0, totalDebit: 0, net: 0 }
    const amount = Number(txn.amount ?? 0)
    if (amount >= 0) {
      entry.totalCredit += amount
      entry.net += amount
    } else {
      entry.totalDebit += Math.abs(amount)
      entry.net += amount
    }
    byAccount[account] = entry
  })
  return Object.values(byAccount).map((entry) => ({
    ...entry,
    accountName: mockAccounts.find((account) => account.id === entry.accountId)?.name ?? entry.accountId,
  }))
}

export function getFinancialSummary() {
  return mockTransactions.reduce(
    (acc, txn) => {
      const amount = Number(txn.amount ?? 0)
      if (amount >= 0) acc.credit += amount
      else acc.debit += Math.abs(amount)
      if (txn.type === 'sale') acc.sales += Math.abs(amount)
      if (txn.type === 'purchase') acc.purchases += Math.abs(amount)
      if (txn.type === 'expense') acc.expenses += Math.abs(amount)
      return acc
    },
    { credit: 0, debit: 0, sales: 0, purchases: 0, expenses: 0 },
  )
}

export function getCustomerLedgerReport() {
  return getCustomers().map((customer) => ({
    customerId: customer.id,
    name: customer.name,
    openingBalance: Number(customer.openingBalance ?? 0),
    currentBalance: Number(customer.openingBalance ?? 0) - Number(customer.due ?? 0),
    outstanding: Number(customer.due ?? 0),
  })).filter((entry) => entry.outstanding > 0)
}
