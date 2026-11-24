import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Badge, Button, Card, CardBody } from '../../../components/ui'
import { getPurchaseOrderById, orderStock, cancelPurchaseOrder, confirmPurchaseOrder } from '../../../core/purchaseOrderStore'
import { formatMoney, formatDate } from './purchaseOrderUtils'
import { getProducts } from '../../products/services/productService'
import '../styles/purchaseOrders.css'

export default function PurchaseOrderDetailsPage() {
  const navigate = useNavigate()
  const { orderId } = useParams()
  const [tab, setTab] = useState('Overview')
  const order = getPurchaseOrderById(orderId)

  if (!order) {
    return (
      <div className="purchase-orders-page">
        <h1>Purchase order not found</h1>
        <Button variant="secondary" onClick={() => navigate('/purchase-orders')}>Back to Purchase Orders</Button>
      </div>
    )
  }

  const totalQty = order.items.reduce((sum, item) => sum + item.qty, 0)

  const handleApprove = () => {
    confirmPurchaseOrder(order.id)
  }
  const handleReceive = () => {
    orderStock(order.id, order.items)
  }
  const handleCancel = () => {
    cancelPurchaseOrder(order.id)
  }

  return (
    <div className="purchase-orders-page">
      <header className="purchase-orders-header">
        <div className="purchase-orders-details-header">
          <div className="purchase-orders-header__text">
            <p className="purchase-orders-header__eyebrow"><span aria-hidden="true">#</span> Purchase Order</p>
            <h1 className="purchase-orders-header__title">{order.number}</h1>
            <p className="purchase-orders-header__description">
              Vendor: {order.vendorName} · {formatDate(order.orderDate)} · Status: {order.status}
            </p>
          </div>
          <div className="purchase-orders-details-actions">
            <Button variant="secondary" onClick={() => navigate('/purchase-orders')}>Back to Orders</Button>
            <Button variant="secondary" onClick={handleApprove} disabled={order.status !== 'Draft'}>Approve</Button>
            <Button variant="secondary" onClick={handleReceive} disabled={order.status === 'Cancelled'}>Record Receipt</Button>
            <Button variant="secondary" onClick={handleCancel} disabled={['Received', 'Cancelled'].includes(order.status)}>Cancel</Button>
          </div>
        </div>
        <div className="purchase-orders-tabs">
          {['Overview', 'Items', 'Receipts'].map((tabName) => (
            <button
              key={tabName}
              type="button"
              className={['purchase-order-tab', tab === tabName && 'purchase-order-tab--active'].filter(Boolean).join(' ')}
              onClick={() => setTab(tabName)}
            >
              {tabName}
            </button>
          ))}
        </div>
      </header>

      {tab === 'Overview' && (
        <div className="purchase-orders-detail-grid">
          <Stat label="Order Number" value={order.number} />
          <Stat label="Vendor" value={order.vendorName} />
          <Stat label="Status" value={<Badge variant={statusVariant(order.status)} size="sm">{order.status}</Badge>} />
          <Stat label="Order Date" value={formatDate(order.orderDate)} />
          <Stat label="Expected Delivery" value={order.expectedDelivery} />
          <Stat label="Total Value" value={formatMoney(order.total)} />
          <Stat label="Received Qty" value={order.receivedQty ?? 0} />
          <Stat label="Pending Qty" value={totalQty - (order.receivedQty ?? 0)} />
        </div>
      )}

      {tab === 'Items' && (
        <Card className="purchase-orders-card">
          <CardBody>
            <h3>Items</h3>
            <table className="purchase-orders-detail-table">
              <thead>
                <tr><th>Product</th><th>Qty</th><th className="align-right">Price</th><th className="align-right">Amount</th></tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td>{item.qty}</td>
                    <td className="align-right">{formatMoney(item.price)}</td>
                    <td className="align-right">{formatMoney(item.qty * item.price)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr><td colSpan={4} className="align-right"><strong>Total: {formatMoney(order.total)}</strong></td></tr>
              </tfoot>
            </table>
          </CardBody>
        </Card>
      )}

      {tab === 'Receipts' && (
        <Card className="purchase-orders-card">
          <CardBody>
            <h3>Goods Received</h3>
            <p className="purchase-orders-receipt-note">
              {(order.receivedQty ?? 0) > 0
                ? `${order.receivedQty} of ${totalQty} units received. Stock has been updated.`
                : 'No goods received yet.'}
            </p>
            <table className="purchase-orders-detail-table">
              <thead>
                <tr><th>Product</th><th>Qty Ordered</th><th>Qty Received</th><th>Qty Remaining</th></tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td>{item.qty}</td>
                    <td>{order.receivedQty ?? 0}</td>
                    <td>{Math.max(0, item.qty - (order.receivedQty ?? 0))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}
    </div>
  )
}

function statusVariant(status) {
  if (status === 'Received') return 'success'
  if (status === 'Approved' || status === 'Ordered') return 'info'
  if (status === 'Partially Received') return 'warning'
  if (status === 'Draft') return 'neutral'
  return 'danger'
}

function Stat({ label, value }) {
  return (
    <div className="purchase-orders-stat">
      <span className="purchase-orders-stat__label">{label}</span>
      <span className="purchase-orders-stat__value">{value}</span>
    </div>
  )
}
