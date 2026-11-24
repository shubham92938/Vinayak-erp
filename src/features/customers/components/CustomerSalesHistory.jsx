import { formatMoney, formatDate } from '../utils/customerUtils'
import { getSales } from '../../../core/salesStore'

export default function CustomerSalesHistory({ customerId, title = 'Sales History', emptyLabel = 'No sales recorded for this customer yet.' }) {
  const sales = getSales()
    .filter((sale) => sale.customerId === customerId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  if (sales.length === 0) {
    return (
      <section className="customers-history">
        <h3 className="customers-history__title">{title}</h3>
        <p className="customers-empty">{emptyLabel}</p>
      </section>
    )
  }

  return (
    <section className="customers-history">
      <h3 className="customers-history__title">{title}</h3>
      <table className="customers-history__table">
        <thead>
          <tr>
            <th>Type</th><th>Number</th><th>Date</th><th className="money">Amount</th><th className="money">Paid</th><th className="money">Outstanding</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((sale) => (
            <tr key={sale.id}>
              <td>{sale.type}</td>
              <td>{sale.number}</td>
              <td>{formatDate(sale.date)}</td>
              <td className="money">{formatMoney(sale.total)}</td>
              <td className="money">{formatMoney(sale.paid)}</td>
              <td className="money">{formatMoney(sale.due)}</td>
              <td>{sale.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
