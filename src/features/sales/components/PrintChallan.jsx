import { useEffect } from 'react'
import { getFirmById } from '../../../core/firmStore'
import { formatMoney, formatDate, getFirmLabel } from './saleUtils'

export default function PrintChallan({ challan }) {
  const firm = getFirmById(challan?.firmId)
  const billFrom = challan?.printDetails?.billFrom ?? firm ?? {}
  const firmAddress = [billFrom.address, billFrom.city, billFrom.state, billFrom.pinCode]
    .filter(Boolean)
    .join(', ')

  useEffect(() => {
    window.print()
  }, [challan])

  return (
    <div className="sales-print">
      <div className="sales-print__header">
        <div>
          <h1>{billFrom.name ?? firm?.name ?? '—'}</h1>
          <p>{firmAddress || '—'}</p>
        </div>
        <div className="sales-print__right">
          <h2>DELIVERY CHALAN</h2>
          <p>Document: {challan.number}</p>
          <p>Date: {formatDate(challan.date)}</p>
        </div>
      </div>

      <div className="sales-print__address">
        <strong>Customer:</strong> {challan.customerName}
        <br />
        <strong>Firm:</strong> {getFirmLabel(challan?.firmId)}
      </div>

      <table className="sales-print__table">
        <thead>
          <tr>
            <th>Product</th><th>Qty</th><th className="align-right">Price</th><th className="align-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {challan.items.map((item, index) => (
            <tr key={index}>
              <td>{item.name}</td>
              <td>{item.qty}</td>
              <td className="align-right">{formatMoney(item.price)}</td>
              <td className="align-right">{formatMoney(item.qty * item.price)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr><td colSpan={3}>Total</td><td className="align-right">{formatMoney(challan.total ?? 0)}</td></tr>
        </tfoot>
      </table>

      <p className="sales-print__status">Status: {challan.status}</p>
    </div>
  )
}
