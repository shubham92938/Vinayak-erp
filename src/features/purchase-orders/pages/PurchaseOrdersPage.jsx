import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/hooks'
import { hasModulePermission } from '../../../core/accessControl'
import { Button, Select, useToast } from '../../../components/ui'
import { DataTable } from '../../../components/data-table'
import { downloadCsv } from '../../../utils/csv'
import { getPurchaseOrders, formatMoney, confirmPurchaseOrder, orderStock } from '../../../core/purchaseOrderStore'
import { PURCHASE_ORDER_STATUSES } from '../../../core/purchaseOrderStore'
import { formatDate } from './purchaseOrderUtils'
import '../styles/purchaseOrders.css'

export default function PurchaseOrdersPage() {
  const toast = useToast()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const canCreateOrders = hasModulePermission(currentUser, 'Purchase Orders', 'create')
  const canApproveOrders = hasModulePermission(currentUser, 'Purchase Orders', 'approve')
  const canReceiveOrders = hasModulePermission(currentUser, 'Purchase Orders', 'edit')
  const canExportOrders = hasModulePermission(currentUser, 'Purchase Orders', 'export')
  const [filters, setFilters] = useState({ search: '', status: 'all' })

  const orders = getPurchaseOrders(filters)
  const kpis = {
    totalOrders: orders.length,
    received: orders.filter((order) => order.status === 'Received').length,
    total: orders.reduce((sum, order) => sum + order.total, 0),
    pending: orders.reduce((order, order2) => order + order2.receivedQty, 0),
  }

  const handleApprove = (order) => {
    if (!canApproveOrders) return
    confirmPurchaseOrder(order.id)
    toast.success('Purchase order approved')
  }

  const handleReceive = (order) => {
    if (!canReceiveOrders) return
    orderStock(order.id, order.items)
    toast.success('Goods received. Stock updated.')
  }

  return (
    <div className="purchase-orders-page">
      <header className="purchase-orders-header">
        <div className="purchase-orders-header__top">
          <div className="purchase-orders-header__text">
            <p className="purchase-orders-header__eyebrow"><span aria-hidden="true">#</span> Purchase Orders</p>
            <h1 className="purchase-orders-header__title">Purchase Orders</h1>
            <p className="purchase-orders-header__description">Track vendor orders through approval and receipt.</p>
          </div>
          <div className="purchase-orders-header__actions">
            {canCreateOrders && <Button size="sm" leadingIcon={<Plus size={14} />} onClick={() => navigate('new')}>Create Purchase Order</Button>}
            <Button variant="secondary" onClick={() => downloadCsvOrders(orders)} disabled={!canExportOrders}>Export CSV</Button>
          </div>
        </div>
        <div className="purchase-orders-kpi-grid">
          <KpiCard label="Total Orders" value={kpis.totalOrders} />
          <KpiCard label="Received Orders" value={kpis.received} />
          <KpiCard label="Total Value" value={formatMoney(kpis.total)} />
        </div>
      </header>

      <DataTable
        data={orders}
        columns={buildColumns(navigate, handleApprove, handleReceive, canApproveOrders, canReceiveOrders)}
        getRowId={(order) => order.id}
        search={filters.search}
        onSearchChange={(search) => setFilters((current) => ({ ...current, search }))}
        searchPlaceholder="Search order number or vendor..."
        minWidth={780}
        selectable
        initialPageSize={10}
        filters={
          <Select
            label="Status"
            options={PURCHASE_ORDER_STATUSES}
            value={filters.status}
            onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
          />
        }
        filter={(order) => order.status === filters.status || filters.status === 'all'}
      />
    </div>
  )
}

function downloadCsvOrders(orders) {
  const rows = orders.map((order) => ({
    id: order.id,
    number: order.number,
    vendorName: order.vendorName,
    orderDate: order.orderDate,
    expectedDelivery: order.expectedDelivery ?? '—',
    subtotal: order.subtotal,
    taxTotal: order.taxTotal,
    total: order.total,
    receivedQty: order.receivedQty ?? 0,
    status: order.status,
  }))
  downloadCsv({ filename: 'vinayak-purchase-orders.csv', columns: CSV_COLUMNS, rows })
}

const CSV_COLUMNS = [
  { key: 'id', label: 'ID' },
  { key: 'number', label: 'Number' },
  { key: 'vendorName', label: 'Vendor' },
  { key: 'orderDate', label: 'Order Date' },
  { key: 'expectedDelivery', label: 'Expected Delivery' },
  { key: 'subtotal', label: 'Subtotal' },
  { key: 'taxTotal', label: 'Tax' },
  { key: 'total', label: 'Total' },
  { key: 'receivedQty', label: 'Received Qty' },
  { key: 'status', label: 'Status' },
]

function buildColumns(navigate, handleApprove, handleReceive, canApproveOrders, canReceiveOrders) {
  return [
    { id: 'number', header: 'Order Number', accessor: 'number', minWidth: '120px' },
    { id: 'vendorName', header: 'Vendor', accessor: 'vendorName', minWidth: '160px' },
    { id: 'orderDate', header: 'Order Date', accessor: 'orderDate', width: '110px', cell: (row) => <span className="purchase-orders-date">{formatDate(row.orderDate)}</span> },
    { id: 'expectedDelivery', header: 'Expected Delivery', accessor: 'expectedDelivery', width: '110px' },
    { id: 'subtotal', header: 'Subtotal', accessor: 'subtotal', width: '100px', align: 'right', cell: (row) => <span className="purchase-orders-money">{formatMoney(row.subtotal)}</span> },
    { id: 'taxTotal', header: 'Tax', accessor: 'taxTotal', width: '90px', align: 'right', cell: (row) => <span className="purchase-orders-money">{formatMoney(row.taxTotal)}</span> },
    { id: 'total', header: 'Total', accessor: 'total', width: '100px', align: 'right', cell: (row) => <span className="purchase-orders-money">{formatMoney(row.total)}</span> },
    { id: 'receivedQty', header: 'Received Qty', accessor: 'receivedQty', width: '90px', align: 'center' },
    { id: 'pendingQty', header: 'Pending', accessor: (row) => Math.max(0, row.items.reduce((sum, item) => sum + item.qty, 0) - (row.receivedQty ?? 0)), width: '80px', align: 'center' },
    {
      id: 'status',
      header: 'Status',
      accessor: 'status',
      width: '130px',
      cell: (row) => <BadgeBadge row={row} />,
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
            { label: 'View details', onSelect: () => navigate(`/purchase-orders/${row.id}`) },
            { label: 'Approve order', disabled: row.status !== 'Draft' || !canApproveOrders, onSelect: () => handleApprove(row) },
            { label: 'Record receipt', disabled: !(row.status === 'Approved' || row.status === 'Partially Received') || !canReceiveOrders, onSelect: () => handleReceive(row) },
          ]}
        />
      ),
    },
  ]
}

function BadgeBadge({ row }) {
  const variant = row.status === 'Received' ? 'success' : row.status === 'Partially Received' ? 'info' : row.status === 'Approved' ? 'success' : row.status === 'Ordered' ? 'info' : row.status === 'Draft' ? 'neutral' : 'danger'
  return <Badge variant={variant} size="sm">{row.status}</Badge>
}

function KpiCard({ label, value }) {
  return (
    <div className="purchase-orders-kpi-card">
      <span className="purchase-orders-kpi-card__label">{label}</span>
      <span className="purchase-orders-kpi-card__value">{value}</span>
    </div>
  )
}

import { ActionMenu, Badge } from '../../../components/ui'
