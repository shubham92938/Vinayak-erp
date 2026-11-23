import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, ConfirmDialog, useToast } from '../../../components/ui'
import { downloadCsv } from '../../../utils/csv'
import { getCustomers } from '../../../core/store'
import { getCustomersCsvRows } from '../services/customerService'
import { getCustomerFields } from '../services/customerService'
import useCustomers from '../hooks/useCustomers'
import CustomerTable from '../components/CustomerTable'
import CustomerForm from '../components/CustomerForm'
import '../styles/customers.css'

export default function CustomersPage() {
  const toast = useToast()
  const navigate = useNavigate()
  const { customers, filters, setFilters, saveCustomer, deleteCustomer: deleteCustomerHook, refresh } = useCustomers()
  const [showAdd, setShowAdd] = useState(false)
  const [confirmState, setConfirmState] = useState(null)

  const kpis = {
    total: customers.length,
    dealers: customers.filter((c) => c.customerType === 'Dealer').length,
    active: customers.filter((c) => c.status === 'Active').length,
  }

  const clearFilters = () => setFilters({ query: '', customerType: 'all', status: 'all', fromDate: '', toDate: '' })

  const handleDelete = (customerId) => {
    deleteCustomerHook(customerId)
    toast.success('Customer deleted')
  }

  const handleActivate = (customerId) => {
    saveCustomer(customerId, { status: 'Active' })
    toast.success('Customer activated')
    refresh()
  }

  const handleDeactivate = (customerId) => {
    saveCustomer(customerId, { status: 'Inactive' })
    toast.success('Customer deactivated')
    refresh()
  }

  const exportCsv = () => {
    downloadCsv({
      filename: 'vinayak-customers.csv',
      columns: getCustomerFields().map((field) => ({ key: field.key, label: field.label })),
      rows: getCustomersCsvRows(getCustomers()),
    })
  }

  const handleSave = (customer) => {
    if (!customer.id) {
      const exists = getCustomers().some((entry) => entry.code.toLowerCase() === customer.code?.toLowerCase())
      if (exists) {
        toast.error('Customer code already exists')
        return
      }
    }
    refresh()
  }

  return (
    <div className="customers-page">
      <header className="customers-header">
        <div className="customers-header__top">
          <div className="customers-header__text">
            <p className="customers-header__eyebrow"><span aria-hidden="true">#</span> Customers</p>
            <h1 className="customers-header__title">Customer Management</h1>
            <p className="customers-header__description">
              Manage regular customers and dealers across firms.
            </p>
          </div>
          <div className="customers-header__actions">
            <Button variant="secondary" onClick={exportCsv}>Export CSV</Button>
            <Button size="sm" onClick={() => setShowAdd(true)}>Add Customer</Button>
          </div>
        </div>

        <div className="customers-kpi-grid">
          <KpiCard label="Total Customers" value={kpis.total} />
          <KpiCard label="Regular Customers" value={kpis.total - kpis.dealers} />
          <KpiCard label="Total Dealers" value={kpis.dealers} />
          <KpiCard label="Active Customers" value={kpis.active} />
        </div>
      </header>

      <CustomerTable
        customers={customers}
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={clearFilters}
        onRowView={(id) => navigate(`/customers/${id}`)}
        onRowEdit={(id) => navigate(`/customers/${id}`)}
        onRowDelete={(id) => setConfirmState({ type: 'delete', customer: getCustomers().find((c) => c.id === id) })}
        onRowActivate={(id) => handleActivate(id)}
        onRowDeactivate={(id) => handleDeactivate(id)}
      />

      {showAdd && (
        <CustomerForm
          mode="add"
          onClose={() => setShowAdd(false)}
          onSave={handleSave}
        />
      )}

      <ConfirmDialog
        open={confirmState?.type === 'delete'}
        onClose={() => setConfirmState(null)}
        onConfirm={() => {
          if (confirmState?.customer) handleDelete(confirmState.customer.id)
          setConfirmState(null)
        }}
        title="Delete customer?"
        description={`${confirmState?.customer?.name ?? ''} will be removed from the customer list. Sales history is kept for reporting.`}
        confirmLabel="Delete Customer"
        cancelLabel="Cancel"
        tone="danger"
      />
    </div>
  )
}

function KpiCard({ label, value }) {
  return (
    <div className="customers-kpi-card">
      <div className="customers-kpi-card__label">{label}</div>
      <div className="customers-kpi-card__value">{value}</div>
    </div>
  )
}
