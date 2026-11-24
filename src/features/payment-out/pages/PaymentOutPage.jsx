import { useState } from 'react'
import { Button, Card, CardBody, Select, useToast } from '../../../components/ui'
import { FormActions, FormField, FormGrid, FormInput, FormSection } from '../../../components/forms'
import { DataTable } from '../../../components/data-table'
import { getPaymentsOut, recordPaymentOutFinance, mockAccounts, mockExpenses, formatMoney, formatDate, getPurchases } from '../../../core/financeStore'
import { getCustomers } from '../../../core/store'
import '../styles/paymentOut.css'

const MODES = [
  { value: 'Cash', label: 'Cash' },
  { value: 'Bank Transfer', label: 'Bank Transfer' },
  { value: 'UPI / Digital Wallet', label: 'UPI / Digital Wallet' },
]

const EXPENSE_TYPES = ['Rent', 'Travel', 'Internet', 'Telephone', 'Repairs', 'Misc', 'Other']

export default function PaymentOutPage() {
  const toast = useToast()

  return (
    <div className="payment-out-page">
      <PaymentOutList toast={toast} />
      <PaymentOutForm toast={toast} />
    </div>
  )
}

function PaymentOutList({ toast }) {
  const payments = getPaymentsOut()

  const columns = [
    { id: 'date', header: 'Date', accessor: 'date', width: '110px', cell: (row) => <span className="payment-out-date">{formatDate(row.date)}</span> },
    { id: 'purchaseId', header: 'Purchase', accessor: 'purchaseId', width: '110px' },
    { id: 'vendorName', header: 'Vendor / Expense', accessor: 'vendorName', width: '170px' },
    { id: 'amount', header: 'Amount', accessor: 'amount', width: '110px', align: 'right', cell: (row) => <span className="payment-out-money">{formatMoney(row.amount)}</span> },
    { id: 'mode', header: 'Mode', accessor: 'mode', width: '150px' },
    { id: 'accountId', header: 'Account', accessor: 'accountId', width: '140px' },
    { id: 'notes', header: 'Notes', accessor: 'notes', minWidth: '180px' },
  ]

  const total = payments.reduce((sum, payment) => sum + payment.amount, 0)

  return (
    <>
      <header className="payment-out-header">
        <div className="payment-out-header__top">
          <div className="payment-out-header__text">
            <p className="payment-out-header__eyebrow"><span aria-hidden="true">#</span> Payment Out</p>
            <h1 className="payment-out-header__title">Payments to Vendors & Expenses</h1>
            <p className="payment-out-header__description">Record payments to vendors, purchases or expenses. Updates account balances.</p>
          </div>
          <div className="payment-out-header__actions">
            <Button size="sm" variant="secondary" onClick={() => { window.location.reload() }}>Refresh</Button>
          </div>
        </div>
        <div className="payment-out-kpi-grid">
          <div className="payment-out-kpi-card">
            <span className="payment-out-kpi-card__label">Total Payments</span>
            <span className="payment-out-kpi-card__value">{formatMoney(total)}</span>
          </div>
          <div className="payment-out-kpi-card">
            <span className="payment-out-kpi-card__label">Recorded</span>
            <span className="payment-out-kpi-card__value">{payments.length}</span>
          </div>
        </div>
      </header>

      <DataTable
        data={payments}
        columns={columns}
        getRowId={(payment) => payment.id}
        searchPlaceholder="Search payment or vendor..."
        minWidth={900}
        initialPageSize={10}
      />
    </>
  )
}

function PaymentOutForm({ toast }) {
  const [form, setForm] = useState({
    vendorId: '',
    sourceType: 'purchase',
    sourceId: '',
    expenseType: '',
    date: new Date().toISOString().slice(0, 16),
    amount: 0,
    mode: 'Cash',
    accountId: mockAccounts[0].id,
    notes: '',
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const customers = getCustomers().filter((customer) => customer.vendorName)
  const openPurchases = getPurchases().filter((purchase) => purchase.due > 0 && purchase.status !== 'Paid')

  const availableSources = form.sourceType === 'purchase'
    ? openPurchases.filter((purchase) => !form.vendorId || purchase.vendorName === form.vendorId)
    : mockExpenses.filter((expense) => expense.type === form.expenseType)

  const validate = () => {
    const nextErrors = {}
    if (!form.vendorId) nextErrors.vendorId = 'Select a vendor or expense type'
    if (!form.sourceId) nextErrors.sourceId = 'Select a source'
    if (!form.amount || Number(form.amount) <= 0) nextErrors.amount = 'Enter an amount greater than 0'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setIsSubmitting(true)

    if (!validate()) {
      toast.error('Please complete the required fields')
      setIsSubmitting(false)
      return
    }

    const source = availableSources.find((entry) => entry.number === form.sourceId || entry.id === form.sourceId)
    if (form.sourceType === 'purchase' && source && Number(form.amount) > (source.due ?? 0)) {
      toast.error(`Amount exceeds outstanding ₹${formatMoney(source.due ?? 0)}`)
      setIsSubmitting(false)
      return
    }

    try {
      const vendorName = form.vendorId
        || source?.vendorName
        || (form.sourceType === 'expense' ? form.expenseType : 'Vendor')
      recordPaymentOutFinance({
        purchaseId: form.sourceType === 'purchase' ? (source?.number ?? form.sourceId) : null,
        expenseId: form.sourceType === 'expense' ? source?.id : null,
        vendorName,
        amount: Number(form.amount),
        mode: form.mode,
        accountId: form.accountId,
        notes: form.notes,
      })
      toast.success(`Payment of ₹${formatMoney(Number(form.amount))} recorded. Account updated.`)
      setForm((current) => ({ ...current, amount: 0, notes: '' }))
    } catch (error) {
      toast.error(error.message ?? 'Could not record payment')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="payment-out-card">
      <CardBody>
        <h3 className="payment-out-title">Record Payment Out</h3>
        <form className="payment-out-form" onSubmit={handleSubmit} noValidate>
          <FormSection>
            <FormGrid>
              <FormField label="Vendor (or Expense Type)" error={errors.vendorId} required>
                <Select
                  value={form.vendorId}
                  onChange={(event) => setForm((current) => ({ ...current, vendorId: event.target.value, sourceType: event.target.value ? 'purchase' : form.sourceType }))}
                  options={[
                    { value: '', label: 'Select vendor...' },
                    ...customers.map((customer) => ({ value: customer.id, label: customer.name })),
                    { value: 'EXPENSES', label: '--- Expenses ---' },
                    ...EXPENSE_TYPES.map((type) => ({ value: type, label: type })),
                  ]}
                  placeholder="Select vendor"
                />
              </FormField>
              <FormField label="Source" error={errors.sourceId} required hint={form.sourceType === 'purchase' ? 'Outstanding purchases for the selected vendor' : 'Expenses of the selected type'}>
                <Select
                  value={form.sourceId}
                  onChange={(event) => setForm((current) => ({ ...current, sourceId: event.target.value }))}
                  options={form.sourceType === 'purchase'
                    ? [{ value: '', label: 'Select purchase...' }, ...openPurchases
                        .filter((purchase) => !form.vendorId || purchase.vendorName === form.vendorId)
                        .map((purchase) => ({ value: purchase.number, label: `${purchase.number} — Due ${formatMoney(purchase.due ?? 0)}` }))]
                    : [{ value: '', label: 'Select expense...' }, ...mockExpenses
                        .filter((expense) => expense.type === form.expenseType)
                        .map((expense) => ({ value: expense.id, label: `${expense.id} — ${expense.description} (${formatMoney(expense.amount)})` }))]}
                  placeholder="Select source"
                />
              </FormField>
              <FormField label="Payment Date">
                <FormInput type="date" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} />
              </FormField>
              <FormField label="Amount" error={errors.amount} required>
                <FormInput type="number" min="0" step="0.01" value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))} placeholder="0.00" />
              </FormField>
              <FormField label="Payment Mode" required>
                <Select value={form.mode} onChange={(event) => setForm((current) => ({ ...current, mode: event.target.value }))} options={MODES} />
              </FormField>
              <FormField label="Account" required>
                <Select value={form.accountId} onChange={(event) => setForm((current) => ({ ...current, accountId: event.target.value }))} options={mockAccounts.map((account) => ({ value: account.id, label: account.name }))} />
              </FormField>
            </FormGrid>
            <FormField label="Notes" optional>
              <FormInput value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} placeholder="NEFT ref, cash received..." />
            </FormField>
            <FormActions>
              <Button type="submit" variant="primary" disabled={isSubmitting}>Record Payment</Button>
            </FormActions>
          </FormSection>
        </form>
      </CardBody>
    </Card>
  )
}
