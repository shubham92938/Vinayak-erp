import { FileDown, FileSpreadsheet, Plus, RefreshCw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, useFirmContext } from '../../../context/hooks'
import { hasModulePermission } from '../../../core/accessControl'
import { cancelSale, getSalesFiltered } from '../../../core/salesStore'
import { Button, ConfirmDialog, useToast } from '../../../components/ui'
import { downloadCsv } from '../../../utils/csv'
import SalesTable, { SALES_CSV_COLUMNS, saleCsvRows } from '../components/SalesTable'
import '../styles/sales.css'

const EMPTY_FILTERS = { search: '', paymentMode: 'all', buyerType: 'all', dateFilter: 'all' }

export default function SalesPage() {
  const toast = useToast()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { currentFirmId } = useFirmContext()
  const canCreateSales = hasModulePermission(currentUser, 'Sales', 'create')
  const canCancelSales = hasModulePermission(currentUser, 'Sales', 'edit')
  const canExportSales = hasModulePermission(currentUser, 'Sales', 'export')
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [confirmState, setConfirmState] = useState(null)
  const sales = useMemo(() => getSalesFiltered({ search: filters.search }), [filters.search])

  const exportCsv = () => {
    if (!canExportSales) return
    downloadCsv({ filename: 'vinayak-sales.csv', columns: SALES_CSV_COLUMNS, rows: saleCsvRows(sales) })
  }

  const cancel = () => {
    if (!canCancelSales || !confirmState) return
    const result = cancelSale(confirmState.id)
    if (result) toast.success('Sale cancelled')
    setConfirmState(null)
  }

  return (
    <div className="sales-page">
      <header className="recorded-page-header">
        <h1>Sales</h1>
        <div className="recorded-page-header__actions">
          <button type="button" className="recorded-icon-button" onClick={exportCsv} disabled={!canExportSales} title="Export PDF" aria-label="Export PDF"><FileDown size={14} /></button>
          <button type="button" className="recorded-icon-button" onClick={exportCsv} disabled={!canExportSales} title="Export Excel" aria-label="Export Excel"><FileSpreadsheet size={14} /></button>
          <button type="button" className="recorded-icon-button" onClick={() => setFilters((current) => ({ ...current }))} title="Refresh sales" aria-label="Refresh sales"><RefreshCw size={14} /></button>
          {canCreateSales && <Button size="sm" leadingIcon={<Plus size={14} />} onClick={() => navigate(`${currentFirmId ? `/firms/${currentFirmId}/workspace` : ''}/sales/new`)}>Create Sales Order</Button>}
        </div>
      </header>

      <SalesTable
        sales={sales}
        filters={filters}
        onFiltersChange={setFilters}
        onRowView={(id) => navigate(`${currentFirmId ? `/firms/${currentFirmId}/workspace` : ''}/sales/${id}`)}
        onRowCancel={(id) => setConfirmState({ id })}
        onDownloadCsv={exportCsv}
        canCancel={canCancelSales}
        canExport={canExportSales}
      />

      <ConfirmDialog
        open={Boolean(confirmState)}
        onClose={() => setConfirmState(null)}
        onConfirm={cancel}
        title="Cancel sale?"
        description="This will mark the selected sale as cancelled."
        confirmLabel="Cancel Sale"
        cancelLabel="Keep Sale"
        tone="danger"
      />
    </div>
  )
}
