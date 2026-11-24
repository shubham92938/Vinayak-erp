import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Card, CardBody } from '../../../components/ui'
import { getSalesOrderById, fulfillSalesOrder, cancelSalesOrder, confirmSalesOrder } from '../services/salesOrderService'
import { formatMoney, formatDate, getSaleOrderTotals } from '../components/salesOrderUtils'
import { getProducts } from '../../products/services/productService'
import { getCustomers } from '../../../core/store'
import '../styles/salesOrders.css'

const TABS = ['Overview', 'Fulfillment']

export default function SalesOrderDetailsPage() {
  const navigate = useNavigate()
  const { orderId } = useParams()
  const [tab, setTab] = useState('Overview')
  const [fulfillQty, setFulfillQty] = useState('')
  const [fulfilledDetails, setFulfilledDetails] = useState(false)

  const order = getSalesOrderById(orderId)
  if (!order) {
    return (
      <div className="sales-orders-page">
        <h1>Order not found</h1>
        <Button variant="secondary" onClick={() => navigate('/sales-orders')}>Back to Sales Orders</Button>
      </div>
    )
  }

  const totals = getSaleOrderTotals(order)

  const handleFulfill = () => {
    fulfillSalesOrder(order.id, Number(fulfillQty) || 0)
    setFulfilledDetails(true)
  }

  return (
    <div className="sales-orders-page">
      <header className="sales-orders-header">
        <div className="sales-orders-details-header">
          <div className="sales-orders-header__text">
            <p className="sales-orders-header__eyebrow"><span aria-hidden="true">#</span> Sales Order</p>
            <h1 className="sales-orders-header__title">{order.number}</h1>
            <p className="sales-orders-header__description">
              Customer: {order.customerName} · {formatDate(order.orderDate)} · Status: {order.status}
            </p>
          </div>
          <div className="sales-orders-details-actions">
            <Button variant="secondary" onClick={() => navigate('/sales-orders')}>Back to Orders</Button>
            <Button variant="secondary" onClick={() => confirmSalesOrder(order.id)} disabled={order.status === 'Confirmed'}>Confirm Order</Button>
            <Button variant="secondary" onClick={() => cancelSalesOrder(order.id)} disabled={['Completed', 'Cancelled'].includes(order.status)}>Cancel Order</Button>
          </div>
        </div>
        <div className="sales-orders-tabs">
          {TABS.map((tabName) => (
            <button
              key={tabName}
              type="button"
              className={['sales-order-tab', tab === tabName && 'sales-order-tab--active'].filter(Boolean).join(' ')}
              onClick={() => setTab(tabName)}
            >
              {tabName}
            </button>
          ))}
        </div>
      </header>

      {tab === 'Overview' && (
        <div className="sales-orders-detail-grid">
          <Stat label="Order Number" value={order.number} />
          <Stat label="Customer" value={order.customerName} />
          <Stat label="Status" value={order.status} />
          <Stat label="Order Date" value={formatDate(order.orderDate)} />
          <Stat label="Expected Delivery" value={order.expectedDelivery} />
          <Stat label="Total Amount" value={formatMoney(totals.total)} />
          <Stat label="Fulfilled Qty" value={order.fulfilledQty ?? 0} />
          <Stat label="Pending Qty" value={totals.pendingQty} />
        </div>
      )}

      {tab === 'Fulfillment' && (
        <Card className="sales-orders-card">
          <CardBody>
            <h3>Record Fulfillment</h3>
            <div className="sales-orders-fulfill">
              <input
                type="number"
                min="0"
                placeholder="Fulfilled Qty"
                value={fulfillQty}
                onChange={(event) => setFulfillQty(event.target.value)}
                aria-label="Fulfilled quantity"
              />
              <Button onClick={handleFulfill} disabled={!fulfillQty}>Update Fulfilled Qty</Button>
              {fulfilledDetails && <span className="sales-orders-fulfilled-badge">Fulfillment recorded</span>}
            </div>
            <FulfillTable order={order} />
          </CardBody>
        </Card>
      )}
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="sales-orders-stat">
      <span className="sales-orders-stat__label">{label}</span>
      <span className="sales-orders-stat__value">{value}</span>
    </div>
  )
}

function FulfillTable({ order }) {
  const products = getProducts()
  return (
    <table className="sales-orders-detail-table">
      <thead><tr><th>Product</th><th>Qty Ordered</th><th>Fulfilled</th></tr></thead>
      <tbody>
        {order.items.map((item, index) => (
          <tr key={index}>
            <td>{products.find((product) => product.id === item.productId)?.name ?? item.name}</td>
            <td>{item.qty}</td>
            <td>{order.fulfilledQty ?? 0}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
