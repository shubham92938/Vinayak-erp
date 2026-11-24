import { useEffect, useRef } from 'react'
import { formatMoney, formatDate } from './saleUtils'
import { getFirmLabel } from './saleUtils'

export default function PrintInvoice({ sale, totals }) {
  const containerRef = useRef(null)

  useEffect(() => {
    window.print()
  }, [sale])

  return (
    <div className="sales-print" ref={containerRef}>
      <div className="sales-print__header">
        <div>
          <h1>Vinayak Associates</h1>
          <p>Maharashtra</p>
        </div>
        <div className="sales-print__right">
          <h2>INVOICE</h2>
          <p>Document: {sale.number}</p>
          <p>Date: {formatDate(sale.date)}</p>
        </div>
      </div>

      <div className="sales-print__address">
        <strong>Customer:</strong> {sale.customerName} ({sale.customer?.code ?? ''})
        <br />
        <strong>Billing Firm:</strong> {getFirmLabel()}
        {sale.notes ? <> <br /><em>{sale.notes}</em></> : null}
      </div>

      <table className="sales-print__table">
        <thead>
          <tr>
            <th>Product</th><th>Qty</th><th>Price</th><th>Tax</th><th className="align-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {sale.items.map((item, index) => (
            <tr key={index}>
              <td>{item.name}</td>
              <td>{item.qty}</td>
              <td>{formatMoney(item.price)}</td>
              <td>{item.taxPct}%</td>
              <td className="align-right">{formatMoney(item.qty * item.price)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr><td colSpan={4}>Subtotal</td><td className="align-right">{formatMoney(totals.subtotal)}</td></tr>
          <tr><td colSpan={4}>Tax</td><td className="align-right">{formatMoney(totals.taxTotal)}</td></tr>
          <tr><td colSpan={4}>Total</td><td className="align-right">{formatMoney(totals.total)}</td></tr>
          {sale.advance ? (
            <tr><td colSpan={4}>Advance Received</td><td className="align-right">{formatMoney(sale.advance)}</td></tr>
          ) : null}
          <tr><td colSpan={4}>Due</td><td className="align-right">{formatMoney(Math.max(0, totals.total - (sale.advance ?? 0)))}</td></tr>
        </tfoot>
      </table>
    </div>
  )
}
