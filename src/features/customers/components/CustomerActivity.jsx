import { formatMoney } from '../utils/customerUtils'
import { mockSales, mockPayments } from '../../../core/salesStore'
import { mockTransactions } from '../../../core/store'

const SALE_EVENT_TYPES = {
  'Invoice': 'new-sale',
  'Challan': 'challan-created',
}

function formatDateTime(value) {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '—'
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit',
  }).format(parsed)
}

export default function CustomerActivity({ customerId }) {
  const events = []

  mockSales
    .filter((sale) => sale.customerId === customerId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10)
    .forEach((sale) => {
      events.push({
        id: `ev-${sale.id}`,
        type: SALE_EVENT_TYPES[sale.type] ?? 'new-sale',
        title: sale.type === 'Invoice' ? `Invoice ${sale.number} issued` : `Challan ${sale.number} delivered`,
        amount: sale.total,
        date: sale.date,
      })
    })

  mockPayments
    .filter((payment) => payment.customerId === customerId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .forEach((payment) => {
      events.push({
        id: `ev-${payment.id}`,
        type: 'payment-received',
        title: `Payment received ₹${formatMoney(payment.amount).replace('₹', '')}`,
        amount: 0,
        date: payment.date,
      })
    })

  mockTransactions
    .filter((txn) => txn.customerId === customerId && txn.type === 'sale' && txn.balance > 0)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3)
    .forEach((txn) => {
      events.push({
        id: `ev-${txn.id}`,
        type: 'outstanding-invoice',
        title: `Outstanding: ${txn.description}`,
        amount: txn.balance,
        date: txn.date,
      })
    })

  if (events.length === 0) {
    return <p className="customers-empty">No activity for this customer yet.</p>
  }

  return (
    <ul className="customers-activity">
      {events.map((event) => (
        <li key={event.id} className="customers-activity__item">
          <span className={`customers-activity__type customers-activity__type--${event.type}`}>{event.type}</span>
          <div className="customers-activity__text">
            <strong>{event.title}</strong>
            <span>{event.amount ? formatMoney(event.amount) : ''}</span>
            <small>{formatDateTime(event.date)}</small>
          </div>
        </li>
      ))}
    </ul>
  )
}
