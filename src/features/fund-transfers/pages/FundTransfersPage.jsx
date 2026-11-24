import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, CardBody, Select, useToast } from '../../../components/ui'
import { FormActions, FormField, FormSection } from '../../../components/forms'
import { DataTable } from '../../../components/data-table'
import { mockTransactions, mockAccounts, formatMoney, formatDate } from '../../../core/store'
import { recordFundTransfer } from '../../../core/financeStore'
import '../styles/fundTransfers.css'

export default function FundTransfersPage() {
  const toast = useToast()
  const navigate = useNavigate()

  return (
    <div className="fund-transfers-page">
      <TransferForm toast={toast} navigate={navigate} />
      <TransfersTable />
    </div>
  )
}

function TransferForm({ toast }) {
  const [fromAccountId, setFromAccountId] = useState('')
  const [toAccountId, setToAccountId] = useState('')
  const [amount, setAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState({})

  const accounts = mockAccounts

  const accountName = (accountId) => accounts.find((account) => account.id === accountId)?.name ?? ''

  const validate = () => {
    const nextErrors = {}
    if (!fromAccountId) nextErrors.fromAccountId = 'Select a source account'
    if (!toAccountId) nextErrors.toAccountId = 'Select a destination account'
    if (fromAccountId === toAccountId) nextErrors.toAccountId = 'Transfer must be between different accounts'
    if (!amount || Number(amount) <= 0) nextErrors.amount = 'Enter an amount greater than 0'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!validate()) {
      toast.error('Please complete the required fields')
      return
    }

    const from = accounts.find((account) => account.id === fromAccountId)
    const amountNumber = Number(amount)
    if (from && amountNumber > from.balance) {
      toast.error(`Insufficient funds. Available: ₹${formatMoney(from.balance)}`)
      return
    }

    try {
      recordFundTransfer({ fromAccountId, toAccountId, amount: amountNumber, notes })
      toast.success(`₹${formatMoney(amountNumber)} transferred to ${accountName(toAccountId)}`)
      setAmount('')
      setNotes('')
    } catch (error) {
      toast.error(error.message ?? 'Could not complete transfer')
    }
  }

  return (
    <Card className="fund-transfers-card">
      <CardBody>
        <h3 className="fund-transfers-title">New Fund Transfer</h3>
        <form className="fund-transfers-form" onSubmit={handleSubmit} noValidate>
          <div className="fund-transfers-grid">
            <FormField label="From Account" error={errors.fromAccountId} required>
              <Select
                value={fromAccountId}
                onChange={(event) => setFromAccountId(event.target.value)}
                options={accounts.map((account) => ({ value: account.id, label: `${account.name} — ₹${formatMoney(account.balance)}` }))}
                placeholder="Select source account"
              />
            </FormField>
            <FormField label="To Account" error={errors.toAccountId} required>
              <Select
                value={toAccountId}
                onChange={(event) => setToAccountId(event.target.value)}
                options={accounts.map((account) => ({ value: account.id, label: `${account.name} — ₹${formatMoney(account.balance)}` }))}
                placeholder="Select destination account"
              />
            </FormField>
            <FormField label="Amount" error={errors.amount} required>
              <input
                type="number"
                min="0"
                step="0.01"
                className="fund-transfers-amount"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0.00"
                aria-label="Transfer amount"
              />
            </FormField>
            <FormField label="Notes (optional)" optional>
              <input
                type="text"
                className="fund-transfers-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="eg. salary transfer, cash withdrawal"
                aria-label="Transfer notes"
              />
            </FormField>
          </div>
          {fromAccountId && toAccountId && fromAccountId !== toAccountId && (
            <p className="fund-transfers-hint">
              Available in {accountName(fromAccountId) || 'source'}: ₹{formatMoney(accounts.find((a) => a.id === fromAccountId)?.balance ?? 0)}
            </p>
          )}
          <FormActions>
            <Button type="submit" variant="primary">Transfer Fund</Button>
          </FormActions>
        </form>
      </CardBody>
    </Card>
  )
}

function TransfersTable() {
  const columns = [
    { id: 'date', header: 'Date', accessor: 'date', width: '110px', cell: (row) => <span className="fund-transfers-date">{formatDate(row.date)}</span> },
    { id: 'id', header: 'Transaction', accessor: 'id', width: '110px' },
    { id: 'description', header: 'Description', accessor: 'description', minWidth: '220px' },
    { id: 'fromAccount', header: 'From', accessor: 'accountId', width: '150px' },
    { id: 'amount', header: 'Amount', accessor: 'amount', width: '120px', align: 'right', cell: (row) => <span className="fund-transfers-money">{formatMoney(row.amount)}</span> },
  ]

  const rows = mockTransactions
    .filter((txn) => txn.type === 'transfer')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <Card className="fund-transfers-history">
      <CardBody>
        <h3 className="fund-transfers-title">Transfer History</h3>
        {rows.length === 0 ? (
          <p className="fund-transfers-empty">No transfers recorded yet.</p>
        ) : (
          <DataTable data={rows} columns={columns} getRowId={(txn) => txn.id} minWidth={600} />
        )}
      </CardBody>
    </Card>
  )
}
