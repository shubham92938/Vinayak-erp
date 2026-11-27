/**
 * Expense service — CRUD over the central mock store.
 */
import { mockExpenses, mockTransactions, getAccounts, nextId } from '../../../core/store'
import { DEFAULT_FIRM_ID } from '../../../config/firms'
import { getActiveFirmId } from '../../../core/firmContextStore'

const POSTED_EXPENSE_STATUS = 'Paid'

export function getExpenses() {
  const activeFirmId = getActiveFirmId()
  return activeFirmId ? mockExpenses.filter((expense) => expense.firmId === activeFirmId) : mockExpenses
}

export function getExpenseById(expenseId) {
  return getExpenses().find((entry) => entry.id === expenseId)
}

function isPosted(expense) {
  return expense.status === POSTED_EXPENSE_STATUS
}

function amountOf(expense) {
  return Math.abs(Number(expense.amount ?? 0))
}

function roundMoney(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100
}

function getExpenseAccounts(expense) {
  const activeFirmId = getActiveFirmId()
  return getAccounts().filter((account) =>
    (!activeFirmId || account.firmId === activeFirmId) &&
    (!expense.firmId || account.firmId === expense.firmId),
  )
}

function getAccountForExpense(expense) {
  const accounts = getExpenseAccounts(expense)
  if (expense.accountId) return accounts.find((account) => account.id === expense.accountId) ?? null

  const mode = String(expense.mode ?? '').toLowerCase()
  const accountType = mode.includes('bank') ? 'bank' : mode.includes('upi') || mode.includes('digital') ? 'digital' : mode.includes('cash') ? 'cash' : null
  return accounts.find((account) => account.type === accountType) ?? accounts[0] ?? null
}

function adjustAccountBalance(accountId, delta, firmId) {
  if (!accountId) return
  const account = getExpenseAccounts({ firmId }).find((entry) => entry.id === accountId)
  if (account) account.balance = roundMoney(account.balance + delta)
}

function addExpenseTransaction(expense) {
  const account = getAccountForExpense(expense)
  const amount = amountOf(expense)
  if (account && !expense.accountId) expense.accountId = account.id
  if (account) account.balance = roundMoney(account.balance - amount)

  const transaction = {
    id: nextId('txn'),
    expenseId: expense.id,
    type: 'expense',
    date: expense.date ?? new Date().toISOString(),
    amount: -amount,
    balance: account?.balance ?? 0,
    description: expense.description ?? `${expense.type} expense`,
    accountId: account?.id ?? expense.accountId,
    customerId: null,
    productId: null,
    firmId: expense.firmId,
  }
  mockTransactions.push(transaction)
  return transaction
}

export function createExpense(expenseData) {
  const expense = {
    id: nextId('exp'),
    status: 'Paid',
    ...expenseData,
    firmId: getActiveFirmId() ?? expenseData.firmId ?? DEFAULT_FIRM_ID,
  }
  mockExpenses.push(expense)

  // Only posted expenses affect account balances and the financial trail.
  // Draft, void, and refunded records remain visible in the expense register
  // without being counted as cash movement.
  if (isPosted(expense)) addExpenseTransaction(expense)

  return { ...expense }
}

export function updateExpense(id, expenseData) {
  const expense = getExpenseById(id)
  if (!expense) throw new Error('Expense not found')
  const index = mockExpenses.findIndex((entry) => entry.id === id && (!getActiveFirmId() || entry.firmId === getActiveFirmId()))
  if (index === -1) throw new Error('Expense not found')

  const updated = { ...mockExpenses[index], ...expenseData, firmId: mockExpenses[index].firmId }
  const previous = mockExpenses[index]
  const previousPosted = isPosted(previous)
  const nextPosted = isPosted(updated)

  const transactionIndex = mockTransactions.findIndex((transaction) => transaction.expenseId === id)
  if (previousPosted) adjustAccountBalance(previous.accountId, amountOf(previous), previous.firmId)
  if (nextPosted) {
    const nextAccount = getAccountForExpense(updated)
    updated.accountId = updated.accountId ?? nextAccount?.id
    if (transactionIndex !== -1) adjustAccountBalance(updated.accountId, -amountOf(updated), updated.firmId)
  }
  mockExpenses[index] = updated

  if (nextPosted) {
    const transaction = transactionIndex === -1 ? addExpenseTransaction(updated) : mockTransactions[transactionIndex]
    if (transactionIndex !== -1) {
      mockTransactions[transactionIndex] = {
        ...transaction,
        date: updated.date ?? transaction.date,
        amount: -amountOf(updated),
        description: updated.description ?? `${updated.type} expense`,
        accountId: updated.accountId,
        balance: getAccounts().find((account) => account.id === updated.accountId)?.balance ?? transaction.balance,
        firmId: updated.firmId,
      }
    }
  } else if (transactionIndex !== -1) {
    mockTransactions.splice(transactionIndex, 1)
  }

  return { ...updated }
}

export function deleteExpense(id) {
  const expense = getExpenseById(id)
  if (!expense) throw new Error('Expense not found')
  const index = mockExpenses.findIndex((entry) => entry.id === id && (!getActiveFirmId() || entry.firmId === getActiveFirmId()))
  if (index === -1) throw new Error('Expense not found')

  if (isPosted(expense)) adjustAccountBalance(expense.accountId, amountOf(expense), expense.firmId)
  mockExpenses.splice(index, 1)

  const transactionIndex = mockTransactions.findIndex((transaction) => transaction.expenseId === id)
  if (transactionIndex !== -1) mockTransactions.splice(transactionIndex, 1)
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
