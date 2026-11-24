import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/hooks'
import { hasModulePermission } from '../../../core/accessControl'
import { ActionMenu, Badge, Button, useToast } from '../../../components/ui'
import { downloadCsv } from '../../../utils/csv'
import { getQuotations, formatMoney, formatDate, QUOTATION_STATUSES } from '../services/quotationService'
import { getQuotationTotals } from '../services/quotationService'
import { convertQuotationToSaleOrder } from '../../../core/financeStore'
import { Select } from '../../../components/ui'
import { DataTable } from '../../../components/data-table'
import { getCustomers } from '../../../core/store'
import '../styles/quotations.css'

const COLUMNS = [
  { key: 'number', label: 'Quotation Number' },
  { key: 'customerName', label: 'Customer' },
  { key: 'date', label: 'Date' },
  { key: 'expiryDate', label: 'Expiry Date' },
  { key: 'productCount', label: 'Products' },
  { key: 'discount', label: 'Discount' },
  { key: 'taxTotal', label: 'Tax' },
  { key: 'total', label: 'Total' },
  { key: 'status', label: 'Status' },
]

export default function QuotationsPage() {
  const toast = useToast()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const canConvert = hasModulePermission(currentUser, 'Sales Orders', 'create')
  const canExport = hasModulePermission(currentUser, 'Quotations', 'export')
  const [filters, setFilters] = useState({ status: 'all', customerId: 'all' })

  const quotations = getQuotations().filter((quote) =>
    (filters.status === 'all' || quote.status === filters.status) &&
    (filters.customerId === 'all' || quote.customerId === filters.customerId),
  )

  const exportCsv = () => {
    downloadCsv({
      filename: 'vinayak-quotations.csv',
      columns: COLUMNS.map((column) => ({ key: column.key, label: column.label })),
      rows: quotations.map((quote) => ({
        number: quote.number,
        customerName: quote.customerName,
        date: quote.date,
        expiryDate: quote.expiryDate,
        productCount: quote.items.length,
        discount: quote.discount,
        taxTotal: getQuotationTotals(quote).taxTotal,
        total: quote.total ?? getQuotationTotals(quote).total,
        status: quote.status,
      })),
    })
  }

  const convertQuote = (quote) => {
    if (!canConvert) return
    const order = convertQuotationToSaleOrder(quote.id)
    toast.success(`Quote converted to ${order.number}`)
  }

  return (
    <div className="quotations-page">
      <header className="quotations-header">
        <div className="quotations-header__top">
          <div className="quotations-header__text">
            <p className="quotations-header__eyebrow"><span aria-hidden="true">#</span> Quotations</p>
            <h1 className="quotations-header__title">Quotations</h1>
            <p className="quotations-header__description">Send price quotes to customers. Convert accepted quotes to Sales Orders.</p>
          </div>
          <div className="quotations-header__actions">
            <Button variant="secondary" onClick={exportCsv} disabled={!canExport}>Export CSV</Button>
          </div>
        </div>
        <div className="quotations-kpi-grid">
          <KpiCard label="Quotations" value={quotations.length} />
          <KpiCard label="Draft" value={quotations.filter((q) => q.status === 'Draft').length} />
          <KpiCard label="Sent" value={quotations.filter((q) => q.status === 'Sent').length} />
          <KpiCard label="Total Value" value={formatMoney(quotations.reduce((sum, q) => sum + (q.total ?? 0), 0))} />
        </div>
      </header>

      <DataTable
        data={quotations}
        columns={buildColumns(navigate, convertQuote, canConvert)}
        getRowId={(quote) => quote.id}
        search={filters.search}
        onSearchChange={(search) => setFilters((current) => ({ ...current, search }))}
        searchPlaceholder="Search quotation number or customer..."
        minWidth={820}
        filtersActive={Boolean(filters.status !== 'all' || filters.customerId !== 'all')}
        filters={
          <div className="quotations-filters">
            <Select
              label="Status"
              options={QUOTATION_STATUSES}
              value={filters.status}
              onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
            />
            <Select
              label="Customer"
              options={[
                { value: 'all', label: 'All customers' },
                ...getCustomers().map((customer) => ({ value: customer.id, label: customer.name })),
              ]}
              value={filters.customerId}
              onChange={(event) => setFilters((current) => ({ ...current, customerId: event.target.value }))}
            />
          </div>
        }
      />
    </div>
  )
}

function buildColumns(navigate, convertQuote, canConvert) {
  return [
    { id: 'number', header: 'Quotation Number', accessor: 'number', minWidth: '120px' },
    { id: 'customerName', header: 'Customer', accessor: 'customerName', minWidth: '160px' },
    { id: 'date', header: 'Date', accessor: 'date', width: '110px', cell: (row) => <span className="quotations-date">{formatDate(row.date)}</span> },
    { id: 'expiryDate', header: 'Expiry Date', accessor: 'expiryDate', width: '110px' },
    { id: 'productCount', header: 'Products', accessor: 'items', width: '80px', cell: (row) => row.items.length },
    { id: 'discount', header: 'Discount', accessor: 'discount', width: '90px', align: 'right', cell: (row) => <span className="quotations-money">{formatMoney(row.discount)}</span> },
    { id: 'taxTotal', header: 'Tax', accessor: (row) => getQuotationTotals(row).taxTotal, width: '90px', align: 'right', cell: (row) => <span className="quotations-money">{formatMoney(getQuotationTotals(row).taxTotal)}</span> },
    { id: 'total', header: 'Total', accessor: 'total', width: '100px', align: 'right', cell: (row) => <span className="quotations-money">{formatMoney(row.total ?? getQuotationTotals(row).total)}</span> },
    {
      id: 'status',
      header: 'Status',
      accessor: 'status',
      width: '120px',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      width: '70px',
      sortable: false,
      cell: (row) => (
        <ActionMenu
          label="Actions"
          triggerLabel={`Actions for ${row.number}`}
          items={[
            { label: 'View details', onSelect: () => navigate(`/quotations/${row.id}`) },
            { label: 'Duplicate', onSelect: () => navigate(`/quotations/${row.id}?duplicate=1`) },
            { label: 'Convert to Sales Order', disabled: row.status !== 'Accepted' || !canConvert, onSelect: () => convertQuote(row) },
          ]}
        />
      ),
    },
  ]
}

function StatusBadge({ status }) {
  const variant = status === 'Accepted' ? 'success' : status === 'Sent' ? 'info' : status === 'Converted' ? 'info' : status === 'Expired' ? 'danger' : status === 'Draft' ? 'neutral' : 'info'
  return <Badge variant={variant} size="sm">{status}</Badge>
}

function KpiCard({ label, value }) {
  return (
    <div className="quotations-kpi-card">
      <span className="quotations-kpi-card__label">{label}</span>
      <span className="quotations-kpi-card__value">{value}</span>
    </div>
  )
}

