import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, useToast } from '../../../components/ui'
import { getSaleById, getPayments } from '../services/saleService'
import { formatMoney, formatDate } from '../components/saleUtils'
import { getCustomerById } from '../../../core/store'
import { getProducts } from '../../products/services/productService'
import InvoicePreview from '../components/InvoicePreview'
import PrintInvoice from '../components/PrintInvoice'
import PrintChallan from '../components/PrintChallan'
import { getSaleTotals } from '../services/saleService'
import '../styles/sales.css'

const TABS = ['Overview', 'Products', 'Payments', 'Activity']

export default function SaleDetailsPage() {
  const navigate = useNavigate()
  const { saleId } = useParams()
  const sale = getSaleById(saleId)
  const [tab, setTab] = useState('Overview')

  if (!sale) {
    return (
      <div className="sales-page">
        <h1>Sale not found</h1>
        <Button variant="secondary" onClick={() => navigate('/sales')}>Back to Sales</Button>
      </div>
    )
  }

  const totals = getSaleTotals(sale)
  const products = sale.items.map((item) => ({
    name: item.name,
    code: getProducts().find((product) => product.id === item.productId)?.code ?? '',
    qty: item.qty,
    unit: item.unit,
    price: item.price,
    taxPct: item.taxPct,
    discount: item.discount ?? 0,
  }))
  const payments = getPayments({ saleId })

  return (
    <div className="sales-page">
      <header className="sales-header">
        <div className="sales-details-header">
          <div className="sales-header__text">
            <p className="sales-header__eyebrow"><span aria-hidden="true">#</span> Sale Details</p>
            <h1 className="sales-header__title">{sale.number}</h1>
            <p className="sales-header__description">
              Customer: {sale.customerName} · {formatDate(sale.date)} · Total: {formatMoney(sale.total ?? totals.total)}
            </p>
          </div>
          <div className="sales-details-actions">
            <Button variant="secondary" onClick={() => navigate('/sales')}>Back to Sales</Button>
            <Button variant="secondary" onClick={() => window.print()}>Print</Button>
          </div>
        </div>

        <div className="sales-tabs">
          {TABS.map((tabName) => (
            <button
              key={tabName}
              type="button"
              className={['sales-tab', tab === tabName && 'sales-tab--active'].filter(Boolean).join(' ')}
              onClick={() => setTab(tabName)}
            >
              {tabName}
            </button>
          ))}
        </div>
      </header>

      {tab === 'Overview' && (
        <div className="sales-detail-grid">
          <Stat label="Customer" value={sale.customerName} />
          <Stat label="Status" value={sale.status} />
          <Stat label="Date" value={formatDate(sale.date)} />
          <Stat label="Total Amount" value={formatMoney(sale.total ?? totals.total)} />
          <Stat label="Paid Amount" value={formatMoney(sale.paid ?? 0)} />
          <Stat label="Due Amount" value={formatMoney(sale.due ?? 0)} />
          <Stat label="Items" value={sale.items.length} />
        </div>
      )}

      {tab === 'Products' && (
        <table className="sales-detail-table">
          <thead>
            <tr><th>Product</th><th>Code</th><th>Qty</th><th>Price</th><th className="align-right">Amount</th></tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr key={index}>
                <td>{product.name}</td>
                <td>{product.code}</td>
                <td>{product.qty}</td>
                <td>{formatMoney(product.price)}</td>
                <td className="align-right">{formatMoney(product.qty * product.price)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr><td colSpan={5} className="align-right"><strong>Total: {formatMoney(sale.total ?? totals.total)}</strong></td></tr>
          </tfoot>
        </table>
      )}

      {tab === 'Payments' && (
        <PaymentList payments={payments} />
      )}

      {tab === 'Activity' && <ActivitySale sale={sale} products={products} />}

      <div className="sales-print-area" hidden>
        {sale.type === 'Invoice' ? <PrintInvoice sale={sale} totals={totals} /> : <PrintChallan challan={sale} />}
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="sales-detail-stat">
      <span className="sales-detail-stat__label">{label}</span>
      <span className="sales-detail-stat__value">{value}</span>
    </div>
  )
}

function PaymentList({ payments }) {
  if (!payments.length) {
    return <p className="sales-empty">No payments recorded yet.</p>
  }
  return (
    <table className="sales-detail-table">
      <thead><tr><th>Date</th><th>Reference</th><th className="align-right">Amount</th><th>Mode</th></tr></thead>
      <tbody>
        {payments.map((payment) => (
          <tr key={payment.id}>
            <td>{formatDate(payment.date)}</td>
            <td>{payment.invoiceId}</td>
            <td className="align-right">{formatMoney(payment.amount)}</td>
            <td>{payment.mode}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function ActivitySale({ sale, products }) {
  return (
    <ul className="sales-activity">
      <li className="sales-activity__item">
        <strong>Sale created</strong> <small>{formatDate(sale.date)}</small>
      </li>
      {products.map((product) => (
        <li key={product.code} className="sales-activity__item">
          <strong>{product.name}</strong> <small>{product.code}</small>
        </li>
      ))}
    </ul>
  )
}
