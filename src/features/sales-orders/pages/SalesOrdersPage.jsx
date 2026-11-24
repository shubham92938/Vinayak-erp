import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, useToast } from '../../../components/ui'
import { downloadCsv } from '../../../utils/csv'
import { getSalesOrders } from '../services/salesOrderService'
import SalesOrderTable, { salesOrderCsvRows, SALES_ORDER_CSV_COLUMNS } from '../components/SalesOrderTable'
import '../styles/salesOrders.css'

export default function SalesOrdersPage() {
  const toast = useToast()
  const navigate = useNavigate()
  const [filters, setFilters] = useState({ search: '', customerId: 'all', status: 'all' })

  const orders = getSalesOrders(filters)

  const kpis = {
    totalOrders: orders.length,
    pending: orders.filter((order) => order.status === 'Pending').length,
    total: orders.reduce((sum, order) => sum + order.total, 0),
    fulfilled: orders.filter((order) => order.status === 'Completed').length,
  }

  const exportCsv = () => {
    downloadCsv({
      filename: 'vinayak-sales-orders.csv',
      columns: SALES_ORDER_CSV_COLUMNS,
      rows: salesOrderCsvRows(orders),
    })
  }

  return (
    <div className="sales-orders-page">
      <header className="sales-orders-header">
        <div className="sales-orders-header__top">
          <div className="sales-orders-header__text">
            <p className="sales-orders-header__eyebrow"><span aria-hidden="true">#</span> Sales Orders</p>
            <h1 className="sales-orders-header__title">Sales Orders</h1>
            <p className="sales-orders-header__description">
              Track orders from Draft through to Completed fulfillment.
            </p>
          </div>
          <div className="sales-orders-header__actions">
            <Button variant="secondary" onClick={exportCsv}>Export CSV</Button>
          </div>
        </div>
        <div className="sales-orders-kpi-grid">
          <KpiCard label="Total Orders" value={kpis.totalOrders} />
          <KpiCard label="Pending Orders" value={kpis.pending} />
          <KpiCard label="Completed Orders" value={kpis.fulfilled} />
        </div>
      </header>

      <SalesOrderTable
        orders={orders}
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={() => setFilters({ search: '', customerId: 'all', status: 'all' })}
        onRowView={(id) => navigate(`/sales-orders/${id}`)}
        onRowConfirm={(id) => {
          const { confirmSalesOrder } = require('../services/salesOrderService')
          confirmSalesOrder(id)
          toast.success('Order confirmed')
        }}
        onRowCancel={(id) => {
          const { cancelSalesOrder } = require('../services/salesOrderService')
          cancelSalesOrder(id)
          toast.success('Order cancelled')
        }}
        onDownloadCsv={exportCsv}
      />
    </div>
  )
}

function KpiCard({ label, value }) {
  return (
    <div className="sales-orders-kpi-card">
      <div className="sales-orders-kpi-card__label">{label}</div>
      <div className="sales-orders-kpi-card__value">{value}</div>
    </div>
  )
}
