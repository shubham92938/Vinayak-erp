import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, ConfirmDialog, useToast } from '../../../components/ui'
import { downloadCsv } from '../../../utils/csv'
import { getSales, getSalesFiltered } from '../../../core/salesStore'
import SaleTable, { SALES_CSV_COLUMNS, saleCsvRows } from '../components/SalesTable'
import { formatDate, formatMoney } from '../components/saleUtils'
import '../styles/sales.css'

export default function SalesPage() {
  const toast = useToast()
  const navigate = useNavigate()
  const [filters, setFilters] = useState({ search: '', customerId: 'all', status: 'all', type: 'all', fromDate: '', toDate: '' })
  const [confirmState, setConfirmState] = useState(null)

  const sales = getSalesFiltered(filters)
  const kpis = getSalesKpis()

  const handleCancelSale = (saleId) => {
    const sale = sales.find((entry) => entry.id === saleId)
    setConfirmState({ type: 'cancel', sale })
  }

  const confirmCancel = () => {
    const { mockSales } = require('../../../core/salesStore')
    if (!confirmState?.sale) return
    const index = mockSales.findIndex((entry) => entry.id === confirmState.sale.id)
    if (index !== -1) {
      mockSales[index] = { ...mockSales[index], status: 'Cancelled', due: 0, paid: 0 }
    }
    toast.success('Sale cancelled')
    setConfirmState(null)
  }

  const exportCsv = () => {
    downloadCsv({
      filename: 'vinayak-sales.csv',
      columns: SALES_CSV_COLUMNS,
      rows: saleCsvRows(sales),
    })
  }

  return (
    <div className="sales-page">
      <header className="sales-header">
        <div className="sales-header__top">
          <div className="sales-header__text">
            <p className="sales-header__eyebrow"><span aria-hidden="true">#</span> Sales</p>
            <h1 className="sales-header__title">Sales</h1>
            <p className="sales-header__description">
              Manage invoices and challans with automated stock and balance updates.
            </p>
          </div>
          <div className="sales-header__actions">
            <Button variant="secondary" onClick={exportCsv}>Export CSV</Button>
            <Button size="sm" onClick={() => navigate('/sales', { replace: false })}>Refresh</Button>
          </div>
        </div>
        <div className="sales-kpi-grid">
          <KpiCard label="Total Sales" value={formatMoney(kpis.totalSales)} icon={42} />
          <KpiCard label="Total Invoices" value={kpis.totalInvoices} icon={43} />
          <KpiCard label="Total Challans" value={kpis.totalChallans} icon={44} />
          <KpiCard label="Paid Amount" value={formatMoney(kpis.paid)} icon={45} />
          <KpiCard label="Pending Amount" value={formatMoney(kpis.pending)} icon={46} />
        </div>
      </header>

      <SaleTable
        sales={sales}
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={() => setFilters({ search: '', customerId: 'all', status: 'all', type: 'all', fromDate: '', toDate: '' })}
        onRowView={(id) => navigate(`/sales/${id}`)}
        onRowCancel={handleCancelSale}
        onDownloadCsv={exportCsv}
      />

      <ConfirmDialog
        open={confirmState?.type === 'cancel'}
        onClose={() => setConfirmState(null)}
        onConfirm={confirmCancel}
        title="Cancel sale?"
        description={`Cancel ${confirmState?.sale?.number ?? ''} and restore its amounts.`}
        confirmLabel="Cancel Sale"
        cancelLabel="Keep Sale"
        tone="danger"
      />
    </div>
  )
}

function getSalesKpis() {
  const sales = getSales()
  return {
    totalSales: sales.reduce((sum, sale) => sum + (sale.total ?? 0), 0),
    totalInvoices: sales.filter((sale) => sale.type === 'Invoice').length,
    totalChallans: sales.filter((sale) => sale.type === 'Challan').length,
    paid: sales.reduce((sum, sale) => sum + (sale.paid ?? 0), 0),
    pending: sales.reduce((sum, sale) => sum + (sale.due ?? 0), 0),
  }
}

function KpiCard({ label, value, icon }) {
  return (
    <div className="sales-kpi-card">
      <div className="sales-kpi-card__top">
        <span className="sales-kpi-card__label">{label}</span>
        <span className="sales-kpi-card__value">{value}</span>
      </div>
    </div>
  )
}
