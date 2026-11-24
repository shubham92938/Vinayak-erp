/* eslint-disable react-refresh/only-export-components */
import { useMemo } from 'react'
import { ActionMenu, Badge, Button, Select } from '../../../components/ui'
import { DataTable } from '../../../components/data-table'
import { getCustomers } from '../../../core/store'
import { getSaleOrderTotals } from './salesOrderUtils'
import { formatMoney, formatDate, SALES_ORDER_STATUSES } from './salesOrderUtils'

const STATUS_VARIANTS = {
  Draft: 'neutral',
  Pending: 'warning',
  Confirmed: 'info',
  Processing: 'info',
  'Partially Fulfilled': 'success',
  Completed: 'success',
  Cancelled: 'danger',
}

export function salesOrderCsvRows(orders) {
  return orders.map((order) => ({
    id: order.id,
    number: order.number,
    customer: order.customerName,
    orderDate: order.orderDate,
    expectedDelivery: order.expectedDelivery ?? '—',
    total: order.total,
    fulfilledQty: order.fulfilledQty ?? 0,
    status: order.status,
  }))
}

export const SALES_ORDER_CSV_COLUMNS = [
  { key: 'id', label: 'Order ID' },
  { key: 'number', label: 'Order Number' },
  { key: 'customer', label: 'Customer' },
  { key: 'orderDate', label: 'Order Date' },
  { key: 'expectedDelivery', label: 'Expected Delivery' },
  { key: 'total', label: 'Total' },
  { key: 'fulfilledQty', label: 'Fulfilled Qty' },
  { key: 'status', label: 'Status' },
]

export default function SalesOrderTable({
  orders,
  filters,
  onFiltersChange,
  onClearFilters,
  onRowView,
  onRowConfirm,
  onRowCancel,
  onDownloadCsv,
  canConfirm = true,
  canCancel = true,
  canExport = true,
}) {
  const columns = useMemo(
    () => [
      {
        id: 'number',
        header: 'Order',
        accessor: 'number',
        minWidth: '110px',
        cell: (order) => <span className="sales-order-num">{order.number}</span>,
      },
      {
        id: 'customer',
        header: 'Customer',
        accessor: 'customerName',
        minWidth: '160px',
      },
      {
        id: 'orderDate',
        header: 'Order Date',
        accessor: 'orderDate',
        width: '110px',
        cell: (order) => <span className="sales-date">{formatDate(order.orderDate)}</span>,
      },
      {
        id: 'expectedDelivery',
        header: 'Expected Delivery',
        accessor: 'expectedDelivery',
        width: '110px',
      },
      {
        id: 'total',
        header: 'Total',
        accessor: 'total',
        width: '110px',
        align: 'right',
        cell: (order) => <span className="sales-money">{formatMoney(order.total ?? getSaleOrderTotals(order).total)}</span>,
      },
      {
        id: 'fulfilled',
        header: 'Fulfilled',
        accessor: 'fulfilledQty',
        width: '100px',
        align: 'center',
      },
      {
        id: 'pendingQty',
        header: 'Pending Qty',
        accessor: (order) => getSaleOrderTotals(order).total - (order.fulfilledQty ?? 0),
        width: '100px',
        align: 'center',
      },
      {
        id: 'status',
        header: 'Status',
        accessor: 'status',
        width: '130px',
        cell: (order) => <Badge variant={STATUS_VARIANTS[order.status] ?? 'neutral'} size="sm">{order.status}</Badge>,
      },
      {
        id: 'actions',
        header: 'Actions',
        width: '70px',
        sortable: false,
        cell: (order) => (
          <ActionMenu
            label="Order actions"
            triggerLabel={`Actions for ${order.number}`}
            items={[
              { label: 'View details', onSelect: () => onRowView(order.id) },
              { label: 'Confirm order', disabled: !canConfirm, onSelect: () => onRowConfirm(order.id) },
              { label: 'Cancel order', danger: true, disabled: !canCancel, onSelect: () => onRowCancel(order.id) },
            ]}
          />
        ),
      },
    ],
    [onRowView, onRowConfirm, onRowCancel, canConfirm, canCancel],
  )

  return (
    <DataTable
      data={orders}
      columns={columns}
      getRowId={(order) => order.id}
      search={filters.search}
      onSearchChange={(search) => onFiltersChange({ search })}
      searchPlaceholder="Search order number or customer..."
      searchLabel="Search orders"
      minWidth={920}
      selectable
      initialPageSize={10}
      actions={<Button variant="secondary" size="sm" onClick={() => onDownloadCsv(orders)} disabled={!canExport}>Export CSV</Button>}
      filters={
        <div className="sales-order-filters">
          <Select
            label="Customer"
            options={[{ value: 'all', label: 'All customers' }, ...getCustomers().map((customer) => ({ value: customer.id, label: customer.name }))]}
            value={filters.customerId ?? 'all'}
            onChange={(event) => onFiltersChange({ customerId: event.target.value })}
            aria-label="Filter by customer"
          />
          <Select
            label="Status"
            options={SALES_ORDER_STATUSES}
            value={filters.status ?? 'all'}
            onChange={(event) => onFiltersChange({ status: event.target.value })}
            aria-label="Filter by status"
          />
        </div>
      }
      filtersActive={Boolean(filters.search || filters.customerId !== 'all' || filters.status !== 'all')}
      onClearFilters={onClearFilters}
      filter={(order) =>
        (filters.customerId === 'all' || order.customerId === filters.customerId) &&
        (filters.status === 'all' || order.status === filters.status)
      }
    />
  )
}
