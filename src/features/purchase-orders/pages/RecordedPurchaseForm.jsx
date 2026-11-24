import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../../../components/ui'
import { useFirmContext } from '../../../context/hooks'
import { getCustomers } from '../../../core/store'
import { createPurchase } from '../../../core/purchaseStore'
import { createPurchaseOrder } from '../../../core/purchaseOrderStore'
import { getProducts } from '../../products/services/productService'
import { formatMoney } from '../../sales/components/saleUtils'
import '../../sales/components/recordedOrderForm.css'
import '../styles/purchaseOrders.css'

function today() {
  return new Date().toISOString().slice(0, 10)
}

const emptyRow = { productId: '', qty: 1, price: 0, taxPct: 0 }

export default function RecordedPurchaseForm() {
  const navigate = useNavigate()
  const toast = useToast()
  const { accessibleFirms, currentFirmId } = useFirmContext()
  const products = getProducts()
  const customers = getCustomers()
  const [mode, setMode] = useState('internal')
  const [form, setForm] = useState({ date: today(), reference: 'PRS', firmId: currentFirmId ?? '', customerId: '', buyerType: '', billNumber: '', paymentMode: '' , notes: '', advance: '0' })
  const [rows, setRows] = useState([])
  const [saving, setSaving] = useState(false)

  const subtotal = rows.reduce((sum, row) => sum + Number(row.qty || 0) * Number(row.price || 0), 0)
  const tax = rows.reduce((sum, row) => sum + (Number(row.qty || 0) * Number(row.price || 0) * Number(row.taxPct || 0)) / 100, 0)
  const total = subtotal + tax

  const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }))
  const updateRow = (index, field, value) => setRows((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, [field]: value } : row))
  const addRow = () => setRows((current) => [...current, { ...emptyRow }])
  const removeRow = (index) => setRows((current) => current.filter((_row, rowIndex) => rowIndex !== index))
  const selectedFirm = accessibleFirms.find((firm) => firm.id === form.firmId)
  const selectedCustomer = customers.find((customer) => customer.id === form.customerId)

  const submit = (event) => {
    event.preventDefault()
    if (saving) return
    if (rows.length === 0 || rows.some((row) => !row.productId || Number(row.qty) <= 0)) {
      toast.error('Add at least one product with a valid quantity')
      return
    }
    if (mode === 'internal' && !form.firmId) {
      toast.error('Select a firm for an internal purchase')
      return
    }
    if (mode === 'external' && (!form.customerId || !form.buyerType || !form.paymentMode || !form.billNumber.trim())) {
      toast.error('Complete the external purchase details')
      return
    }

    setSaving(true)
    const items = rows.map((row) => {
      const product = products.find((item) => item.id === row.productId)
      return { productId: row.productId, name: product?.name ?? 'Product', qty: Number(row.qty), price: Number(row.price), taxPct: Number(row.taxPct || 0), unit: product?.unit ?? 'nos' }
    })

    try {
      if (mode === 'internal') {
        createPurchaseOrder({ vendorName: selectedFirm?.name ?? 'Internal Firm', items, notes: form.notes, reference: form.reference, orderDate: form.date })
        toast.success('Purchase order created')
        navigate('../purchase-orders')
      } else {
        createPurchase({ vendorName: selectedCustomer?.name ?? 'Customer', vendorInvoiceNumber: form.billNumber, items, advance: Number(form.advance || 0), notes: form.notes, purchaseDate: form.date, paymentMode: form.paymentMode })
        toast.success('External purchase saved')
        navigate('../purchases')
      }
    } catch (error) {
      toast.error(error?.message ?? 'Could not save purchase')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="recorded-purchase-page">
      <div className="recorded-purchase-page__titlebar">
        <h1>Create Purchase Order</h1>
        <label className="recorded-purchase-type"><span className="visually-hidden">Purchase type</span><select value={mode} onChange={(event) => setMode(event.target.value)}><option value="internal">Internal</option><option value="external">External</option></select></label>
      </div>
      <form onSubmit={submit} className="recorded-purchase-form">
        {mode === 'internal' ? (
          <>
            <div className="recorded-purchase-grid">
              <Field label="Purchase Date" required><input type="date" value={form.date} onChange={(event) => updateForm('date', event.target.value)} /></Field>
              <Field label="Reference" required><input value={form.reference} onChange={(event) => updateForm('reference', event.target.value)} /></Field>
              <Field label="Select Firm" required><select value={form.firmId} onChange={(event) => updateForm('firmId', event.target.value)}><option value="">-- Select --</option>{accessibleFirms.map((firm) => <option key={firm.id} value={firm.id}>{firm.name}</option>)}</select></Field>
            </div>
            <PurchaseItems rows={rows} products={products} onAdd={addRow} onUpdate={updateRow} onRemove={removeRow} />
            <PurchaseSummary subtotal={subtotal} tax={tax} total={total} />
            <Field label="Notes"><textarea rows="3" value={form.notes} onChange={(event) => updateForm('notes', event.target.value)} /></Field>
            <div className="recorded-purchase-submit"><button type="submit" className="recorded-primary-button" disabled={saving}>{saving ? 'Saving…' : 'Purchase'}</button></div>
          </>
        ) : (
          <>
            <div className="recorded-purchase-grid recorded-purchase-grid--external">
              <Field label="Buyer Type" required><select value={form.buyerType} onChange={(event) => updateForm('buyerType', event.target.value)}><option value="">-- Select Buyer --</option><option>Customer</option><option>Dealer</option><option>Firm</option></select></Field>
              <Field label="Customer Name" required><select value={form.customerId} onChange={(event) => updateForm('customerId', event.target.value)}><option value="">-- Select Customer --</option>{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}</select></Field>
              <Field label="Bill Number" required><input value={form.billNumber} onChange={(event) => updateForm('billNumber', event.target.value)} /></Field>
              <Field label="Purchase Date" required><input type="date" value={form.date} onChange={(event) => updateForm('date', event.target.value)} /></Field>
              <Field label="Payment Mode" required><select value={form.paymentMode} onChange={(event) => updateForm('paymentMode', event.target.value)}><option value="">-- Select Payment --</option><option>Cash</option><option>Online</option><option>Credit</option></select></Field>
            </div>
            <div className="recorded-purchase-new-product"><button type="button" onClick={() => toast.info('Create the product from the Products menu first.')}><Plus size={12} /> Create New Product</button></div>
            <PurchaseItems rows={rows} products={products} onAdd={addRow} onUpdate={updateRow} onRemove={removeRow} />
            <PurchaseSummary subtotal={subtotal} tax={tax} total={total} />
            <div className="recorded-purchase-grid recorded-purchase-grid--external-foot"><Field label="Advance Amount"><input type="number" min="0" value={form.advance} onChange={(event) => updateForm('advance', event.target.value)} /></Field><Field label="Notes" className="is-wide"><textarea rows="3" value={form.notes} onChange={(event) => updateForm('notes', event.target.value)} /></Field></div>
            <div className="recorded-purchase-submit"><button type="submit" className="recorded-primary-button" disabled={saving}>{saving ? 'Saving…' : 'Save External Purchase'}</button></div>
          </>
        )}
      </form>
    </div>
  )
}

function PurchaseItems({ rows, products, onAdd, onUpdate, onRemove }) {
  return (
    <div className="recorded-purchase-items">
      <div className="recorded-purchase-items__head"><span>Product</span><span>Quantity</span><span>Price</span><span>Tax</span><span>Total</span><span>Action</span></div>
      {rows.map((row, index) => {
        const product = products.find((item) => item.id === row.productId)
        return <div className="recorded-purchase-items__row" key={`${index}-${row.productId}`}><select value={row.productId} onChange={(event) => { const productValue = products.find((item) => item.id === event.target.value); onUpdate(index, 'productId', event.target.value); onUpdate(index, 'price', productValue?.buyingPrice ?? 0) }}><option value="">Select product...</option>{products.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><input type="number" min="1" value={row.qty} onChange={(event) => onUpdate(index, 'qty', event.target.value)} /><input type="number" min="0" value={row.price} onChange={(event) => onUpdate(index, 'price', event.target.value)} /><input type="number" min="0" value={row.taxPct} onChange={(event) => onUpdate(index, 'taxPct', event.target.value)} /><span>{formatMoney(Number(row.qty || 0) * Number(row.price || 0) * (1 + Number(row.taxPct || 0) / 100))}</span><button type="button" className="recorded-delete-button" onClick={() => onRemove(index)} aria-label={`Delete ${product?.name ?? 'item'}`}><Trash2 size={13} /></button></div>
      })}
      <button type="button" className="recorded-add-row" onClick={onAdd}><Plus size={13} /> Add Product</button>
    </div>
  )
}

function PurchaseSummary({ subtotal, tax, total }) {
  return <div className="recorded-purchase-summary"><span>Subtotal</span><strong>{formatMoney(subtotal)}</strong><span>Tax</span><strong>{formatMoney(tax)}</strong><span>Grand Total</span><strong>{formatMoney(total)}</strong></div>
}

function Field({ label, children, required, className = '' }) {
  return <label className={['recorded-order-field', className].filter(Boolean).join(' ')}><span>{label}{required && <b> *</b>}</span>{children}</label>
}
