/* eslint-disable react-refresh/only-export-components */
import { Eye, FileDown, Printer, Trash2 } from 'lucide-react'
import { RecordedTable } from '../../../components/recorded'
import { getSaleTotals } from '../services/saleService'
import { formatMoney, formatRecordedDate } from './saleUtils'

export const SALES_CSV_COLUMNS = [
  { key: 'number', label: 'Order Number' },
  { key: 'documentNumber', label: 'Invoice/Challan' },
  { key: 'date', label: 'Date' },
  { key: 'customer', label: 'Buyer' },
  { key: 'total', label: 'Total Bill Amount' },
  { key: 'paid', label: 'Advance Paid Amount' },
  { key: 'due', label: 'Total Due Amount' },
  { key: 'paymentMode', label: 'Payment Mode' },
  { key: 'status', label: 'Status' },
]

export function saleCsvRows(sales) {
  return sales.map((sale) => {
    const totals = getSaleTotals(sale)
    return {
      number: sale.number,
      documentNumber: sale.documentNumber ?? sale.type,
      date: sale.date,
      customer: sale.customerName,
      total: sale.total ?? totals.total,
      paid: sale.paid ?? sale.advance ?? 0,
      due: sale.due ?? 0,
      paymentMode: sale.paymentMode ?? 'N/A',
      status: sale.status,
    }
  })
}

function statusClass(status) {
  return String(status ?? 'pending').toLowerCase().replaceAll(' ', '-')
}

export default function SalesTable({
  sales,
  filters,
  onFiltersChange,
  onRowView,
  onRowCancel,
  onRowPrint,
  onDownloadCsv,
  canCancel = true,
  canExport = true,
}) {
  const columns = [
    {
      key: 'serial',
      label: 'S.NO. ↕',
      width: '68px',
      align: 'center',
      render: (_sale, index) => index + 1,
    },
    { key: 'number', label: 'ORDER NUMBER ↕', width: '122px' },
    {
      key: 'documentNumber',
      label: 'INVOICE/CHALLAN ↕',
      width: '145px',
      render: (sale) => sale.documentNumber ?? sale.type ?? '—',
    },
    { key: 'date', label: 'DATE ↕', width: '96px', render: (sale) => formatRecordedDate(sale.date) },
    { key: 'customerName', label: 'BUYER ↕', minWidth: '220px' },
    { key: 'total', label: 'TOTAL BILL AMOUNT ↕', width: '138px', align: 'right', render: (sale) => formatMoney(sale.total ?? getSaleTotals(sale).total) },
    { key: 'paid', label: 'ADVANCE PAID AMOUNT ↕', width: '150px', align: 'right', render: (sale) => formatMoney(sale.paid ?? sale.advance ?? 0) },
    { key: 'due', label: 'TOTAL DUE AMOUNT ↕', width: '138px', align: 'right', render: (sale) => formatMoney(sale.due ?? 0) },
    { key: 'payment', label: 'PAYMENT MODE ↕', width: '112px', render: (sale) => sale.paymentMode ?? 'N/A' },
    {
      key: 'status',
      label: 'STATUS ↕',
      width: '92px',
      align: 'center',
      render: (sale) => <span className={`recorded-status recorded-status--${statusClass(sale.status)}`}>{sale.status ?? '—'}</span>,
    },
    {
      key: 'actions',
      label: 'ACTION',
      width: '132px',
      align: 'center',
      render: (sale) => (
        <span className="recorded-row-actions">
          <button type="button" className="recorded-row-actions__button" onClick={() => onRowView(sale.id)} aria-label={`View ${sale.number}`} title="View">
            <Eye size={13} />
          </button>
          {canCancel && (
            <button type="button" className="recorded-row-actions__button recorded-row-actions__button--danger" onClick={() => onRowCancel(sale.id)} aria-label={`Delete ${sale.number}`} title="Delete">
              <Trash2 size={13} />
            </button>
          )}
          {onRowPrint && (
            <button type="button" className="recorded-row-actions__button recorded-row-actions__button--print" onClick={() => onRowPrint(sale.id)} aria-label={`Print ${sale.number}`} title="Print">
              <Printer size={13} />
            </button>
          )}
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
      className="sales-recorded-table"
      rows={sales}
      columns={columns}
      getRowId={(sale) => sale.id}
      initialPageSize={10}
      pageSizeOptions={[5, 10, 15, 25]}
      search={filters.search}
      onSearchChange={(search) => onFiltersChange((current) => ({ ...current, search }))}
      searchPlaceholder="Search orders or purchases..."
      searchLabel="Search sales"
      searchTitle="Search"
      filters={(
        <>
          <label><span>Payment Mode</span><select value={filters.paymentMode} onChange={(event) => onFiltersChange((current) => ({ ...current, paymentMode: event.target.value }))}><option value="all">-- All Payment Modes --</option><option>Cash</option><option>Online</option></select></label>
          <label><span>Buyer Type</span><select value={filters.buyerType} onChange={(event) => onFiltersChange((current) => ({ ...current, buyerType: event.target.value }))}><option value="all">-- All Buyer Types --</option><option>Customer</option><option>Dealer</option><option>Firm</option></select></label>
          <label><span>Date Filter</span><select value={filters.dateFilter} onChange={(event) => onFiltersChange((current) => ({ ...current, dateFilter: event.target.value }))}><option value="all">All Dates</option><option value="today">Today</option><option value="month">This Month</option></select></label>
        </>
      )}
      filterRow={(sale) => {
        const buyerType = sale.buyerType ?? ''
        const paymentMode = sale.paymentMode ?? 'N/A'
        return (filters.paymentMode === 'all' || paymentMode === filters.paymentMode) &&
          (filters.buyerType === 'all' || buyerType === filters.buyerType) &&
          dateMatches(sale)
      }}
      actions={canExport ? <button type="button" className="recorded-table__export" onClick={onDownloadCsv}><FileDown size={13} /> Export</button> : null}
      emptyMessage="No sales found."
      ariaLabel="Sales"
      minWidth={1370}
    />
  )
}
