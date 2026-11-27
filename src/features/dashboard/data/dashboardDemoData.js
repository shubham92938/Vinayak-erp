import { isStabilityModeEnabled } from '../../../core/stabilityMode'
import {
  DEMO_CUSTOMERS as SEEDED_CUSTOMERS,
  DEMO_EXPENSES,
  DEMO_PRODUCTS as SEEDED_PRODUCTS,
  DEMO_PURCHASES,
  DEMO_SALES,
  DEMO_SALES_ORDERS,
  DEMO_TRANSACTIONS as SEEDED_TRANSACTIONS,
} from '../../../core/demoData'
import {
  STABILITY_PRODUCTS,
  STABILITY_TRANSACTIONS,
} from '../../../core/stabilityData'

export const DEMO_DATA_LABEL = 'Synthetic demo workspace data'
export const DEMO_DATA_NOTICE = 'Demo records are isolated by firm and can be replaced by connected API data.'
export const DEMO_TODAY = new Date().toISOString().slice(0, 10)
export const DEMO_DATA_START = '2026-04-01'

const STABILITY_MODE = isStabilityModeEnabled()

export const DEMO_CUSTOMERS = STABILITY_MODE ? [] : SEEDED_CUSTOMERS
export const DEMO_PRODUCTS = (STABILITY_MODE ? STABILITY_PRODUCTS : SEEDED_PRODUCTS).map((product) => ({
  id: product.id,
  firmId: product.firmId,
  name: product.name,
  code: product.code,
  stock: product.quantity ?? 0,
  minStock: product.minStock ?? 0,
  addedAt: String(product.createdAt ?? '2026-04-01').slice(0, 10),
  lowStockSince: product.quantity <= (product.minStock ?? 0) ? String(product.updatedAt ?? DEMO_TODAY).slice(0, 10) : null,
}))

function saleTransaction(sale) {
  const lines = (sale.items ?? []).map((item) => ({
    productId: item.productId,
    productName: item.name,
    productCode: item.code,
    quantity: Number(item.qty ?? 0),
    lineTotal: Number(item.qty ?? 0) * Number(item.price ?? 0),
  }))
  const costTotal = lines.reduce((sum, line) => {
    const product = SEEDED_PRODUCTS.find((entry) => entry.id === line.productId)
    return sum + line.quantity * Number(product?.buyingPrice ?? 0)
  }, 0)
  return {
    id: sale.id,
    firmId: sale.firmId,
    type: 'sale',
    date: String(sale.date).slice(0, 10),
    amount: Number(sale.total ?? 0),
    discount: Number(sale.discount ?? 0),
    costTotal,
    balanceDue: Number(sale.due ?? 0),
    paidAmount: Number(sale.paid ?? sale.advance ?? 0),
    partyId: sale.customerId ?? sale.customerName,
    party: sale.customerName,
    partyType: 'Customer',
    status: sale.status,
    dueDate: String(sale.date).slice(0, 10),
    lines,
  }
}

export const DEMO_TRANSACTIONS = STABILITY_MODE
  ? STABILITY_TRANSACTIONS.map((transaction) => ({
      ...transaction,
      date: String(transaction.date).slice(0, 10),
      balanceDue: 0,
      paidAmount: Math.max(0, Number(transaction.amount ?? 0)),
      party: transaction.description,
      partyId: transaction.customerId ?? transaction.id,
      partyType: transaction.customerId ? 'Customer' : 'Account',
      lines: [],
    }))
  : [
      ...DEMO_SALES.map(saleTransaction),
      ...DEMO_PURCHASES.map((purchase) => ({
        id: purchase.id,
        firmId: purchase.firmId,
        type: 'purchase',
        date: String(purchase.purchaseDate).slice(0, 10),
        amount: Number(purchase.total ?? 0),
        discount: Number(purchase.discount ?? 0),
        costTotal: 0,
        balanceDue: Number(purchase.due ?? 0),
        paidAmount: Number(purchase.paid ?? purchase.advance ?? 0),
        partyId: purchase.vendorName,
        party: purchase.vendorName,
        partyType: 'Supplier',
        status: purchase.status,
        dueDate: String(purchase.purchaseDate).slice(0, 10),
        lines: [],
      })),
      ...DEMO_EXPENSES.filter((expense) => expense.status === 'Paid').map((expense) => ({
        id: expense.id,
        firmId: expense.firmId,
        type: 'expense',
        date: String(expense.date).slice(0, 10),
        amount: Number(expense.amount ?? 0),
        discount: 0,
        costTotal: 0,
        balanceDue: 0,
        paidAmount: Number(expense.amount ?? 0),
        partyId: expense.id,
        party: expense.description,
        partyType: 'Expense',
        status: expense.status,
        dueDate: null,
        category: expense.category,
        lines: [],
      })),
      ...SEEDED_TRANSACTIONS.filter((transaction) => ['payment-in', 'payment-out'].includes(transaction.type)).map((transaction) => ({
        id: transaction.id,
        firmId: transaction.firmId,
        type: transaction.type,
        date: String(transaction.date).slice(0, 10),
        amount: Math.abs(Number(transaction.amount ?? 0)),
        discount: 0,
        costTotal: 0,
        balanceDue: 0,
        paidAmount: Math.abs(Number(transaction.amount ?? 0)),
        partyId: transaction.customerId ?? transaction.id,
        party: transaction.description,
        partyType: transaction.customerId ? 'Customer' : 'Supplier',
        status: 'Paid',
        dueDate: null,
        lines: [],
      })),
    ]

export const DEMO_ORDERS = STABILITY_MODE
  ? []
  : DEMO_SALES_ORDERS.map((order) => ({
      id: order.id,
      firmId: order.firmId,
      number: order.number,
      date: String(order.orderDate).slice(0, 10),
      party: order.customerName,
      total: order.total,
      status: String(order.status ?? '').toLowerCase(),
    }))
