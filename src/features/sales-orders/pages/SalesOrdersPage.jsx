import { Plus, RefreshCw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../../components/ui'
import { useAuth, useFirmContext } from '../../../context/hooks'
import { hasModulePermission } from '../../../core/accessControl'
import { getSalesOrders } from '../services/salesOrderService'
import SalesOrderTable, { salesOrderCsvRows, SALES_ORDER_CSV_COLUMNS } from '../components/SalesOrderTable'
import { downloadCsv } from '../../../utils/csv'
import '../styles/salesOrders.css'

const EMPTY_FILTERS = { search: '', paymentMode: 'all', saleType: 'all', buyerType: 'all', fromDate: '', toDate: '' }

export default function SalesOrdersPage() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { currentFirmId } = useFirmContext()
  const canCreate = hasModulePermission(currentUser, 'Sales Orders', 'create')
  const canExport = hasModulePermission(currentUser, 'Sales Orders', 'export')
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const orders = useMemo(() => getSalesOrders({ search: filters.search }), [filters.search])

  const exportCsv = () => {
    if (!canExport) return
    downloadCsv({ filename: 'vinayak-sales-orders.csv', columns: SALES_ORDER_CSV_COLUMNS, rows: salesOrderCsvRows(orders) })
  }

  return (
    <div className="sales-orders-page">
      <header className="recorded-page-header">
        <h1>Sales Orders</h1>
        <div className="recorded-page-header__actions">
          {canCreate && <Button size="sm" leadingIcon={<Plus size={14} />} onClick={() => navigate(`${currentFirmId ? `/firms/${currentFirmId}/workspace` : ''}/sales-orders/new`)} aria-label="Create sales order">Create</Button>}
          <button type="button" className="recorded-icon-button" onClick={() => setFilters((current) => ({ ...current }))} title="Refresh sales orders" aria-label="Refresh sales orders"><RefreshCw size={14} /></button>
        </div>
      </header>

      <SalesOrderTable
        orders={orders}
        filters={filters}
        onFiltersChange={setFilters}
        onRowView={(id) => navigate(`${currentFirmId ? `/firms/${currentFirmId}/workspace` : ''}/sales-orders/${id}`)}
        onDownloadCsv={exportCsv}
        canExport={canExport}
      />
    </div>
  )
}
