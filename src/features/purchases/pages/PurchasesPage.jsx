import { FileDown, FileSpreadsheet, Plus, RefreshCw, Eye } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../../components/ui'
import { useAuth, useFirmContext } from '../../../context/hooks'
import { hasModulePermission } from '../../../core/accessControl'
import { formatMoney, getPurchases } from '../../../core/purchaseStore'
import { downloadCsv } from '../../../utils/csv'
import { RecordedTable } from '../../../components/recorded'
import { formatDate } from '../utils/purchaseUtils'
import '../styles/purchases.css'

const EMPTY_FILTERS = { search: '', invoiceType: 'all', purchaseType: 'all', dateFilter: 'all' }
const CSV_COLUMNS = [
  { key: 'vendorName', label: 'Seller' },
  { key: 'purchaseDate', label: 'Date' },
  { key: 'total', label: 'Total Bill Amount' },
  { key: 'paid', label: 'Paid Amount' },
  { key: 'due', label: 'Total Due Amount' },
  { key: 'paymentMode', label: 'Payment Mode' },
]

export default function PurchasesPage() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { currentFirmId } = useFirmContext()
  const canCreate = hasModulePermission(currentUser, 'Purchase Orders', 'create') || hasModulePermission(currentUser, 'Purchases', 'create')
  const canExport = hasModulePermission(currentUser, 'Purchases', 'export')
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const purchases = getPurchases({ search: filters.search })

  const exportCsv = () => {
    if (!canExport) return
    downloadCsv({ filename: 'vinayak-purchases.csv', columns: CSV_COLUMNS, rows: purchases })
  }

  const dateMatches = (purchase) => {
    if (filters.dateFilter === 'all') return true
    const date = new Date(purchase.purchaseDate)
    const now = new Date()
    if (filters.dateFilter === 'today') return date.toISOString().slice(0, 10) === now.toISOString().slice(0, 10)
    if (filters.dateFilter === 'month') return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
    return true
  }

  const columns = [
    { key: 'number', label: 'S.No', width: '52px', render: (purchase) => purchase.number },
    { key: 'vendorName', label: 'Seller', minWidth: '170px' },
    { key: 'purchaseDate', label: 'Date', width: '84px', render: (purchase) => formatDate(purchase.purchaseDate) },
    { key: 'total', label: 'Total Bill Amount', width: '110px', align: 'right', render: (purchase) => formatMoney(purchase.total) },
    { key: 'paid', label: 'Total Paid Amount', width: '105px', align: 'right', render: (purchase) => formatMoney(purchase.paid ?? 0) },
    { key: 'due', label: 'Total Due Amount', width: '105px', align: 'right', render: (purchase) => formatMoney(purchase.due ?? 0) },
    { key: 'paymentMode', label: 'Payment Mode', width: '85px', render: (purchase) => purchase.paymentMode ?? 'Online' },
    { key: 'action', label: 'Action', width: '55px', align: 'center', render: (purchase) => <button type="button" className="recorded-row-actions__button" onClick={() => navigate(`${currentFirmId ? `/firms/${currentFirmId}/workspace` : ''}/purchases/${purchase.id}`)} aria-label={`View ${purchase.number}`} title="View"><Eye size={13} /></button> },
  ]

  return (
    <div className="purchases-page">
      <header className="recorded-page-header">
        <h1>Purchases</h1>
        <div className="recorded-page-header__actions">
          <button type="button" className="recorded-icon-button" onClick={exportCsv} disabled={!canExport} title="Export PDF" aria-label="Export PDF"><FileDown size={14} /></button>
          <button type="button" className="recorded-icon-button" onClick={exportCsv} disabled={!canExport} title="Export Excel" aria-label="Export Excel"><FileSpreadsheet size={14} /></button>
          {canCreate && <Button size="sm" leadingIcon={<Plus size={14} />} onClick={() => navigate(`${currentFirmId ? `/firms/${currentFirmId}/workspace` : ''}/purchase-orders/new`)}>Create Purchase</Button>}
          <button type="button" className="recorded-icon-button" onClick={() => setFilters((current) => ({ ...current }))} title="Refresh purchases" aria-label="Refresh purchases"><RefreshCw size={14} /></button>
        </div>
      </header>

      <RecordedTable
        rows={purchases}
        columns={columns}
        getRowId={(purchase) => purchase.id}
        initialPageSize={10}
        pageSizeOptions={[5, 10, 15, 25]}
        search={filters.search}
        onSearchChange={(search) => setFilters((current) => ({ ...current, search }))}
        searchPlaceholder="Search orders or purchases"
        searchLabel="Search purchases"
        filters={(
          <>
            <label><span>Invoice Type:</span><select value={filters.invoiceType} onChange={(event) => setFilters((current) => ({ ...current, invoiceType: event.target.value }))}><option value="all">-- All Types --</option><option>Regular</option><option>Tax Invoice</option></select></label>
            <label><span>Type:</span><select value={filters.purchaseType} onChange={(event) => setFilters((current) => ({ ...current, purchaseType: event.target.value }))}><option value="all">-- All Types --</option><option>Internal</option><option>External</option></select></label>
            <label><span>Date Filter:</span><select value={filters.dateFilter} onChange={(event) => setFilters((current) => ({ ...current, dateFilter: event.target.value }))}><option value="all">All Dates</option><option value="today">Today</option><option value="month">This Month</option></select></label>
          </>
        )}
        filterRow={(purchase) => dateMatches(purchase)}
        emptyMessage="No purchases found."
        ariaLabel="Purchases"
        minWidth={790}
      />
    </div>
  )
}
