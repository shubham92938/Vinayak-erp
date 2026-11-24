import { useMemo, useState } from 'react'
import { ArrowLeft, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../../../components/ui'
import { getCustomers } from '../../../core/store'
import { createSale } from '../../../core/salesStore'
import { createSalesOrder } from '../../../core/salesOrdersStore'
import { getProducts } from '../../products/services/productService'
import { formatMoney } from './saleUtils'
import './recordedOrderForm.css'

function today() {
  return new Date().toISOString().slice(0, 10)
}

const EMPTY_ITEM = { productId: '', name: '', qty: 1, price: 0, taxPct: 0, unit: 'nos' }

export default function RecordedSalesOrderForm({ mode = 'order', onClose }) {
  const navigate = useNavigate()
  const toast = useToast()
  const customers = getCustomers()
  const products = getProducts()
  const [form, setForm] = useState({
    date: today(),
    type: mode === 'sale' ? 'Invoice' : '',
    customerId: '',
    orderType: '',
    reference: 'ORD',
    advance: '0',
    paymentType: '',
    invoiceType: '',
    vehicleNumber: '',
    driverNumber: '',
    notes: '',
    productSearch: '',
    category: 'all',
  })
  const [items, setItems] = useState([])
  const [saving, setSaving] = useState(false)

  const categories = useMemo(
    () => [...new Map(products.map((product) => [product.categoryId, product.categoryId])).entries()].map(([id]) => id),
    [products],
  )

  const filteredProducts = products.filter((product) => {
    const query = form.productSearch.trim().toLowerCase()
    return (!query || `${product.name} ${product.code}`.toLowerCase().includes(query)) &&
      (form.category === 'all' || product.categoryId === form.category)
  })

  const selectedCustomer = customers.find((customer) => customer.id === form.customerId)
  const subtotal = items.reduce((sum, item) => sum + Number(item.qty || 0) * Number(item.price || 0), 0)
  const tax = items.reduce((sum, item) => sum + (Number(item.qty || 0) * Number(item.price || 0) * Number(item.taxPct || 0)) / 100, 0)
  const total = subtotal + tax

  const addProduct = (product) => {
    setItems((current) => {
      const existingIndex = current.findIndex((item) => item.productId === product.id)
      if (existingIndex !== -1) {
        return current.map((item, index) => index === existingIndex ? { ...item, qty: Number(item.qty || 0) + 1 } : item)
      }
      return [...current, { ...EMPTY_ITEM, productId: product.id, name: product.name, qty: 1, price: product.sellingPrice ?? 0, unit: product.unit ?? 'nos' }]
    })
    toast.success('Product has been added to cart')
  }

  const updateItem = (index, field, value) => {
    setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item))
  }

  const removeItem = (index) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return
    setItems((current) => current.filter((_item, itemIndex) => itemIndex !== index))
  }

  const submit = (event) => {
    event.preventDefault()
    if (saving) return
    if (!form.type || !form.customerId || !form.orderType || items.length === 0) {
      toast.error('Select the required order fields and add at least one product')
      return
    }
    if (items.some((item) => Number(item.qty) <= 0)) {
      toast.error('Product quantity must be greater than zero')
      return
    }

    setSaving(true)
    const payload = {
      customerId: form.customerId,
      customerName: selectedCustomer?.name ?? 'Customer',
      items: items.map((item) => ({ ...item, qty: Number(item.qty), price: Number(item.price), taxPct: Number(item.taxPct || 0) })),
      advance: Number(form.advance || 0),
      date: form.date,
      notes: form.notes,
      type: form.type,
      reference: form.reference,
    }

    try {
      if (mode === 'sale') createSale(payload)
      else createSalesOrder(payload)
      toast.success(mode === 'sale' ? 'Sales order placed' : 'Sales order created')
      onClose?.()
      navigate(mode === 'sale' ? '../sales' : '../sales-orders')
    } catch (error) {
      toast.error(error?.message ?? 'Could not save the order')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="recorded-order-page">
      <div className="recorded-order-page__titlebar">
        <button type="button" className="recorded-back-button" onClick={() => onClose ? onClose() : navigate(-1)}><ArrowLeft size={13} /> Back</button>
        <h1>Create Sales Order</h1>
      </div>

      <form onSubmit={submit}>
        <section className="recorded-order-card">
          <div className="recorded-order-grid recorded-order-grid--top">
            <Field label="Date" required><input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /></Field>
            <Field label="Type" required><select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}><option value="">--Select--</option><option>Invoice</option><option>Challan</option></select></Field>
            <Field label="Customer" required><select value={form.customerId} onChange={(event) => setForm({ ...form, customerId: event.target.value })}><option value="">Select an option</option>{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}</select></Field>
            <Field label="Order Type" required><select value={form.orderType} onChange={(event) => setForm({ ...form, orderType: event.target.value })}><option value="">--Select--</option><option>Retail</option><option>Wholesale</option><option>Dealer</option></select></Field>
          </div>

          <div className="recorded-order-items">
            <div className="recorded-order-items__head"><span>Image</span><span>Product</span><span>Quantity</span><span>Price</span><span>Subtotal</span><span>Action</span></div>
            {items.length === 0 && <div className="recorded-order-items__empty">Add Products</div>}
            {items.map((item, index) => (
              <div className="recorded-order-items__row" key={item.productId}>
                <span className="recorded-order-product-image"><ShoppingCart size={14} /></span>
                <span className="recorded-order-items__name">{item.name}</span>
                <span className="recorded-quantity-control"><button type="button" onClick={() => updateItem(index, 'qty', Math.max(1, Number(item.qty) - 1))} aria-label="Decrease quantity"><Minus size={11} /></button><input type="number" min="1" value={item.qty} onChange={(event) => updateItem(index, 'qty', event.target.value)} /><button type="button" onClick={() => updateItem(index, 'qty', Number(item.qty) + 1)} aria-label="Increase quantity"><Plus size={11} /></button></span>
                <input type="number" min="0" value={item.price} onChange={(event) => updateItem(index, 'price', event.target.value)} aria-label={`Price for ${item.name}`} />
                <span>{formatMoney(Number(item.qty || 0) * Number(item.price || 0))}</span>
                <button type="button" className="recorded-delete-button" onClick={() => removeItem(index)} aria-label={`Delete ${item.name}`} title="Delete item"><Trash2 size={13} /></button>
              </div>
            ))}
            <div className="recorded-order-totals">
              <span>Total Product</span><b>{items.length}</b>
              <span>Subtotal</span><b>{formatMoney(subtotal)}</b>
              <span>Tax</span><b>{formatMoney(tax)}</b>
              <span>Discount</span><input aria-label="Discount" placeholder="discount" />
              <span>Total</span><strong>{formatMoney(total)}</strong>
            </div>
          </div>

          <div className="recorded-order-grid recorded-order-grid--lower">
            <Field label="Reference"><input value={form.reference} onChange={(event) => setForm({ ...form, reference: event.target.value })} /></Field>
            <Field label="Advance Paying Amount"><input type="number" min="0" value={form.advance} onChange={(event) => setForm({ ...form, advance: event.target.value })} /></Field>
            <Field label="Payment Type"><select value={form.paymentType} onChange={(event) => setForm({ ...form, paymentType: event.target.value })}><option value="">--Select--</option><option>Cash</option><option>Online</option><option>Credit</option></select></Field>
            <Field label="Invoice Type"><select value={form.invoiceType} onChange={(event) => setForm({ ...form, invoiceType: event.target.value })}><option value="">--Select--</option><option>Regular</option><option>Tax Invoice</option></select></Field>
            <Field label="Vehicle Number"><input value={form.vehicleNumber} onChange={(event) => setForm({ ...form, vehicleNumber: event.target.value })} /></Field>
            <Field label="Driver Number"><input value={form.driverNumber} onChange={(event) => setForm({ ...form, driverNumber: event.target.value })} /></Field>
            <Field label="Notes" className="is-wide"><textarea rows="3" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></Field>
          </div>
          <div className="recorded-order-submit"><button type="submit" className="recorded-primary-button" disabled={saving}>{saving ? 'Saving…' : 'Place Order'}</button></div>
        </section>
      </form>

      <section className="recorded-order-card recorded-products-list">
        <h2>Products List</h2>
        <div className="recorded-products-list__filters">
          <input value={form.productSearch} onChange={(event) => setForm({ ...form, productSearch: event.target.value })} placeholder="Search by product name" aria-label="Search products to add" />
          <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} aria-label="Filter products by category"><option value="all">Filter by category</option>{categories.map((category) => <option key={category} value={category}>{category}</option>)}</select>
        </div>
        <div className="recorded-products-list__table">
          <div className="recorded-products-list__head"><span>No.</span><span>Name</span><span>Category</span><span>Quantity</span><span>Price</span><span>Tax</span><span>Action</span></div>
          {filteredProducts.slice(0, 20).map((product) => (
            <div className="recorded-products-list__row" key={product.id}>
              <span className="recorded-order-product-image"><ShoppingCart size={14} /></span>
              <span>{product.name}</span><span>{product.categoryId}</span><span>{product.quantity ?? 0}</span><span>{formatMoney(product.sellingPrice)}</span><span>0%</span>
              <button type="button" className="recorded-cart-button" onClick={() => addProduct(product)} aria-label={`Add ${product.name} to cart`}><ShoppingCart size={13} /></button>
            </div>
          ))}
          {filteredProducts.length === 0 && <p className="recorded-products-list__empty">No products found.</p>}
        </div>
      </section>
    </div>
  )
}

function Field({ label, children, required, className = '' }) {
  return <label className={['recorded-order-field', className].filter(Boolean).join(' ')}><span>{label}{required && <b> *</b>}</span>{children}</label>
}
