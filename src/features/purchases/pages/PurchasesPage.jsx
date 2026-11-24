import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/hooks'
import { hasModulePermission } from '../../../core/accessControl'
import { ActionMenu, Badge, Button, ConfirmDialog, Select, useToast } from '../../../components/ui'
import { DataTable } from '../../../components/data-table'
import { downloadCsv } from '../../../utils/csv'
import { getPurchases, formatMoney, deletePurchase, confirmPurchase } from '../../../core/purchaseStore'
import { PURCHASE_STATUSES } from '../services/purchaseService'
import { formatDate } from '../utils/purchaseUtils'
import '../styles/purchases.css'

const COLUMNS = [
  { key: 'number', label: 'Purchase Number' },
  { key: 'vendorName', label: 'Vendor' },
  { key: 'vendorInvoiceNumber', label: 'Vendor Invoice' },
  { key: 'purchaseDate', label: 'Date' },
  { key: 'total', label: 'Total' },
  { key: 'paid', label: 'Paid' },
  { key: 'due', label: 'Due' },
  { key: 'status', label: 'Status' },
]

export default function PurchasesPage() {
  const toast = useToast()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const canApprovePurchases = hasModulePermission(currentUser, 'Purchases', 'approve')
  const canDeletePurchases = hasModulePermission(currentUser, 'Purchases', 'delete')
  const canExportPurchases = hasModulePermission(currentUser, 'Purchases', 'export')
  const [filters, setFilters] = useState({ search: '', vendorName: 'all', status: 'all' })
  const [confirmState, setConfirmState] = useState(null)

  const purchases = getPurchases(filters)
  const kpis = getPurchaseKpis(purchases)

  const vendorOptions = useMemoVendorOptions()

  const onRowView = (purchaseId) => navigate(`/purchases/${purchaseId}`)

  const handleDelete = (purchaseId) => {
    if (!canDeletePurchases) return
    deletePurchase(purchaseId)
    toast.success('Purchase deleted')
  }

  const handleConfirm = (purchaseId) => {
    if (!canApprovePurchases) return
    confirmPurchase(purchaseId)
    toast.success('Purchase confirmed')
  }

  return (
    <div className="purchases-page">
      <header className="purchases-header">
        <div className="purchases-header__top">
          <div className="purchases-header__text">
            <p className="purchases-header__eyebrow"><span aria-hidden="true">#</span> Purchases</p>
            <h1 className="purchases-header__title">Purchases</h1>
            <p className="purchases-header__description">Manage vendor purchases, invoices and payments.</p>
          </div>
          <div className="purchases-header__actions">
            <Button variant="secondary" onClick={() => downloadCsv({ filename: 'vinayak-purchases.csv', columns: COLUMNS, rows: purchases })} disabled={!canExportPurchases}>Export CSV</Button>
          </div>
        </div>
        <div className="purchases-kpi-grid">
          <KpiCard label="Total Purchases" value={purchases.length} />
          <KpiCard label="Total Amount" value={formatMoney(kpis.total)} />
          <KpiCard label="Paid" value={formatMoney(kpis.paid)} />
          <KpiCard label="Pending" value={formatMoney(kpis.due)} />
        </div>
      </header>

      <DataTable
        data={purchases}
        columns={useTableColumns(onRowView, setConfirmState, canApprovePurchases, canDeletePurchases)}
        getRowId={(purchase) => purchase.id}
        search={filters.search}
        onSearchChange={(search) => setFilters((current) => ({ ...current, search }))}
        searchPlaceholder="Search purchase number or vendor..."
        minWidth={760}
        filtersActive={Boolean(filters.search || filters.vendorName !== 'all' || filters.status !== 'all')}
        filter={(purchase) =>
          (filters.vendorName === 'all' || purchase.vendorName === filters.vendorName) &&
          (filters.status === 'all' || purchase.status === filters.status)
        }
        selectable
        initialPageSize={10}
        filters={
          <div className="purchases-filters">
            <Select
              label="Vendor"
              options={vendorOptions}
              value={filters.vendorName}
              onChange={(event) => setFilters((current) => ({ ...current, vendorName: event.target.value }))}
            />
            <Select
              label="Status"
              options={PURCHASE_STATUSES}
              value={filters.status}
              onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
            />
          </div>
        }
      />

      <ConfirmDialog
        open={confirmState?.type === 'confirm'}
        onClose={() => setConfirmState(null)}
        onConfirm={() => {
          if (confirmState?.purchase) handleConfirm(confirmState.purchase.id)
          setConfirmState(null)
        }}
        title="Confirm purchase?"
        description={`Confirm ${confirmState?.purchase?.number ?? ''} and its inventory effect.`}
        confirmLabel="Confirm Purchase"
        cancelLabel="Cancel"
      />

      <ConfirmDialog
        open={confirmState?.type === 'delete'}
        onClose={() => setConfirmState(null)}
        onConfirm={() => {
          if (confirmState?.purchase) handleDelete(confirmState.purchase.id)
          setConfirmState(null)
        }}
        title="Delete purchase?"
        description={`${confirmState?.purchase?.number ?? ''} will be removed. Unpaid purchases should be confirmed first.`}
        confirmLabel="Delete Purchase"
        cancelLabel="Cancel"
        tone="danger"
      />
    </div>
  )
}

function useMemoVendorOptions() {
  const vendors = [...new Set(getPurchases().map((purchase) => purchase.vendorName))]
  const unique = [...new Set(vendors)]
  return [{ value: 'all', label: 'All vendors' }, ...unique.map((name) => ({ value: name, label: name }))]
}

function getPurchaseKpis(purchases) {
  return {
    total: purchases.reduce((sum, purchase) => sum + purchase.total, 0),
    paid: purchases.reduce((sum, purchase) => sum + purchase.paid, 0),
    due: purchases.reduce((sum, purchase) => sum + purchase.due, 0),
  }
}

function useTableColumns(onRowView, setConfirmState, canApprovePurchases, canDeletePurchases) {
  return [
    {
      id: 'number',
      header: 'Purchase Number',
      accessor: 'number',
      minWidth: '110px',
    },
    {
      id: 'vendorName',
      header: 'Vendor',
      accessor: 'vendorName',
      minWidth: '140px',
      cell: (row) => <span className="purchases-vendor">{row.vendorName}</span>,
    },
    {
      id: 'vendorInvoiceNumber',
      header: 'Vendor Invoice',
      accessor: 'vendorInvoiceNumber',
      width: '100px',
    },
    {
      id: 'purchaseDate',
      header: 'Date',
      accessor: 'purchaseDate',
      width: '110px',
      cell: (row) => <span className="purchases-date">{formatDate(row.purchaseDate)}</span>,
    },
    {
      id: 'total',
      header: 'Total',
      accessor: 'total',
      width: '100px',
      align: 'right',
      cell: (row) => <span className="purchases-money">{formatMoney(row.total)}</span>,
    },
    {
      id: 'paid',
      header: 'Paid',
      accessor: 'paid',
      width: '100px',
      align: 'right',
      cell: (row) => <span className="purchases-money">{formatMoney(row.paid)}</span>,
    },
    {
      id: 'due',
      header: 'Due',
      accessor: 'due',
      width: '100px',
      align: 'right',
      cell: (row) => <span className="purchases-money">{formatMoney(row.due)}</span>,
    },
    {
      id: 'status',
      header: 'Status',
      accessor: 'status',
      width: '110px',
      cell: (row) => <StatusBadge row={row} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      width: '70px',
      sortable: false,
      cell: (row) => (
        <ActionMenu
          label="Purchase actions"
          triggerLabel={`Actions for ${row.number}`}
          items={[
            { label: 'View purchase', onSelect: () => onRowView(row.id) },
            {
              label: 'Confirm purchase',
              disabled: !canApprovePurchases,
              onSelect: () => setConfirmState({ type: 'confirm', purchase: row }),
            },
            { label: 'Delete purchase', danger: true, disabled: !canDeletePurchases, onSelect: () => setConfirmState({ type: 'delete', purchase: row }) },
          ]}
        />
      ),
    },
  ]
}

function StatusBadge({ row }) {
  const variant = row.status === 'Paid' ? 'success' : row.status === 'Draft' ? 'neutral' : row.status === 'Confirmed' ? 'info' : row.status === 'Partially Paid' ? 'warning' : 'danger'
  return <Badge variant={variant} size="sm">{row.status}</Badge>
}

function KpiCard({ label, value }) {
  return (
    <div className="purchases-kpi-card">
      <span className="purchases-kpi-card__label">{label}</span>
      <span className="purchases-kpi-card__value">{value}</span>
    </div>
  )
}
