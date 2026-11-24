import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Badge, Button, Card, CardBody, Modal } from '../../../components/ui'
import { getQuotationById, getQuotationTotals, formatMoney, formatDate } from '../services/quotationService'
import { convertQuotationToSaleOrder, markQuotationAccepted, updateQuotation } from '../../../core/financeStore'
import { getProducts } from '../../products/services/productService'
import '../styles/quotations.css'

const TABS = ['Overview', 'Items']

export default function QuotationDetailsPage() {
  const navigate = useNavigate()
  const { quotationId } = useParams()
  const [tab, setTab] = useState('Overview')
  const [isEditOpen, setIsEditOpen] = useState(false)

  const quote = getQuotationById(quotationId)
  if (!quote) {
    return (
      <div className="quotations-page">
        <h1>Quotation not found</h1>
        <Button variant="secondary" onClick={() => navigate('/quotations')}>Back to Quotations</Button>
      </div>
    )
  }

  const totals = getQuotationTotals(quote)

  const handleConvert = () => {
    const order = convertQuotationToSaleOrder(quote.id)
    navigate(`/sales-orders/${order.id}`)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="quotations-page">
      <header className="quotations-header">
        <div className="quotations-details-header">
          <div className="quotations-header__text">
            <p className="quotations-header__eyebrow"><span aria-hidden="true">#</span> Quotation</p>
            <h1 className="quotations-header__title">{quote.number}</h1>
            <p className="quotations-header__description">
              Customer: {quote.customerName} · {formatDate(quote.date)} · Status: {quote.status}
            </p>
          </div>
          <div className="quotations-details-actions">
            <Button variant="secondary" onClick={() => navigate('/quotations')}>Back to Quotations</Button>
            <Button variant="secondary" onClick={handlePrint}>Print</Button>
            <Button variant="secondary" onClick={() => markQuotationAccepted(quote.id)} disabled={quote.status !== 'Sent'}>Mark Accepted</Button>
            <Button onClick={handleConvert} disabled={quote.status !== 'Accepted'}>Convert to Sales Order</Button>
          </div>
        </div>
        <div className="quotations-tabs">
          {TABS.map((tabName) => (
            <button
              key={tabName}
              type="button"
              className={['quotation-tab', tab === tabName && 'quotation-tab--active'].filter(Boolean).join(' ')}
              onClick={() => setTab(tabName)}
            >
              {tabName}
            </button>
          ))}
        </div>
      </header>

      {tab === 'Overview' && (
        <div className="quotations-detail-grid">
          <Stat label="Customer" value={quote.customerName} />
          <Stat label="Status" value={<StatusBadge status={quote.status} />} />
          <Stat label="Quote Date" value={formatDate(quote.date)} />
          <Stat label="Expiry Date" value={formatDate(quote.expiryDate)} />
          <Stat label="Subtotal" value={formatMoney(totals.subtotal)} />
          <Stat label="Tax" value={formatMoney(totals.taxTotal)} />
          <Stat label="Discount" value={formatMoney(quote.discount)} />
          <Stat label="Total Value" value={formatMoney(totals.total)} />
        </div>
      )}

      {tab === 'Items' && (
        <Card className="quotations-card">
          <CardBody>
            <table className="quotations-detail-table">
              <thead>
                <tr><th>Product</th><th>Qty</th><th className="align-right">Price</th><th className="align-right">Amount</th></tr>
              </thead>
              <tbody>
                {quote.items.map((item, index) => {
                  const product = getProducts().find((entry) => entry.id === item.productId)
                  return (
                    <tr key={index}>
                      <td>{product?.name ?? item.name}</td>
                      <td>{item.qty}</td>
                      <td className="align-right">{formatMoney(item.price)}</td>
                      <td className="align-right">{formatMoney(item.qty * item.price)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}
    </div>
  )
}

function StatusBadge({ status }) {
  const variant = status === 'Accepted' ? 'success' : status === 'Sent' ? 'info' : status === 'Converted' ? 'info' : status === 'Expired' ? 'danger' : status === 'Draft' ? 'neutral' : 'info'
  return <Badge variant={variant} size="sm">{status}</Badge>
}

function Stat({ label, value }) {
  return (
    <div className="quotations-stat">
      <span className="quotations-stat__label">{label}</span>
      <span className="quotations-stat__value">{value}</span>
    </div>
  )
}
