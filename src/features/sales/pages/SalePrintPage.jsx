import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Printer, Save } from 'lucide-react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Button, useToast } from '../../../components/ui'
import { getCustomerById } from '../../../core/store'
import { getFirmById } from '../../../core/firmStore'
import { useFirmContext } from '../../../context/hooks'
import { getProducts } from '../../products/services/productService'
import { formatMoney, formatRecordedDate } from '../components/saleUtils'
import { getSaleById, updateSale } from '../services/saleService'
import BrandLockup from '../../../components/brand/BrandLockup'
import '../styles/sales.css'

function formatAddress(record) {
  return [record?.address, record?.city, record?.state, record?.pinCode].filter(Boolean).join(', ')
}

function parseDisplayDate(value) {
  const match = String(value ?? '').match(/^(\d{2})-(\d{2})-(\d{4})$/)
  if (!match) return value
  return `${match[3]}-${match[2]}-${match[1]}`
}

function documentLabel(sale) {
  return String(sale?.documentNumber ?? '').toUpperCase().startsWith('CHL')
    ? 'Challan'
    : sale?.type === 'Challan' ? 'Challan' : 'Invoice'
}

function buildDraft(sale, customer, firm) {
  const stored = sale.printDetails ?? {}
  const billTo = {
    name: sale.customerName ?? customer?.name ?? '',
    phone: customer?.phone ?? '',
    email: customer?.email ?? '',
    address: customer?.address || formatAddress(customer) || '',
    ...stored.billTo,
  }
  const billFrom = {
    name: firm?.name ?? 'Vinayak Group',
    phone: firm?.phone ?? '',
    email: firm?.email ?? '',
    address: formatAddress(firm) || firm?.address || '',
    ...stored.billFrom,
  }

  return {
    documentLabel: stored.documentLabel ?? documentLabel(sale),
    documentNumber: stored.documentNumber ?? sale.documentNumber ?? sale.number ?? '',
    date: stored.date ?? formatRecordedDate(sale.date),
    billTo,
    billFrom,
    items: (sale.items ?? []).map((item) => ({
      name: item.name ?? '',
      code: item.code ?? '',
      qty: item.qty ?? 0,
      price: item.price ?? 0,
      taxPct: item.taxPct ?? 0,
    })),
    notes: stored.notes ?? sale.notes ?? '',
    paid: Number(stored.paid ?? sale.paid ?? sale.advance ?? 0),
    discount: Number(stored.discount ?? sale.discount ?? 0),
    sourceTotal: Number(sale.total ?? 0),
  }
}

export default function SalePrintPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { saleId } = useParams()
  const { currentFirmId } = useFirmContext()
  const toast = useToast()
  const sale = getSaleById(saleId)
  const customer = sale?.customerId ? getCustomerById(sale.customerId) : null
  const firm = getFirmById(sale?.firmId ?? currentFirmId)
  const products = getProducts()
  const initialDraft = useMemo(() => sale ? buildDraft(sale, customer, firm) : null, [customer, firm, sale])
  const [draft, setDraft] = useState(initialDraft)
  const [saved, setSaved] = useState(false)
  const routePrefix = location.pathname.startsWith('/firms/') && currentFirmId
    ? `/firms/${currentFirmId}/workspace`
    : ''

  useEffect(() => {
    document.title = 'Invoice - Vinayak Group'
    return () => { document.title = 'Vinayak Group · ERP Workspace' }
  }, [draft?.documentLabel])

  const totals = useMemo(() => {
    const hasProductLines = (draft?.items?.length ?? 0) > 0
    const subtotal = draft?.items.reduce((sum, item) => sum + Number(item.qty || 0) * Number(item.price || 0), 0) ?? 0
    const tax = draft?.items.reduce((sum, item) => {
      const line = Number(item.qty || 0) * Number(item.price || 0)
      return sum + (line * Number(item.taxPct || 0)) / 100
    }, 0) ?? 0
    const discount = Math.max(0, Number(draft?.discount || 0))
    const calculatedTotal = Math.max(0, subtotal + tax - discount)
    const total = hasProductLines ? calculatedTotal : Math.max(0, Number(draft?.sourceTotal || 0))
    const paid = Math.max(0, Number(draft?.paid || 0))
    return { subtotal, tax, discount, total, paid, due: Math.max(0, total - paid), hasProductLines }
  }, [draft])

  const updateField = (field, value) => {
    setSaved(false)
    setDraft((current) => ({ ...current, [field]: value }))
  }

  const updateParty = (party, field, value) => {
    setSaved(false)
    setDraft((current) => ({ ...current, [party]: { ...current[party], [field]: value } }))
  }

  const updateItem = (index, field, value) => {
    setSaved(false)
    setDraft((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item),
    }))
  }

  const saveChanges = () => {
    if (!sale || !draft) return
    const items = draft.items.map((item, index) => ({
      ...sale.items?.[index],
      name: item.name,
      code: item.code,
      qty: Number(item.qty || 0),
      price: Number(item.price || 0),
      taxPct: Number(item.taxPct || 0),
    }))
    const result = updateSale(sale.id, {
      customerName: draft.billTo.name,
      date: parseDisplayDate(draft.date),
      documentNumber: draft.documentNumber,
      items,
      subtotal: totals.subtotal,
      taxTotal: totals.tax,
      discount: totals.discount,
      total: totals.total,
      paid: totals.paid,
      advance: totals.paid,
      due: totals.due,
      notes: draft.notes,
      printDetails: {
        documentLabel: draft.documentLabel,
        documentNumber: draft.documentNumber,
        date: draft.date,
        billTo: draft.billTo,
        billFrom: draft.billFrom,
        notes: draft.notes,
        paid: totals.paid,
        discount: totals.discount,
      },
    })
    if (result) {
      setSaved(true)
      toast.success('Print details saved')
    } else {
      toast.error('Could not save print details')
    }
  }

  if (!sale || !draft) {
    return (
      <div className="sales-print-page-shell">
        <section className="sales-print-page sales-print-page--empty">
          <button type="button" className="sales-print-page__back" onClick={() => navigate(`${routePrefix}/sales`)}><ArrowLeft size={13} /> Back</button>
          <h1>Invoice not found</h1>
          <p>The selected invoice is not available in the current firm.</p>
        </section>
      </div>
    )
  }

  return (
    <div className="sales-print-page-shell">
      <article className="sales-print-page">
        <button type="button" className="sales-print-page__back" onClick={() => navigate(-1)}><ArrowLeft size={13} /> Back</button>
        <div className="sales-print-page__brand"><BrandLockup size="sm" /></div>
        <p className="sales-print-page__firm-line">{draft.billFrom.name}, Mobile: {draft.billFrom.phone}, Address: {draft.billFrom.address}</p>
        <h1 className="sales-print-page__document-title">{draft.documentLabel}: {draft.documentNumber}</h1>
        <p className="sales-print-page__date">Date: {draft.date}</p>
        <hr />

        <div className="sales-print-page__parties">
          <PartyCard title="Bill To:" values={draft.billTo} onChange={(field, value) => updateParty('billTo', field, value)} />
          <PartyCard title="Bill From:" values={draft.billFrom} onChange={(field, value) => updateParty('billFrom', field, value)} />
        </div>

        <div className="sales-print-page__table-wrap">
          <table className="sales-print-page__items">
            <thead><tr><th>S.No</th><th>Product Name</th><th>Code</th><th>Price</th><th>Qty</th><th>Tax</th><th>Subtotal</th></tr></thead>
            <tbody>
              {draft.items.length === 0 ? (
                <tr><td colSpan="7" className="sales-print-page__empty-row">No product lines recorded.</td></tr>
              ) : draft.items.map((item, index) => {
                const lineTotal = Number(item.qty || 0) * Number(item.price || 0)
                const lineTax = lineTotal * Number(item.taxPct || 0) / 100
                return (
                  <tr key={`${item.code}-${index}`}>
                    <td>{index + 1}</td>
                    <td><EditableInput value={item.name} onChange={(value) => updateItem(index, 'name', value)} ariaLabel={`Product ${index + 1} name`} /></td>
                    <td><EditableInput value={item.code || products.find((product) => product.name === item.name)?.code || ''} onChange={(value) => updateItem(index, 'code', value)} ariaLabel={`Product ${index + 1} code`} /></td>
                    <td><EditableInput type="number" value={item.price} onChange={(value) => updateItem(index, 'price', value)} ariaLabel={`Product ${index + 1} price`} /></td>
                    <td><EditableInput type="number" value={item.qty} onChange={(value) => updateItem(index, 'qty', value)} ariaLabel={`Product ${index + 1} quantity`} /></td>
                    <td><EditableInput type="number" value={item.taxPct} onChange={(value) => updateItem(index, 'taxPct', value)} ariaLabel={`Product ${index + 1} tax`} suffix="%" /><small className="sales-print-page__line-tax">({formatMoney(lineTax)})</small></td>
                    <td>{formatMoney(lineTotal)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="sales-print-page__summary-area">
          <div className="sales-print-page__signature">Authorized Signature</div>
          <table className="sales-print-page__summary">
            <tbody>
              <SummaryRow label="Subtotal" value={totals.subtotal} />
              <SummaryRow label="Tax" value={totals.tax} />
              <SummaryRow label="Discount" value={totals.discount} />
              <SummaryRow label="Total" value={totals.total} />
              <SummaryRow label="Paid" value={totals.paid} />
              <SummaryRow label="Due Amount" value={totals.due} />
            </tbody>
          </table>
        </div>

        <label className="sales-print-page__notes">
          <strong>Notes:</strong>
          <textarea value={draft.notes} onChange={(event) => updateField('notes', event.target.value)} aria-label="Print notes" />
        </label>

        <div className="sales-print-page__controls">
          {saved && <span className="sales-print-page__saved">Saved</span>}
          <Button variant="secondary" size="sm" onClick={saveChanges} leadingIcon={<Save size={13} />}>Save Changes</Button>
          <Button size="sm" onClick={() => window.print()} leadingIcon={<Printer size={13} />}>Print Invoice</Button>
        </div>
      </article>
    </div>
  )
}

function PartyCard({ title, values, onChange }) {
  return (
    <section className="sales-print-page__party">
      <h2>{title}</h2>
      <PartyField label="Name" value={values.name} onChange={(value) => onChange('name', value)} />
      <PartyField label="Phone" value={values.phone} onChange={(value) => onChange('phone', value)} />
      <PartyField label="Email" value={values.email} onChange={(value) => onChange('email', value)} />
      <PartyField label="Address" value={values.address} onChange={(value) => onChange('address', value)} />
    </section>
  )
}

function PartyField({ label, value, onChange }) {
  return <label><strong>{label}:</strong><EditableInput value={value} onChange={onChange} ariaLabel={label} /></label>
}

function EditableInput({ value, onChange, type = 'text', ariaLabel, suffix = '' }) {
  return (
    <span className="sales-print-page__editable-wrap">
      <input type={type} value={value ?? ''} onChange={(event) => onChange(event.target.value)} aria-label={ariaLabel} />
      {suffix && <small>{suffix}</small>}
    </span>
  )
}

function SummaryRow({ label, value }) {
  return <tr><th>{label}</th><td>{formatMoney(value)}</td></tr>
}
