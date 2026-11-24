import { useState } from 'react'
import { Button, Card, CardBody } from '../../../components/ui'
import { DataTable } from '../../../components/data-table'
import { downloadCsv } from '../../../utils/csv'
import { formatMoney } from '../../../core/store'
import {
  getSalesReport,
  getTopProductsByRevenue,
  getPurchaseReport,
  getTopVendorsBySpend,
  getInventoryReport,
  getFinancialReport,
  getFinancialSummary,
  getCustomerLedgerReport,
} from '../services/reportService'
import '../styles/reports.css'

const SECTIONS = ['Sales', 'Purchases', 'Inventory', 'Financial']

export default function ReportsPage() {
  const [section, setSection] = useState('Sales')

  return (
    <div className="reports-page">
      <header className="reports-header">
        <div className="reports-header__top">
          <div className="reports-header__text">
            <p className="reports-header__eyebrow"><span aria-hidden="true">#</span> Reports</p>
            <h1 className="reports-header__title">Business Reports</h1>
            <p className="reports-header__description">Sales, purchase, inventory and financial reports. Export any table to CSV.</p>
          </div>
        </div>
        <div className="reports-section-tabs">
          {SECTIONS.map((name) => (
            <button
              key={name}
              type="button"
              className={['reports-section-tab', section === name && 'reports-section-tab--active'].filter(Boolean).join(' ')}
              onClick={() => setSection(name)}
            >
              {name}
            </button>
          ))}
        </div>
      </header>

      {section === 'Sales' && <SalesReport />}
      {section === 'Purchases' && <PurchasesReport />}
      {section === 'Inventory' && <InventoryReport />}
      {section === 'Financial' && <FinancialReport />}
    </div>
  )
}

function TableCard({ title, columns, rows, csvName, alignMap = {} }) {
  if (rows.length === 0) {
    return (
      <Card className="reports-card">
        <CardBody>
          <h3 className="reports-title">{title}</h3>
          <p className="reports-empty">No data to report for this period.</p>
        </CardBody>
      </Card>
    )
  }

  const dataColumns = columns.map((column) => ({
    ...column,
    cell: column.cell ?? ((row) => formatTableCell(column.id, row, alignMap)),
  }))

  return (
    <Card className="reports-card">
      <CardBody>
        <div className="reports-card-header">
          <h3 className="reports-title">{title}</h3>
          <Button variant="secondary" size="sm" onClick={() => exportCsv(`vinayak-${csvName}.csv`, columns, rows)}>Export CSV</Button>
        </div>
        <DataTable data={rows} columns={dataColumns} getRowId={(row, index) => row.key ?? index} minWidth={700} />
      </CardBody>
    </Card>
  )
}

function formatTableCell(id, row, alignMap) {
  if (id.endsWith('money') || alignMap[id] === 'right') {
    return <span className="reports-money">{formatMoney(row[id])}</span>
  }
  if (id.endsWith('count')) {
    return <span className="reports-count">{row[id]}</span>
  }
  return String(row[id] ?? '')
}

function exportCsv(filename, columns, rows) {
  downloadCsv({
    filename,
    columns: columns.map((column) => ({ key: column.id, label: column.header })),
    rows: rows.map((row) => Object.fromEntries(columns.map((column) => [column.id, row[column.id] ?? '']))),
  })
}

function KpiCard({ label, value }) {
  return (
    <div className="reports-kpi-card">
      <span className="reports-kpi-card__label">{label}</span>
      <span className="reports-kpi-card__value">{value}</span>
    </div>
  )
}

function KpiGrid({ children }) {
  return <div className="reports-kpi-grid">{children}</div>
}

function SalesReport() {
  const sales = getSalesReport()
  const topProducts = getTopProductsByRevenue()
  const totalSales = sales.reduce((sum, row) => sum + row.total, 0)
  const count = sales.reduce((sum, row) => sum + row.count, 0)

  return (
    <>
      <KpiGrid>
        <KpiCard label="Months Covered" value={sales.length} />
        <KpiCard label="Transactions" value={count} />
        <KpiCard label="Total Revenue" value={formatMoney(totalSales)} />
      </KpiGrid>
      <div className="reports-grid">
        <TableCard title="Sales by Month" columns={[
          { id: 'month', header: 'Month' },
          { id: 'count', header: 'Transactions' },
          { id: 'total', header: 'Revenue' },
        ]} rows={sales} csvName="sales-by-month" />
        <TableCard title="Top Products by Revenue" columns={[
          { id: 'productId', header: 'Product' },
          { id: 'value', header: 'Revenue' },
        ]} rows={topProducts} csvName="top-products" />
      </div>
    </>
  )
}

function PurchasesReport() {
  const purchases = getPurchaseReport()
  const topVendors = getTopVendorsBySpend()
  const total = purchases.reduce((sum, row) => sum + row.total, 0)

  return (
    <>
      <KpiGrid>
        <KpiCard label="Months Covered" value={purchases.length} />
        <KpiCard label="Purchase Orders" value={purchases.reduce((sum, row) => sum + row.count, 0)} />
        <KpiCard label="Total Spend" value={formatMoney(total)} />
      </KpiGrid>
      <div className="reports-grid">
        <TableCard title="Purchases by Month" columns={[
          { id: 'month', header: 'Month' },
          { id: 'count', header: 'Orders' },
          { id: 'total', header: 'Spend' },
        ]} rows={purchases} csvName="purchases-by-month" />
        <TableCard title="Top Vendors by Spend" columns={[
          { id: 'vendor', header: 'Vendor' },
          { id: 'value', header: 'Spend' },
        ]} rows={topVendors} csvName="top-vendors" />
      </div>
    </>
  )
}

function InventoryReport() {
  const rows = getInventoryReport()
  const movedIn = rows.reduce((sum, row) => sum + row.movedIn, 0)
  const movedOut = rows.reduce((sum, row) => sum + row.movedOut, 0)
  const adjusted = rows.reduce((sum, row) => sum + row.adjusted, 0)
  const lowStocks = rows.filter((row) => row.currentStock < 5)

  return (
    <>
      <KpiGrid>
        <KpiCard label="Stock In" value={formatMoney(movedIn)} />
        <KpiCard label="Stock Out" value={formatMoney(movedOut)} />
        <KpiCard label="Adjustments" value={formatMoney(adjusted)} />
        <KpiCard label="Low Stock Alerts" value={lowStocks.length} />
      </KpiGrid>
      <TableCard title="Stock Movement by Product" columns={[
        { id: 'productName', header: 'Product' },
        { id: 'movedIn', header: 'Received' },
        { id: 'movedOut', header: 'Issued' },
        { id: 'adjusted', header: 'Adjusted' },
        { id: 'netChange', header: 'Net Change' },
        { id: 'currentStock', header: 'Current Stock' },
      ]} rows={rows} csvName="inventory-report" />
    </>
  )
}

function FinancialReport() {
  const summary = getFinancialSummary()
  const ledger = getCustomerLedger()
  const financialRows = getFinancialReport()

  return (
    <>
      <KpiGrid>
        <KpiCard label="Revenue (Sales)" value={formatMoney(summary.sales)} />
        <KpiCard label="Purchases" value={formatMoney(summary.purchases)} />
        <KpiCard label="Expenses" value={formatMoney(summary.expenses)} />
        <KpiCard label="Gross (Credits)" value={formatMoney(summary.credit)} />
        <KpiCard label="Debits" value={formatMoney(summary.debit)} />
      </KpiGrid>
      <div className="reports-grid">
        <TableCard title="Financial Summary by Account" columns={[
          { id: 'accountName', header: 'Account' },
          { id: 'totalCredit', header: 'Total Credit' },
          { id: 'totalDebit', header: 'Total Debit' },
          { id: 'net', header: 'Net Balance' },
        ]} rows={financialRows} csvName="financial-report" />
        <TableCard title="Customer Ledger (Outstanding)" columns={[
          { id: 'name', header: 'Customer' },
          { id: 'openingBalance', header: 'Opening' },
          { id: 'currentBalance', header: 'Current Balance' },
          { id: 'outstanding', header: 'Outstanding' },
        ]} rows={ledger} csvName="customer-ledger" />
      </div>
    </>
  )
}

function getCustomerLedger() {
  return getCustomerLedgerReport()
}
