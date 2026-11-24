import { FileDown, FileSpreadsheet, RefreshCw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useAuth } from '../../../context/hooks'
import { hasModulePermission } from '../../../core/accessControl'
import { downloadCsv } from '../../../utils/csv'
import { getPriceListRows } from '../services/priceListService'
import PriceListTable from '../components/PriceListTable'
import '../../products/styles/products.css'
import '../styles/price-list.css'

const CSV_COLUMNS = [
  { key: 'name', label: 'Product' },
  { key: 'code', label: 'Code' },
  { key: 'category', label: 'Category' },
  { key: 'firm', label: 'Firm' },
  { key: 'sellingPrice', label: 'Price' },
]

export default function PriceListPage() {
  const { currentUser } = useAuth()
  const canExport = hasModulePermission(currentUser, 'Price List', 'export')
  const [filters, setFilters] = useState({ firmId: 'all', categoryId: 'all', search: '' })
  const rows = useMemo(() => getPriceListRows(filters), [filters])

  const exportCsv = () => {
    if (!canExport) return
    downloadCsv({ filename: 'vinayak-price-list.csv', columns: CSV_COLUMNS, rows })
  }

  return (
    <div className="price-list-page">
      <header className="recorded-page-header">
        <h1>PriceList</h1>
        <div className="recorded-page-header__actions">
          <button type="button" className="recorded-icon-button" onClick={exportCsv} disabled={!canExport} title="Export PDF" aria-label="Export PDF"><FileDown size={14} /></button>
          <button type="button" className="recorded-icon-button" onClick={exportCsv} disabled={!canExport} title="Export Excel" aria-label="Export Excel"><FileSpreadsheet size={14} /></button>
          <button type="button" className="recorded-icon-button" onClick={() => setFilters((current) => ({ ...current }))} title="Refresh price list" aria-label="Refresh price list"><RefreshCw size={14} /></button>
        </div>
      </header>
      <PriceListTable rows={rows} filters={filters} onFiltersChange={setFilters} />
    </div>
  )
}
