import { X } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getSaleById } from '../services/saleService'
import { getSalesOrderById } from '../../sales-orders/services/salesOrderService'
import { formatMoney, formatRecordedDate } from '../components/saleUtils'
import { getProducts } from '../../products/services/productService'
import { productImageUrl } from '../../products/utils/productUtils'
import { useFirmContext } from '../../../context/hooks'
import '../styles/sales.css'

function detailValue(value) {
  return value === null || value === undefined || value === '' ? '—' : value
}

export default function SaleDetailsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { currentFirmId } = useFirmContext()
  const { saleId } = useParams()
  const sale = getSaleById(saleId)
  const salesOrder = sale ? null : getSalesOrderById(saleId)
  const record = useMemo(() => sale ?? (salesOrder ? {
    ...salesOrder,
    date: salesOrder.orderDate,
    paid: salesOrder.advance ?? 0,
    due: Math.max(0, (salesOrder.total ?? 0) - (salesOrder.advance ?? 0)),
    detailStatus: salesOrder.status,
  } : null), [sale, salesOrder])
  const isSalesOrder = Boolean(!sale && salesOrder)

  useEffect(() => {
    if (!record || searchParams.get('print') !== '1') return undefined
    const timer = window.setTimeout(() => window.print(), 0)
    return () => window.clearTimeout(timer)
  }, [record, searchParams])
  const routePrefix = location.pathname.startsWith('/firms/') && currentFirmId
    ? `/firms/${currentFirmId}/workspace`
    : ''

  const goBack = () => navigate(`${routePrefix}/${isSalesOrder ? 'orders' : 'sales'}`)

  if (!record) {
    return (
      <div className="sales-page">
        <section className="recorded-invoice-details">
          <header className="recorded-invoice-details__header">
            <h1>Invoice not found</h1>
            <button type="button" className="recorded-invoice-close" onClick={goBack} aria-label="Close invoice details"><X size={16} /></button>
          </header>
          <p className="sales-empty">The selected invoice is not available in the current firm.</p>
        </section>
      </div>
    )
  }

  const products = getProducts()
  const totals = {
    subtotal: Number(record.subtotal ?? record.items?.reduce((sum, item) => sum + Number(item.qty ?? 0) * Number(item.price ?? 0), 0) ?? 0),
    taxTotal: Number(record.taxTotal ?? 0),
    discount: Number(record.discount ?? 0),
    total: Number(record.total ?? 0),
  }
  const paid = Number(record.paid ?? record.advance ?? 0)
  const due = Number(record.due ?? Math.max(0, totals.total - paid))
  const items = Array.isArray(record.items) ? record.items : []

  return (
    <div className="sales-page">
      <section className="recorded-invoice-details" aria-labelledby="invoice-details-title">
        <header className="recorded-invoice-details__header">
          <h1 id="invoice-details-title">{isSalesOrder ? 'Sales Order Details' : 'Completed Invoice Details'}</h1>
          <button type="button" className="recorded-invoice-close" onClick={goBack} aria-label="Close invoice details" title="Close"><X size={16} /></button>
        </header>

        <div className="recorded-invoice-details__body">
          <div className="recorded-invoice-meta">
            <ReadOnlyField label="Invoice Date" value={formatRecordedDate(record.date)} />
            <ReadOnlyField label="Dealer" value={record.dealer} />
            <ReadOnlyField label="Supplied To" value={record.suppliedTo} />
            <ReadOnlyField label="Status" value={record.detailStatus ?? (record.status === 'APPROVED' ? 'Completed' : record.status)} />
            <ReadOnlyField label="Vehicle Number" value={record.vehicleNumber} />
            <ReadOnlyField label="Driver Number" value={record.driverNumber} />
          </div>

          <div className="recorded-invoice-lines-wrap">
            <table className="recorded-invoice-lines">
              <thead>
                <tr><th>No.</th><th>Product Image</th><th>Product Name</th><th>Product Code</th><th>Quantity</th><th>Price</th><th>Tax</th><th>Sub Total</th></tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr><td colSpan="8" className="recorded-invoice-empty">No product lines recorded for this invoice.</td></tr>
                ) : items.map((item, index) => {
                  const product = products.find((entry) => entry.id === item.productId)
                  const taxPct = Number(item.taxPct ?? 0)
                  const lineSubtotal = Number(item.qty ?? 0) * Number(item.price ?? 0)
                  const lineTax = lineSubtotal * taxPct / 100
                  return (
                    <tr key={`${item.productId ?? item.name}-${index}`}>
                      <td>{index + 1}</td>
                      <td><img className="recorded-invoice-product-image" src={item.image || product?.image || productImageUrl()} alt="No product photo" /></td>
                      <td className="recorded-invoice-product-name">{item.name ?? product?.name ?? '—'}</td>
                      <td>{item.code ?? product?.code ?? '—'}</td>
                      <td>{item.qty ?? 0}</td>
                      <td>{formatMoney(item.price ?? 0)}</td>
                      <td>{taxPct}% ({formatMoney(lineTax)})</td>
                      <td>{formatMoney(lineSubtotal)}</td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <SummaryRow label="Subtotal" value={totals.subtotal} />
                <SummaryRow label="Total Tax" value={totals.taxTotal} />
                <SummaryRow label="Discount" value={totals.discount} />
                <SummaryRow label="Grand Total" value={totals.total} emphasis="grand" />
                <SummaryRow label="Paid" value={paid} emphasis="paid" />
                <SummaryRow label="Due Amount" value={due} emphasis="due" />
              </tfoot>
            </table>
          </div>

          <label className="recorded-invoice-notes">
            <span>Notes</span>
            <textarea value={detailValue(record.notes)} readOnly rows="2" aria-label="Invoice notes" />
          </label>
        </div>
      </section>
    </div>
  )
}

function ReadOnlyField({ label, value }) {
  return (
    <label className="recorded-invoice-field">
      <span>{label}</span>
      <input value={detailValue(value)} readOnly aria-label={label} />
    </label>
  )
}

function SummaryRow({ label, value, emphasis = '' }) {
  return <tr className={emphasis ? `recorded-invoice-summary--${emphasis}` : ''}><td colSpan="7">{label}</td><td>{formatMoney(value)}</td></tr>
}
