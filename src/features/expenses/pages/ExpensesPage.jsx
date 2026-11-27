import { useState } from 'react'
import { Button, Modal, Select, useToast } from '../../../components/ui'
import { useAuth, useFirmContext } from '../../../context/hooks'
import { hasModulePermission } from '../../../core/accessControl'
import { FormActions, FormField, FormGrid, FormInput, FormSection, FormTextarea } from '../../../components/forms'
import { DataTable } from '../../../components/data-table'
import { downloadCsv } from '../../../utils/csv'
import { getExpenses, createExpense, updateExpense, deleteExpense, EXPENSE_STATUSES, getExpenseTypes, getExpenseCategories } from '../services/expenseService'
import { formatMoney, formatDate } from '../../../core/store'
import '../styles/expenses.css'

const COLUMNS = [
  { key: 'date', label: 'Date' },
  { key: 'id', label: 'Expense ID' },
  { key: 'type', label: 'Type' },
  { key: 'category', label: 'Category' },
  { key: 'description', label: 'Description' },
  { key: 'amount', label: 'Amount' },
  { key: 'mode', label: 'Mode' },
  { key: 'status', label: 'Status' },
]

const MODES = [
  { value: 'Cash', label: 'Cash' },
  { value: 'Bank Transfer', label: 'Bank Transfer' },
  { value: 'UPI / Digital Wallet', label: 'UPI / Digital Wallet' },
]

export default function ExpensesPage() {
  const toast = useToast()
  const { currentUser } = useAuth()
  const { currentFirmId } = useFirmContext()
  const canCreateExpenses = hasModulePermission(currentUser, 'Expenses', 'create')
  const canEditExpenses = hasModulePermission(currentUser, 'Expenses', 'edit')
  const canDeleteExpenses = hasModulePermission(currentUser, 'Expenses', 'delete')
  const canExportExpenses = hasModulePermission(currentUser, 'Expenses', 'export')
  const [filters, setFilters] = useState({ search: '', type: 'all', status: 'all' })
  const [expenseToEdit, setExpenseToEdit] = useState(null)
  const [isNewOpen, setIsNewOpen] = useState(false)
  const [deleting, setDeleting] = useState(null)

  const expenses = getExpenses().filter((expense) => {
    if (currentFirmId && expense.firmId !== currentFirmId) return false
    if (filters.type !== 'all' && expense.type !== filters.type) return false
    if (filters.status !== 'all' && expense.status !== filters.status) return false
    const query = String(filters.search ?? '').trim().toLowerCase()
    if (query && !`${expense.id} ${expense.description} ${expense.category}`.toLowerCase().includes(query)) return false
    return true
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const total = expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0)

  const exportCsv = () => {
    downloadCsv({
      filename: 'vinayak-expenses.csv',
      columns: COLUMNS,
      rows: expenses.map((expense) => ({
        id: expense.id,
        date: expense.date,
        type: expense.type,
        category: expense.category,
        description: expense.description,
        amount: Number(expense.amount || 0),
        mode: expense.mode,
        status: expense.status,
      })),
    })
  }

  const columns = [
    { id: 'date', header: 'Date', accessor: 'date', width: '110px', cell: (row) => <span className="expenses-date">{formatDate(row.date)}</span> },
    { id: 'id', header: 'Expense ID', accessor: 'id', width: '110px' },
    { id: 'type', header: 'Type', accessor: 'type', width: '120px' },
    { id: 'category', header: 'Category', accessor: 'category', width: '130px' },
    { id: 'description', header: 'Description', accessor: 'description', minWidth: '200px' },
    { id: 'amount', header: 'Amount', accessor: 'amount', width: '110px', align: 'right', cell: (row) => <span className="expenses-money">{formatMoney(row.amount)}</span> },
    { id: 'mode', header: 'Mode', accessor: 'mode', width: '130px' },
    { id: 'status', header: 'Status', accessor: 'status', width: '110px', cell: (row) => <span className={['expenses-status', `expenses-status--${row.status?.toLowerCase()}`].join(' ')}>{row.status}</span> },
    {
      id: 'actions',
      header: 'Actions',
      width: '110px',
      sortable: false,
      cell: (row) => (
        <div className="expenses-actions">
          <Button size="sm" variant="ghost" onClick={() => setExpenseToEdit(row)} disabled={!canEditExpenses}>Edit</Button>
          <Button size="sm" variant="ghost" onClick={() => setDeleting(row)} disabled={!canDeleteExpenses}>Delete</Button>
        </div>
      ),
    },
  ]

  return (
    <div className="expenses-page">
      <header className="expenses-header">
        <div className="expenses-header__top">
          <div className="expenses-header__text">
            <p className="expenses-header__eyebrow"><span aria-hidden="true">#</span> Expenses</p>
            <h1 className="expenses-header__title">Expenses</h1>
            <p className="expenses-header__description">Record daily expenses — travel, rent, repairs and more. Demo data.</p>
          </div>
          <div className="expenses-header__actions">
            <Button size="sm" variant="secondary" onClick={exportCsv} disabled={!canExportExpenses}>Export CSV</Button>
            {canCreateExpenses && <Button size="sm" variant="primary" onClick={() => setIsNewOpen(true)}>New Expense</Button>}
          </div>
        </div>
        <div className="expenses-kpi-grid">
          <KpiCard label="Expenses Recorded" value={expenses.length} />
          <KpiCard label="Total Value" value={formatMoney(total)} />
        </div>
      </header>

      <DataTable
        data={expenses}
        columns={columns}
        getRowId={(expense) => expense.id}
        search={filters.search}
        onSearchChange={(search) => setFilters((current) => ({ ...current, search }))}
        searchPlaceholder="Search expense ID, type or description..."
        minWidth={900}
        selectable
        filtersActive={Boolean(filters.search || filters.type !== 'all' || filters.status !== 'all')}
        filters={
          <div className="expenses-filters">
            <Select
              label="Type"
              options={[
                { value: 'all', label: 'All types' },
                ...getExpenseTypes().map((type) => ({ value: type, label: type })),
              ]}
              value={filters.type}
              onChange={(event) => setFilters((current) => ({ ...current, type: event.target.value }))}
            />
            <Select
              label="Status"
              options={[
                { value: 'all', label: 'All statuses' },
                ...EXPENSE_STATUSES.map((status) => ({ value: status, label: status })),
              ]}
              value={filters.status}
              onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
            />
          </div>
        }
        onClearFilters={() => setFilters({ search: '', type: 'all', status: 'all' })}
      />

      <ExpenseModal
        key={isNewOpen ? 'new-open' : 'new-closed'}
        open={isNewOpen}
        onClose={() => setIsNewOpen(false)}
        expense={null}
        onSave={(expenseData) => {
          if (!canCreateExpenses) return
          createExpense(expenseData)
          setIsNewOpen(false)
        }}
      />

      <ExpenseModal
        key={expenseToEdit ? `edit-${expenseToEdit.id}` : 'edit-closed'}
        open={Boolean(expenseToEdit)}
        onClose={() => setExpenseToEdit(null)}
        expense={expenseToEdit}
        onSave={(expenseData) => {
          if (expenseToEdit && canEditExpenses) updateExpense(expenseToEdit.id, expenseData)
          setExpenseToEdit(null)
        }}
      />

      <DeleteModal
        expense={deleting}
        onClose={() => setDeleting(null)}
        onDelete={() => {
          if (!canDeleteExpenses) return
          deleteExpense(deleting.id)
          setDeleting(null)
          toast.success('Expense deleted')
        }}
      />
    </div>
  )
}

function getExpenseFormValues(expense) {
  return {
    type: expense?.type ?? 'Misc',
    category: expense?.category ?? 'Operating Expenses',
    description: expense?.description ?? '',
    amount: expense?.amount ?? 0,
    mode: expense?.mode ?? 'Cash',
    status: expense?.status ?? 'Paid',
    date: expense?.date ?? new Date().toISOString().slice(0, 16),
  }
}

function ExpenseModal({ open, onClose, expense, onSave }) {
  const [form, setForm] = useState(() => getExpenseFormValues(expense))
  const [errors, setErrors] = useState({})

  const isNew = !expense

  const validate = () => {
    const nextErrors = {}
    if (!form.type) nextErrors.type = 'Select an expense type'
    if (!form.description.trim()) nextErrors.description = 'Enter a description'
    if (!form.amount || Number(form.amount) <= 0) nextErrors.amount = 'Enter an amount greater than 0'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!validate()) return
    onSave({ ...form, amount: Number(form.amount) })
  }

  return (
    <Modal open={open} onClose={onClose} title={isNew ? 'New Expense' : 'Edit Expense'} size="md">
      <form className="expenses-modal-form" onSubmit={handleSubmit} noValidate>
        <FormSection>
          <FormGrid>
            <FormField label="Type" error={errors.type} required>
              <Select
                value={form.type}
                onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}
                options={getExpenseTypes().map((type) => ({ value: type, label: type }))}
              />
            </FormField>
            <FormField label="Category">
              <Select
                value={form.category}
                onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                options={getExpenseCategories().map((category) => ({ value: category, label: category }))}
              />
            </FormField>
            <FormField label="Date">
              <FormInput type="date" value={String(form.date).slice(0, 10)} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} />
            </FormField>
            <FormField label="Amount" error={errors.amount} required>
              <FormInput type="number" min="0" step="0.01" value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))} placeholder="0.00" />
            </FormField>
            <FormField label="Mode">
              <Select value={form.mode} onChange={(event) => setForm((current) => ({ ...current, mode: event.target.value }))} options={MODES} />
            </FormField>
            <FormField label="Status">
              <Select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))} options={EXPENSE_STATUSES.map((status) => ({ value: status, label: status }))} />
            </FormField>
          </FormGrid>
          <FormField label="Description" error={errors.description} required>
            <FormTextarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="What was this expense for?" />
          </FormField>
          <FormActions>
            <Button type="submit" variant="primary">Save Expense</Button>
          </FormActions>
        </FormSection>
      </form>
    </Modal>
  )
}

function DeleteModal({ expense, onClose, onDelete }) {
  if (!expense) return null
  return (
    <Modal open={Boolean(expense)} onClose={onClose} title={`Delete ${expense.id}`} size="sm" footer={
      <div className="expenses-delete-footer">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="danger" onClick={onDelete}>Delete Expense</Button>
      </div>
    }>
      <p className="expenses-delete-body">
        Are you sure you want to delete expense <strong>{expense.id}</strong> — {expense.description}?
      </p>
    </Modal>
  )
}

function KpiCard({ label, value }) {
  return (
    <div className="expenses-kpi-card">
      <span className="expenses-kpi-card__label">{label}</span>
      <span className="expenses-kpi-card__value">{value}</span>
    </div>
  )
}
