export default function InvoicePreview({ sale, totals }) {
  const fmt = (value) => `₹${Number(value ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`

  return (
    <div className="sales-preview" role="region" aria-label="Invoice preview">
      <div className="sales-preview__line">
        <strong>Subtotal</strong>
        <span>{fmt(totals.subtotal)}</span>
      </div>
      <div className="sales-preview__line">
        <strong>Tax</strong>
        <span>{fmt(totals.taxTotal)}</span>
      </div>
      <div className="sales-preview__line sales-preview__line--total">
        <strong>Total</strong>
        <span>{fmt(totals.total)}</span>
      </div>
      <div className="sales-preview__line">
        <span>Advance received</span>
        <span>{fmt(sale.advance ?? 0)}</span>
      </div>
      <div className="sales-preview__line">
        <strong>Due</strong>
        <span>{fmt(totals.total - (sale.advance ?? 0))}</span>
      </div>
      <div className="sales-preview__line">
        <span>Product Lines</span>
        <span>{sale.items.length}</span>
      </div>
    </div>
  )
}
