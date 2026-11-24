/**
 * Expense service — CRUD over the central mock store.
 */
import { mockExpenses, mockTransactions, getAccounts, nextId } from '../../../core/store'
import { DEFAULT_FIRM_ID } from '../../../config/firms'
import { getActiveFirmId } from '../../../core/firmContextStore'

export function getExpenses() {
  const activeFirmId = getActiveFirmId()
  return activeFirmId ? mockExpenses.filter((expense) => expense.firmId === activeFirmId) : mockExpenses
}

export function getExpenseById(expenseId) {
  return getExpenses().find((entry) => entry.id === expenseId)
}

export function createExpense(expenseData) {
  const expense = {
    id: nextId('exp'),
    status: 'Paid',
    ...expenseData,
    firmId: getActiveFirmId() ?? expenseData.firmId ?? DEFAULT_FIRM_ID,
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
    accountId: expense.accountId ?? getAccounts()[0]?.id,
    customerId: null,
    productId: null,
    firmId: expense.firmId,
  })

  return { ...expense }
}

export function updateExpense(id, expenseData) {
  const expense = getExpenseById(id)
  if (!expense) throw new Error('Expense not found')
  const index = mockExpenses.findIndex((entry) => entry.id === id)
  const updated = { ...mockExpenses[index], ...expenseData, firmId: mockExpenses[index].firmId }
  mockExpenses[index] = updated
  return { ...updated }
}

export function deleteExpense(id) {
  const expense = getExpenseById(id)
  if (!expense) throw new Error('Expense not found')
  const index = mockExpenses.findIndex((entry) => entry.id === id)
  mockExpenses.splice(index, 1)
}

export const EXPENSE_STATUSES = ['Paid', 'Draft', 'Void', 'Refunded']

export function getExpenseTypes() {
  const types = [...new Set(getExpenses().map((expense) => expense.type))]
  return [...new Set([...types, 'Misc', 'Other'])]
}

export function getExpenseCategories() {
  const categories = [...new Set(getExpenses().map((expense) => expense.category))]
  return [...categories, 'Other']
}
