import { formatDate, formatMoney } from '../utils/customerUtils'
import { getPaymentsIn } from '../../../core/financeStore'

export default function CustomerPaymentHistory({ customerId }) {
  const payments = getPaymentsIn()
    .filter((payment) => payment.customerId === customerId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  if (payments.length === 0) {
    return <p className="customers-empty">No payment history for this customer yet.</p>
  }

  const total = payments.reduce((sum, payment) => sum + (payment.amount ?? 0), 0)

  return (
    <div className="customers-payment-history">
      <div className="customers-payment-total">Total payments: {formatMoney(total)}</div>
      <table className="customers-history__table">
        <thead>
          <tr><th>Date</th><th>Payment Reference</th><th className="money">Amount</th><th>Mode</th><th>Status</th></tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment.id}>
              <td>{formatDate(payment.date)}</td>
              <td>{payment.invoiceId}</td>
              <td className="money">{formatMoney(payment.amount)}</td>
              <td>{payment.mode}</td>
              <td><span className={`customers-payment-status customers-payment-status--${payment.status.toLowerCase()}`}>{payment.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
