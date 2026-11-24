import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, CardBody, Select, useToast } from '../../../components/ui'
import { FormActions, FormField, FormGrid, FormInput, FormSection } from '../../../components/forms'
import { DataTable } from '../../../components/data-table'
import { mockPaymentsIn, formatMoney, formatDate, recordPaymentInFinance, mockAccounts } from '../../../core/financeStore'
import { getSales } from '../../../core/salesStore'
import { getCustomers } from '../../../core/store'
import '../styles/paymentIn.css'

const MODES = [
  { value: 'Cash', label: 'Cash' },
  { value: 'Bank Transfer', label: 'Bank Transfer' },
  { value: 'UPI / Digital Wallet', label: 'UPI / Digital Wallet' },
]

export default function PaymentInPage() {
  const toast = useToast()
  const navigate = useNavigate()

  return (
    <div className="payment-in-page">
      <PaymentInList navigate={navigate} />
      <PaymentInForm toast={toast} navigate={navigate} />
    </div>
  )
}

function PaymentInList({ navigate }) {
  const payments = mockPaymentsIn

  const columns = [
    { id: 'date', header: 'Date', accessor: 'date', width: '110px', cell: (row) => <span className="payment-in-date">{formatDate(row.date)}</span> },
    { id: 'invoiceId', header: 'Invoice', accessor: 'invoiceId', width: '110px' },
    { id: 'customerId', header: 'Customer', accessor: 'customerId', width: '140px' },
    { id: 'amount', header: 'Amount', accessor: 'amount', width: '110px', align: 'right', cell: (row) => <span className="payment-in-money">{formatMoney(row.amount)}</span> },
    { id: 'mode', header: 'Mode', accessor: 'mode', width: '140px' },
    { id: 'accountId', header: 'Account', accessor: 'accountId', width: '140px' },
    { id: 'notes', header: 'Notes', accessor: 'notes', minWidth: '180px' },
    { id: 'actions', header: 'Actions', width: '70px', sortable: false, cell: (row) => <Button variant="ghost" onClick={() => navigate(`/sales/${row.invoiceId}`)}>View Invoice</Button> },
  ]

  const total = payments.reduce((sum, payment) => sum + payment.amount, 0)

  return (
    <>
      <header className="payment-in-header">
        <div className="payment-in-header__top">
          <div className="payment-in-header__text">
            <p className="payment-in-header__eyebrow"><span aria-hidden="true">#</span> Payment In</p>
            <h1 className="payment-in-header__title">Payments Received</h1>
            <p className="payment-in-header__description">Record customer payments received. Updates customer balances and accounts.</p>
          </div>
          <div className="payment-in-header__actions">
            <Button size="sm" variant="secondary" onClick={() => navigate('/balance')}>Account Balances</Button>
          </div>
        </div>
        <div className="payment-in-kpi-grid">
          <div className="payment-in-kpi-card">
            <span className="payment-in-kpi-card__label">Total Payments</span>
            <span className="payment-in-kpi-card__value">{formatMoney(total)}</span>
          </div>
        </div>
      </header>

      <DataTable
        data={payments}
        columns={columns}
        getRowId={(payment) => payment.id}
        searchPlaceholder="Search payment or invoice..."
        minWidth={900}
        initialPageSize={10}
      />
    </>
  )
}

function PaymentInForm({ toast, navigate }) {
  const [form, setForm] = useState({ customerId: '', invoiceId: '', date: new Date().toISOString().slice(0, 16), amount: 0, mode: 'Cash', accountId: mockAccounts[0].id, notes: '' })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const customers = getCustomers()
  const unpaidSales = getSales().filter((sale) => sale.due && sale.status !== 'Paid' && sale.status !== 'Delivered')

  const validate = () => {
    const nextErrors = {}
    if (!form.customerId) nextErrors.customerId = 'Select a customer'
    if (!form.invoiceId) nextErrors.invoiceId = 'Select an invoice'
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

    const sale = getSales().find((entry) => entry.number === form.invoiceId)
    if (sale && Number(form.amount) > (sale.due ?? 0)) {
      toast.error(`Amount exceeds outstanding ₹${formatMoney(sale.due ?? 0)}`)
      setIsSubmitting(false)
      return
    }

    try {
      recordPaymentInFinance({
        customerId: form.customerId,
        invoiceId: form.invoiceId,
        amount: Number(form.amount),
        mode: form.mode,
        accountId: form.accountId,
        notes: form.notes,
      })
      toast.success('Payment recorded. Customer balance and account updated.')
      setForm((current) => ({ ...current, amount: 0, notes: '' }))
    } catch (error) {
      toast.error(error.message ?? 'Could not record payment')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="payment-in-card">
      <CardBody>
        <h3 className="payment-in-title">Record Payment In</h3>
        <form className="payment-in-form" onSubmit={handleSubmit} noValidate>
          <FormSection>
            <FormGrid>
              <FormField label="Customer" error={errors.customerId} required>
                <Select
                  value={form.customerId}
                  onChange={(event) => setForm((current) => ({ ...current, customerId: event.target.value }))}
                  options={customers.map((customer) => ({ value: customer.id, label: customer.name }))}
                  placeholder="Select customer"
                />
              </FormField>
              <FormField label="Invoice Reference" error={errors.invoiceId} required hint="Outstanding invoices from the selected customer.">
                <Select
                  value={form.invoiceId}
                  onChange={(event) => setForm((current) => ({ ...current, invoiceId: event.target.value }))}
                  options={unpaidSales
                    .filter((sale) => sale.customerId === form.customerId || !sale.customerId)
                    .map((sale) => ({ value: sale.number, label: `${sale.number} — Due ${formatMoney(sale.due ?? 0)}` }))}
                  placeholder="Select invoice"
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
              <FormInput value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} placeholder="Cash deposit, NEFT reference..." />
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
