/**
 * Expense service — CRUD over the central mock store.
 */
import { mockExpenses, mockTransactions, mockAccounts, nextId } from '../../../core/store'

export function getExpenses() {
  return mockExpenses
}

export function getExpenseById(expenseId) {
  return mockExpenses.find((entry) => entry.id === expenseId)
}

export function createExpense(expenseData) {
  const expense = {
    id: nextId('exp'),
    status: 'Paid',
    ...expenseData,
  }
  mockExpenses.push(expense)

  // Expenses appear in the financial transaction trail (P&L consumers).
  mockTransactions.push({
    id: nextId('txn'),
    type: 'expense',
    date: expense.date ?? new Date().toISOString(),
    amount: Number(expense.amount || 0),
    balance: 0,
    description: expense.description ?? `${expense.type} expense`,
    accountId: expense.accountId ?? mockAccounts[0]?.id,
    customerId: null,
    productId: null,
  })

  return { ...expense }
}

export function updateExpense(id, expenseData) {
  const expense = mockExpenses.find((entry) => entry.id === id)
  if (!expense) throw new Error('Expense not found')
  Object.assign(expense, expenseData)
  return { ...expense }
}

export function deleteExpense(id) {
  const index = mockExpenses.findIndex((entry) => entry.id === id)
  if (index === -1) throw new Error('Expense not found')
  mockExpenses.splice(index, 1)
}

export const EXPENSE_STATUSES = ['Paid', 'Draft', 'Void', 'Refunded']

export function getExpenseTypes() {
  const types = [...new Set(mockExpenses.map((expense) => expense.type))]
  return [...new Set([...types, 'Misc', 'Other'])]
}

export function getExpenseCategories() {
  const categories = [...new Set(mockExpenses.map((expense) => expense.category))]
  return [...categories, 'Other']
}
