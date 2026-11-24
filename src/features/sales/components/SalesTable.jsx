import { useMemo } from 'react'
import { ActionMenu, Badge, Button, Select } from '../../../components/ui'
import { DataTable } from '../../../components/data-table'
import { getCustomers } from '../../../core/store'
import { getSaleTotals } from '../services/saleService'
import { formatMoney, formatDate, SALES_STATUSES } from './saleUtils'

const STATUS_VARIANTS = {
  Paid: 'success',
  Outstanding: 'warning',
  'Partially Paid': 'info',
  Delivered: 'success',
  Cancelled: 'danger',
}

export const SALES_CSV_COLUMNS = [
  { key: 'id', label: 'Sale ID' },
  { key: 'number', label: 'Document Number' },
  { key: 'type', label: 'Type' },
  { key: 'date', label: 'Date' },
  { key: 'customer', label: 'Customer' },
  { key: 'subtotal', label: 'Subtotal' },
  { key: 'taxTotal', label: 'Tax' },
  { key: 'total', label: 'Total' },
  { key: 'paid', label: 'Paid' },
  { key: 'due', label: 'Due' },
  { key: 'status', label: 'Status' },
]

export function saleCsvRows(sales) {
  return sales.map((sale) => {
    const totals = getSaleTotals(sale)
    return {
      id: sale.id,
      number: sale.number,
      type: sale.type,
      date: sale.date,
      customer: sale.customerName,
      subtotal: totals.subtotal,
      taxTotal: totals.taxTotal,
      total: sale.total ?? totals.total,
      paid: sale.paid ?? 0,
      due: sale.due ?? 0,
      status: sale.status,
    }
  })
}

export default function SalesTable({
  sales,
  filters,
  onFiltersChange,
  onClearFilters,
  onRowView,
  onRowCancel,
  onDownloadCsv,
}) {
  const customers = getCustomers()
  const columns = useMemo(
    () => [
      {
        id: 'number',
        header: 'Document',
        accessor: 'number',
        minWidth: '130px',
        cell: (sale) => (
          <span className="sales-doc">
            <span className="sales-doc__number">{sale.number}</span>
            <span className="sales-doc__type">{sale.type}</span>
          </span>
        ),
      },
      {
        id: 'customer',
        header: 'Customer',
        accessor: 'customerName',
        minWidth: '190px',
      },
      {
        id: 'date',
        header: 'Date',
        accessor: 'date',
        width: '120px',
        cell: (sale) => <span className="sales-date">{formatDate(sale.date)}</span>,
      },
      {
        id: 'total',
        header: 'Total',
        accessor: 'total',
        width: '110px',
        align: 'right',
        cell: (sale) => <span className="sales-money">{formatMoney(sale.total ?? getSaleTotals(sale).total)}</span>,
      },
      {
        id: 'paid',
        header: 'Paid',
        accessor: 'paid',
        width: '110px',
        align: 'right',
        cell: (sale) => <span className="sales-money">{formatMoney(sale.paid ?? 0)}</span>,
      },
      {
        id: 'due',
        header: 'Due',
        accessor: 'due',
        width: '110px',
        align: 'right',
        cell: (sale) => <span className="sales-money">{formatMoney(sale.due ?? 0)}</span>,
      },
      {
        id: 'status',
        header: 'Status',
        accessor: 'status',
        width: '120px',
        cell: (sale) => <Badge variant={STATUS_VARIANTS[sale.status] ?? 'neutral'} size="sm">{sale.status}</Badge>,
      },
      {
        id: 'actions',
        header: 'Actions',
        width: '70px',
        sortable: false,
        cell: (sale) => (
          <ActionMenu
            label="Sale actions"
            triggerLabel={`Actions for ${sale.number}`}
            items={[
              { label: 'View sale', onSelect: () => onRowView(sale.id) },
              { label: 'Cancel sale', danger: true, onSelect: () => onRowCancel(sale.id) },
            ]}
          />
        ),
      },
    ],
    [onRowView, onRowCancel],
  )

  return (
    <DataTable
      data={sales}
      columns={columns}
      getRowId={(sale) => sale.id}
      search={filters.search}
      onSearchChange={(search) => onFiltersChange({ search })}
      searchPlaceholder="Search invoice or challan number..."
      searchLabel="Search sales"
      minWidth={920}
      filtersActive={Boolean(filters.search || filters.customerId !== 'all' || filters.status !== 'all' || filters.type !== 'all' || filters.fromDate || filters.toDate)}
      onClearFilters={onClearFilters}
      filter={(sale) =>
        (filters.customerId === 'all' || sale.customerId === filters.customerId) &&
        (filters.status === 'all' || sale.status === filters.status) &&
        (filters.type === 'all' || sale.type === filters.type) &&
        (!filters.fromDate || String(sale.date).slice(0, 10) >= filters.fromDate) &&
        (!filters.toDate || String(sale.date).slice(0, 10) <= filters.toDate)
      }
      filterKey={`${filters.customerId}-${filters.status}-${filters.type}-${filters.fromDate}-${filters.toDate}`}
      selectable
      initialPageSize={10}
      actions={<Button variant="secondary" size="sm" onClick={() => onDownloadCsv(sales)}>Export CSV</Button>}
      filters={
        <div className="sales-filters">
          <Select
            label="Customer"
            options={[
              { value: 'all', label: 'All customers' },
              ...customers.map((customer) => ({ value: customer.id, label: customer.name })),
            ]}
            value={filters.customerId ?? 'all'}
            onChange={(event) => onFiltersChange({ customerId: event.target.value })}
            aria-label="Filter by customer"
          />
          <Select
            label="Type"
            options={[
              { value: 'all', label: 'Invoice & Challan' },
              { value: 'Invoice', label: 'Invoice' },
              { value: 'Challan', label: 'Challan' },
            ]}
            value={filters.type ?? 'all'}
            onChange={(event) => onFiltersChange({ type: event.target.value })}
            aria-label="Filter by type"
          />
          <Select
            label="Status"
            options={[{ value: 'all', label: 'All statuses' }, ...SALES_STATUSES]}
            value={filters.status ?? 'all'}
            onChange={(event) => onFiltersChange({ status: event.target.value })}
            aria-label="Filter by status"
          />
        </div>
      }
    />
  )
}
