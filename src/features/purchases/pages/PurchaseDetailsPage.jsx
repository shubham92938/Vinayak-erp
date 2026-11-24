import { useNavigate, useParams } from 'react-router-dom'
import { Badge, Button, Card, CardBody } from '../../../components/ui'
import { getPurchaseById, formatMoney, formatDate } from '../utils/purchaseUtils'
import '../styles/purchases.css'

export default function PurchaseDetailsPage() {
  const navigate = useNavigate()
  const { purchaseId } = useParams()
  const purchase = getPurchaseById(purchaseId)

  if (!purchase) {
    return (
      <div className="purchases-page">
        <h1>Purchase not found</h1>
        <Button variant="secondary" onClick={() => navigate('/purchases')}>Back to Purchases</Button>
      </div>
    )
  }

  return (
    <div className="purchases-page">
      <header className="purchases-header">
        <div className="purchases-details-header">
          <div className="purchases-header__text">
            <p className="purchases-header__eyebrow"><span aria-hidden="true">#</span> Purchase Details</p>
            <h1 className="purchases-header__title">{purchase.number}</h1>
            <p className="purchases-header__description">
              Vendor: {purchase.vendorName} · Vendor Invoice: {purchase.vendorInvoiceNumber || '—'} · {formatDate(purchase.purchaseDate)}
            </p>
          </div>
          <div className="purchases-details-actions">
            <Button variant="secondary" onClick={() => navigate('/purchases')}>Back to Purchases</Button>
          </div>
        </div>
      </header>

      <Card className="purchases-detail-card">
        <CardBody>
          <div className="purchases-detail-grid">
            <Stat label="Vendor" value={purchase.vendorName} />
            <Stat label="Vendor Invoice Number" value={purchase.vendorInvoiceNumber || '—'} mono />
            <Stat label="Vendor Contact" value={purchase.vendorContact || '—'} />
            <Stat label="Date" value={formatDate(purchase.purchaseDate)} />
            <Stat label="Status" value={<Badge variant={statusVariant(purchase.status)} size="sm">{purchase.status}</Badge>} />
            <Stat label="Total Amount" value={formatMoney(purchase.total)} />
            <Stat label="Paid Amount" value={formatMoney(purchase.paid)} />
            <Stat label="Due Amount" value={formatMoney(purchase.due)} />
            <Stat label="Items" value={purchase.items.length} />
            <Stat label="Notes" value={purchase.notes || '—'} />
          </div>
          <table className="purchases-detail-table">
            <thead>
              <tr><th>Product</th><th>Qty</th><th className="align-right">Buying Price</th><th className="align-right">Amount</th></tr>
            </thead>
            <tbody>
              {purchase.items.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{item.qty}</td>
                  <td className="align-right">{formatMoney(item.price)}</td>
                  <td className="align-right">{formatMoney(item.qty * item.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  )
}

function statusVariant(status) {
  if (status === 'Paid') return 'success'
  if (status === 'Draft') return 'neutral'
  if (status === 'Confirmed') return 'info'
  if (status === 'Partially Paid') return 'warning'
  return 'danger'
}

function Stat({ label, value }) {
  return (
    <div className="purchases-stat">
      <span className="purchases-stat__label">{label}</span>
      <span className="purchases-stat__value">{value}</span>
    </div>
  )
}


