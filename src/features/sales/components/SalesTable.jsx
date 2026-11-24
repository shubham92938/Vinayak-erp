/* eslint-disable react-refresh/only-export-components */
import { Eye, FileDown, XCircle } from 'lucide-react'
import { RecordedTable } from '../../../components/recorded'
import { getCustomers } from '../../../core/store'
import { getSaleTotals } from '../services/saleService'
import { formatDate, formatMoney } from './saleUtils'

export const SALES_CSV_COLUMNS = [
  { key: 'number', label: 'Order Number' },
  { key: 'type', label: 'Invoice/Challan' },
  { key: 'date', label: 'Date' },
  { key: 'customer', label: 'Buyer' },
  { key: 'total', label: 'Total Bill Amount' },
  { key: 'paid', label: 'Advance Paid Amount' },
  { key: 'due', label: 'Due Amount' },
]

export function saleCsvRows(sales) {
  return sales.map((sale) => {
    const totals = getSaleTotals(sale)
    return {
      number: sale.number,
      type: sale.type,
      date: sale.date,
      customer: sale.customerName,
      total: sale.total ?? totals.total,
      paid: sale.paid ?? sale.advance ?? 0,
      due: sale.due ?? 0,
    }
  })
}

export default function SalesTable({
  sales,
  filters,
  onFiltersChange,
  onRowView,
  onRowCancel,
  onDownloadCsv,
  canCancel = true,
  canExport = true,
}) {
  const customers = getCustomers()
  const customerById = Object.fromEntries(customers.map((customer) => [customer.id, customer]))
  const columns = [
    { key: 'number', label: 'Order Number', minWidth: '105px' },
    { key: 'type', label: 'Invoice/Challan', width: '90px' },
    { key: 'date', label: 'Date', width: '82px', render: (sale) => formatDate(sale.date) },
    { key: 'customerName', label: 'Buyer', minWidth: '170px' },
    { key: 'total', label: 'Total Bill Amount', width: '105px', align: 'right', render: (sale) => formatMoney(sale.total ?? getSaleTotals(sale).total) },
    { key: 'paid', label: 'Advance Paid Amount', width: '105px', align: 'right', render: (sale) => formatMoney(sale.paid ?? sale.advance ?? 0) },
    { key: 'due', label: 'Due Amount', width: '95px', align: 'right', render: (sale) => formatMoney(sale.due ?? 0) },
    { key: 'payment', label: 'Payment Mode', width: '85px', render: (sale) => sale.paymentMode ?? (sale.due ? 'Credit' : 'Online') },
    {
      key: 'actions', label: 'Action', width: '70px', align: 'center', render: (sale) => (
        <span className="recorded-row-actions">
          <button type="button" className="recorded-row-actions__button" onClick={() => onRowView(sale.id)} aria-label={`View ${sale.number}`} title="View"><Eye size={13} /></button>
          {canCancel && <button type="button" className="recorded-row-actions__button recorded-row-actions__button--edit" onClick={() => onRowCancel(sale.id)} aria-label={`Cancel ${sale.number}`} title="Cancel"><XCircle size={13} /></button>}
        </span>
      ),
    },
  ]

  const dateMatches = (sale) => {
    if (filters.dateFilter === 'all') return true
    const date = new Date(sale.date)
    const now = new Date()
    if (filters.dateFilter === 'today') return date.toISOString().slice(0, 10) === now.toISOString().slice(0, 10)
    if (filters.dateFilter === 'month') return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
    return true
  }

  return (
    <RecordedTable
      rows={sales}
      columns={columns}
      getRowId={(sale) => sale.id}
      initialPageSize={10}
      pageSizeOptions={[5, 10, 15, 25]}
      search={filters.search}
      onSearchChange={(search) => onFiltersChange((current) => ({ ...current, search }))}
      searchPlaceholder="Search orders or purchases"
      searchLabel="Search sales"
      filters={(
        <>
          <label><span>Payment Mode:</span><select value={filters.paymentMode} onChange={(event) => onFiltersChange((current) => ({ ...current, paymentMode: event.target.value }))}><option value="all">-- All Payment Modes --</option><option value="Online">Online</option><option value="Cash">Cash</option><option value="Credit">Credit</option></select></label>
          <label><span>Buyer Type:</span><select value={filters.buyerType} onChange={(event) => onFiltersChange((current) => ({ ...current, buyerType: event.target.value }))}><option value="all">-- All Buyer Types --</option><option value="Customer">Customer</option><option value="Dealer">Dealer</option><option value="Firm">Firm</option></select></label>
          <label><span>Date Filter:</span><select value={filters.dateFilter} onChange={(event) => onFiltersChange((current) => ({ ...current, dateFilter: event.target.value }))}><option value="all">All Dates</option><option value="today">Today</option><option value="month">This Month</option></select></label>
        </>
      )}
      filterRow={(sale) => {
        const customer = customerById[sale.customerId]
        const buyerType = customer?.customerType === 'DEALER' || customer?.type === 'Dealer' ? 'Dealer' : 'Customer'
        const paymentMode = sale.paymentMode ?? (sale.due ? 'Credit' : 'Online')
        return (filters.paymentMode === 'all' || paymentMode === filters.paymentMode) &&
          (filters.buyerType === 'all' || buyerType === filters.buyerType) &&
          dateMatches(sale)
      }}
      actions={canExport ? <button type="button" className="recorded-table__export" onClick={onDownloadCsv}><FileDown size={13} /> Export</button> : null}
      emptyMessage="No sales found."
      ariaLabel="Sales"
      minWidth={870}
    />
  )
}
