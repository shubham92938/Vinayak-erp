/* eslint-disable react-refresh/only-export-components */
import { Eye, FileDown } from 'lucide-react'
import { RecordedTable } from '../../../components/recorded'
import { getCustomers } from '../../../core/store'
import { formatMoney, formatDate } from './salesOrderUtils'

export const SALES_ORDER_CSV_COLUMNS = [
  { key: 'number', label: 'Order Number' },
  { key: 'customerName', label: 'Buyer' },
  { key: 'orderDate', label: 'Date' },
  { key: 'total', label: 'Total Bill Amount' },
  { key: 'advance', label: 'Advance Paid Amount' },
  { key: 'due', label: 'Due Amount' },
  { key: 'paymentMode', label: 'Payment Mode' },
  { key: 'status', label: 'Status' },
]

export function salesOrderCsvRows(orders) {
  return orders.map((order) => ({
    number: order.number,
    customerName: order.customerName,
    orderDate: order.orderDate,
    total: order.total,
    advance: order.advance ?? 0,
    due: Math.max(0, (order.total ?? 0) - (order.advance ?? 0)),
    paymentMode: order.paymentMode ?? 'Online',
    status: order.status,
  }))
}

export default function SalesOrderTable({ orders, filters, onFiltersChange, onRowView, onDownloadCsv, canExport = true }) {
  const customers = getCustomers()
  const customerById = Object.fromEntries(customers.map((customer) => [customer.id, customer]))
  const columns = [
    { key: 'number', label: 'S.No', width: '82px', render: (order) => order.number },
    { key: 'customerName', label: 'Buyer', minWidth: '160px' },
    { key: 'orderDate', label: 'Date', width: '84px', render: (order) => formatDate(order.orderDate) },
    { key: 'total', label: 'Total Bill Amount', width: '105px', align: 'right', render: (order) => formatMoney(order.total) },
    { key: 'advance', label: 'Advance Paid Amount', width: '108px', align: 'right', render: (order) => formatMoney(order.advance ?? 0) },
    { key: 'due', label: 'Due Amount', width: '95px', align: 'right', render: (order) => formatMoney(Math.max(0, (order.total ?? 0) - (order.advance ?? 0))) },
    { key: 'paymentMode', label: 'Payment Mode', width: '86px', render: (order) => order.paymentMode ?? 'Online' },
    { key: 'saleType', label: 'Sale Type', width: '80px', render: (order) => order.saleType ?? 'Retail' },
    { key: 'status', label: 'Status', width: '85px', render: (order) => <span className={`recorded-status recorded-status--${String(order.status).toLowerCase().replaceAll(' ', '-')}`}>{order.status}</span> },
    { key: 'actions', label: 'Action', width: '55px', align: 'center', render: (order) => <button type="button" className="recorded-row-actions__button" onClick={() => onRowView(order.id)} aria-label={`View ${order.number}`} title="View"><Eye size={13} /></button> },
  ]

  return (
    <RecordedTable
      rows={orders}
      columns={columns}
      getRowId={(order) => order.id}
      initialPageSize={10}
      pageSizeOptions={[5, 10, 15, 25]}
      search={filters.search}
      onSearchChange={(search) => onFiltersChange((current) => ({ ...current, search }))}
      searchPlaceholder="Search Buyer"
      searchLabel="Search buyer"
      filters={(
        <>
          <label><span>Payment Mode:</span><select value={filters.paymentMode} onChange={(event) => onFiltersChange((current) => ({ ...current, paymentMode: event.target.value }))}><option value="all">-- All Payment --</option><option>Online</option><option>Cash</option><option>Credit</option></select></label>
          <label><span>Sale Type:</span><select value={filters.saleType} onChange={(event) => onFiltersChange((current) => ({ ...current, saleType: event.target.value }))}><option value="all">-- All Sale Type --</option><option>Retail</option><option>Wholesale</option><option>Dealer</option></select></label>
          <label><span>Buyer Type:</span><select value={filters.buyerType} onChange={(event) => onFiltersChange((current) => ({ ...current, buyerType: event.target.value }))}><option value="all">-- All Buyers --</option><option>Customer</option><option>Dealer</option></select></label>
          <label><span>From Date:</span><input type="date" value={filters.fromDate} onChange={(event) => onFiltersChange((current) => ({ ...current, fromDate: event.target.value }))} aria-label="Sales orders from date" /></label>
          <label><span>To Date:</span><input type="date" value={filters.toDate} onChange={(event) => onFiltersChange((current) => ({ ...current, toDate: event.target.value }))} aria-label="Sales orders to date" /></label>
        </>
      )}
      filterRow={(order) => {
        const customer = customerById[order.customerId]
        const buyerType = customer?.customerType === 'DEALER' || customer?.type === 'Dealer' ? 'Dealer' : 'Customer'
        const date = String(order.orderDate).slice(0, 10)
        return (filters.paymentMode === 'all' || (order.paymentMode ?? 'Online') === filters.paymentMode) &&
          (filters.saleType === 'all' || (order.saleType ?? 'Retail') === filters.saleType) &&
          (filters.buyerType === 'all' || buyerType === filters.buyerType) &&
          (!filters.fromDate || date >= filters.fromDate) && (!filters.toDate || date <= filters.toDate)
      }}
      actions={canExport ? <button type="button" className="recorded-table__export" onClick={onDownloadCsv}><FileDown size={13} /> Export</button> : null}
      emptyMessage="No sales orders found."
      ariaLabel="Sales orders"
      minWidth={900}
    />
  )
}
