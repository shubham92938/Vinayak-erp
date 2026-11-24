import { useState } from 'react'
import { Button, Card, CardBody, Select, useToast } from '../../../components/ui'
import { DataTable } from '../../../components/data-table'
import { downloadCsv } from '../../../utils/csv'
import { mockTransactions, formatMoney, formatDate } from '../../../core/store'

import { DateRangeFilter } from '../../../components/filters'

const COLUMNS = [
  { key: 'date', label: 'Date' },
  { key: 'id', label: 'Transaction ID' },
  { key: 'type', label: 'Type' },
  { key: 'accountId', label: 'Account' },
  { key: 'description', label: 'Description' },
  { key: 'debit', label: 'Debit' },
  { key: 'credit', label: 'Credit' },
  { key: 'balance', label: 'Balance' },
  { key: 'customerId', label: 'Customer' },
  { key: 'productId', label: 'Product' },
]

const TYPE_FILTERS = [
  { value: 'all', label: 'All types' },
  { value: 'sale', label: 'Sales' },
  { value: 'purchase', label: 'Purchases' },
  { value: 'expense', label: 'Expenses' },
  { value: 'transfer', label: 'Transfers' },
  { value: 'payment-in', label: 'Payment In' },
  { value: 'payment-out', label: 'Payment Out' },
]

const ACCOUNT_LABELS = {
  'acc-cash-1': 'Cash in Hand',
  'acc-bank-1': 'Vinayak Associates Current',
  'acc-bank-2': 'Vinayak Associates Savings',
  'acc-bank-3': 'Vinayak Traders Account',
}

export default function TransactionsPage() {
  const [filters, setFilters] = useState({ search: '', type: 'all', fromDate: '', toDate: '' })
  const toast = useToast()

  const transactions = mockTransactions.filter((txn) => {
    if (filters.type !== 'all' && txn.type !== filters.type) return false
    const start = String(filters.fromDate ?? '').slice(0, 10)
    const end = String(filters.toDate ?? '').slice(0, 10)
    const txnDate = String(txn.date ?? '').slice(0, 10)
    if (start && txnDate < start) return false
    if (end && txnDate > end) return false
    const query = String(filters.search ?? '').trim().toLowerCase()
    if (query && !`${txn.id} ${txn.description}`.toLowerCase().includes(query)) return false
    return true
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const totalCredit = transactions.reduce((sum, txn) => sum + (txn.amount > 0 ? txn.amount : 0), 0)
  const totalDebit = transactions.reduce((sum, txn) => sum + (txn.amount < 0 ? -txn.amount : 0), 0)

  const exportCsv = () => {
    downloadCsv({
      filename: 'vinayak-transactions.csv',
      columns: COLUMNS,
      rows: transactions.map((txn) => ({
        date: txn.date,
        id: txn.id,
        type: txn.type,
        accountId: ACCOUNT_LABELS[txn.accountId] ?? txn.accountId,
        description: txn.description,
        debit: txn.type === 'payment-out' ? Math.abs(txn.amount) : 0,
        credit: txn.type !== 'payment-out' && txn.amount > 0 ? txn.amount : 0,
        balance: txn.balance,
        customerId: txn.customerId,
        productId: txn.productId,
      })),
    })
  }

  return (
    <div className="transactions-page">
      <header className="transactions-header">
        <div className="transactions-header__top">
          <div className="transactions-header__text">
            <p className="transactions-header__eyebrow"><span aria-hidden="true">#</span> Transactions</p>
            <h1 className="transactions-header__title">Transactions</h1>
            <p className="transactions-header__description">Account movement history with balances. Demo data.</p>
          </div>
          <div className="transactions-header__actions">
            <Button variant="secondary" onClick={exportCsv}>Export CSV</Button>
          </div>
        </div>
        <div className="transactions-kpi-grid">
          <KpiCard label="Total Credit" value={formatMoney(totalCredit)} />
          <KpiCard label="Total Debit" value={formatMoney(totalDebit)} />
          <KpiCard label="Transactions" value={transactions.length} />
        </div>
      </header>

      <DataTable
        data={transactions}
        columns={buildColumns()}
        getRowId={(txn) => txn.id}
        search={filters.search}
        onSearchChange={(search) => setFilters((current) => ({ ...current, search }))}
        searchPlaceholder="Search transaction ID or description..."
        minWidth={880}
        selectable
        filtersActive={Boolean(filters.search || filters.type !== 'all' || filters.fromDate || filters.toDate)}
        filters={
          <div className="transactions-filters">
            <Select
              label="Type"
              options={TYPE_FILTERS}
              value={filters.type}
              onChange={(event) => setFilters((current) => ({ ...current, type: event.target.value }))}
            />
            <DateRangeFilter
              label="Date Range"
              value={{ preset: filters.fromDate || filters.toDate ? 'custom' : 'all', start: filters.fromDate, end: filters.toDate }}
              onChange={({ start, end }) => setFilters((current) => ({ ...current, fromDate: start ?? '', toDate: end ?? '' }))}
            />
          </div>
        }
        onClearFilters={() => setFilters({ search: '', type: 'all', fromDate: '', toDate: '' })}
      />
    </div>
  )
}

function buildColumns() {
  return [
    { id: 'date', header: 'Date', accessor: 'date', width: '110px', cell: (row) => <span className="transactions-date">{formatDate(row.date)}</span> },
    { id: 'id', header: 'Transaction ID', accessor: 'id', width: '110px' },
    { id: 'type', header: 'Type', accessor: 'type', width: '120px', cell: (row) => <BadgeBadge row={row} /> },
    { id: 'accountId', header: 'Account', accessor: 'accountId', width: '180px' },
    { id: 'description', header: 'Description', accessor: 'description', minWidth: '220px' },
    { id: 'amount', header: 'Amount', accessor: 'amount', width: '120px', align: 'right', cell: (row) => <span className={`transactions-money ${row.type === 'expense' ? 'danger' : 'success'}`}>{formatMoney(row.amount)}</span> },
    { id: 'balance', header: 'Balance', accessor: 'balance', width: '120px', align: 'right', cell: (row) => <span className="transactions-money">{formatMoney(row.balance)}</span> },
    { id: 'customerId', header: 'Customer', accessor: 'customerId', width: '110px' },
    { id: 'productId', header: 'Product', accessor: 'productId', width: '90px' },
  ]
}

function BadgeBadge({ row }) {
  const variant = row.type === 'sale' ? 'success' : row.type === 'purchase' ? 'info' : row.type === 'expense' ? 'danger' : row.type === 'transfer' ? 'info' : 'neutral'
  return <Badge variant={variant} size="sm">{row.type}</Badge>
}

function KpiCard({ label, value }) {
  return (
    <div className="transactions-kpi-card">
      <span className="transactions-kpi-card__label">{label}</span>
      <span className="transactions-kpi-card__value">{value}</span>
    </div>
  )
}

import { Badge } from '../../../components/ui'

export function formatMoneyT(amount) {
  return formatMoney(amount)
}
