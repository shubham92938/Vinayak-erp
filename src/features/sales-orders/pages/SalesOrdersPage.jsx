import { Plus, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth, useFirmContext } from '../../../context/hooks'
import { hasModulePermission } from '../../../core/accessControl'
import { getSalesOrders } from '../services/salesOrderService'
import SalesOrderTable, { salesOrderCsvRows, SALES_ORDER_CSV_COLUMNS } from '../components/SalesOrderTable'
import { downloadCsv } from '../../../utils/csv'
import '../styles/salesOrders.css'

const EMPTY_FILTERS = { search: '', paymentMode: 'all', saleType: 'all', buyerType: 'all', fromDate: '', toDate: '' }

export default function SalesOrdersPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser } = useAuth()
  const { currentFirmId } = useFirmContext()
  const routePrefix = location.pathname.startsWith('/firms/') && currentFirmId
    ? `/firms/${currentFirmId}/workspace`
    : ''
  const isRecordedOrdersRoute = location.pathname.endsWith('/orders')
  const canCreate = hasModulePermission(currentUser, 'Sales Orders', 'create')
  const canExport = hasModulePermission(currentUser, 'Sales Orders', 'export')
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const orders = getSalesOrders({ search: filters.search })

  const exportCsv = () => {
    if (!canExport) return
    downloadCsv({ filename: 'vinayak-sales-orders.csv', columns: SALES_ORDER_CSV_COLUMNS, rows: salesOrderCsvRows(orders) })
  }

  return (
    <div className={['sales-orders-page', isRecordedOrdersRoute && 'sales-orders-page--recorded'].filter(Boolean).join(' ')}>
      <header className="recorded-page-header">
        <h1>Sales Orders</h1>
        <div className="recorded-page-header__actions">
          {canCreate && <button type="button" className="recorded-icon-button" onClick={() => navigate(`${routePrefix}/orders/create?source=orders`)} aria-label="Create sales order" title="Create sales order"><Plus size={16} /></button>}
          <button type="button" className="recorded-icon-button" onClick={() => setFilters((current) => ({ ...current }))} title="Refresh sales orders" aria-label="Refresh sales orders"><RefreshCw size={14} /></button>
        </div>
      </header>

      <SalesOrderTable
        orders={orders}
        filters={filters}
        onFiltersChange={setFilters}
        onRowView={(id) => navigate(isRecordedOrdersRoute ? `${routePrefix}/orders/details/${id}` : `${routePrefix}/sales-orders/${id}`)}
        onDownloadCsv={exportCsv}
        canExport={!isRecordedOrdersRoute && canExport}
      />
    </div>
  )
}
