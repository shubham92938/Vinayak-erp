import { useMemo, useState } from 'react'
import { Button, Modal, Select, useToast } from '../../../components/ui'
import { FormActions, FormField, FormGrid, FormInput, FormSection, FormTextarea } from '../../../components/forms'
import { createChallan, createSale, getProductsForSale, getSaleTotals } from '../services/saleService'
import InvoicePreview from './InvoicePreview'
import { formatMoney } from './saleUtils'
import { getCustomers } from '../../../core/store'
import '../styles/sales.css'

export default function SaleForm({ mode, sale, onClose, onSubmit }) {
  const toast = useToast()
  const isChallan = mode === 'challan'

  const customers = useMemo(() => getCustomers(), [])
  const productOptions = useMemo(() => getProductsForSale().map((product) => ({ value: product.id, label: `${product.name} — ${product.unit}` })), [])

  const [form, setForm] = useState(() => ({
    customerId: sale?.customerId ?? customers[0]?.id ?? '',
    date: sale?.date ?? new Date().toISOString().slice(0, 16),
    items: sale?.items ?? [
      { productId: productOptions[0]?.value ?? '', qty: 1, price: productOptions[0] ? (getProductsForSale().find((p) => p.id === productOptions[0].value)?.sellingPrice ?? 0) : 0, taxPct: 18, discount: 0 },
    ],
    notes: sale?.notes ?? '',
    advance: sale?.advance ?? 0,
  }))
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const updateItem = (index, field) => (event) => {
    setForm((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => {
        if (itemIndex !== index) return item
        const next = { ...item, [field]: event.target.value }
        if (field === 'productId') {
          const product = getProductsForSale().find((entry) => entry.id === next.productId)
          next.price = product?.sellingPrice ?? item.price
        }
        return next
      }),
    }))
  }

  const addItem = () => {
    setForm((current) => ({
      ...current,
      items: [
        ...current.items,
        { productId: '', qty: 1, price: 0, taxPct: 18, discount: 0 },
      ],
    }))
  }

  const removeItem = (index) => {
    setForm((current) => ({
      ...current,
      items: current.items.filter((item, itemIndex) => itemIndex !== index),
    }))
  }

  const totals = useMemo(() => {
    const computed = getSaleTotals(form)
    return {
      ...computed,
      due: Math.max(0, computed.total - (Number(form.advance) || 0)),
    }
  }, [form])

  const validate = () => {
    const nextErrors = {}
    if (!form.customerId) nextErrors.customerId = 'Select a customer'
    if (form.items.length === 0) nextErrors.items = 'Add at least one product'
    for (const [index, item] of form.items.entries()) {
      if (!item.productId) nextErrors[`productId-${index}`] = `Product ${index + 1} is required`
      if (!item.qty || Number(item.qty) <= 0) nextErrors[`qty-${index}`] = 'Quantity must be greater than 0'
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)

    if (!validate()) {
      toast.error('Please complete the required fields')
      setIsSubmitting(false)
      return
    }

    try {
      const customer = customers.find((entry) => entry.id === form.customerId)
      if (isChallan) {
        createChallan({
          customerId: form.customerId,
          customerName: customer?.name,
          date: form.date,
          items: form.items.map((item) => ({ ...item })),
          discount: 0,
          notes: form.notes,
        })
        toast.success('Challan created')
      } else {
        createSale({
          customerId: form.customerId,
          customerName: customer?.name,
          date: form.date,
          items: form.items.map((item) => ({ ...item })),
          discount: 0,
          advance: Number(form.advance) || 0,
          notes: form.notes,
        })
        toast.success('Sale recorded. Inventory and balances updated.')
      }
      onSubmit()
      onClose()
    } catch (error) {
      toast.error(error.message ?? 'Could not save sale')
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={isChallan ? 'Record Challan' : 'Create Sale'}
      description="Products and totals are calculated live. Tax is added at 18%."
      size="lg"
      footer={
        <FormActions>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Record Sale'}</Button>
        </FormActions>
      }
    >
      <form className="sales-form" onSubmit={handleSubmit} noValidate>
        <FormSection title="Customer &amp; Details">
          <FormGrid>
            <FormField label="Customer" error={errors.customerId} required>
              <Select
                value={form.customerId}
                onChange={(event) => setForm((current) => ({ ...current, customerId: event.target.value }))}
                options={customers.map((customer) => ({ value: customer.id, label: customer.name }))}
              />
            </FormField>
            <FormField label="Invoice Date">
              <FormInput type="date" value={form.date} onChange={updateField('date')} />
            </FormField>
            <FormField label="Invoice Number (optional)">
              <FormInput placeholder="AUTO" disabled />
            </FormField>
            <FormField label="Challan Number (optional)">
              <FormInput placeholder="AUTO" disabled />
            </FormField>
            <FormField label="Advance Payment">
              <FormInput type="number" min="0" value={form.advance} onChange={updateField('advance')} placeholder="0" />
            </FormField>
            <FormField label="Notes" optional>
              <FormTextarea value={form.notes} onChange={updateField('notes')} placeholder="Order instructions" />
            </FormField>
          </FormGrid>
        </FormSection>

        <FormSection title="Items">
          <div className="sales-items">
            <div className="sales-items__head">
              <span>Product</span><span>Qty</span><span>Price</span><span className="sales-align-right">Tax</span><span className="sales-align-right">Amount</span><span />
            </div>
            {form.items.map((item, index) => {
              const lineTotal = Number(item.qty ?? 0) * Number(item.price ?? 0)
              return (
                <div key={index} className="sales-item">
                  <Select
                    value={item.productId}
                    onChange={updateItem(index, 'productId')}
                    options={productOptions}
                    placeholder="Select product"
                    className="sales-item__product"
                  />
                  <FormInput type="number" min="0" value={item.qty} onChange={updateItem(index, 'qty')} placeholder="0" className="sales-item__qty" />
                  <FormInput type="number" min="0" value={item.price} onChange={updateItem(index, 'price')} placeholder="0.00" className="sales-item__price" />
                  <FormInput type="number" value={item.taxPct} onChange={updateItem(index, 'taxPct')} placeholder="18" className="sales-item__tax" />
                  <span className="sales-align-right">{formatMoney(lineTotal)}</span>
                  <Button type="button" variant="ghost" iconOnly onClick={() => removeItem(index)} aria-label={`Remove item ${index + 1}`}>×</Button>
                  {errors[`productId-${index}`] && <div className="sales-form-error">{errors[`productId-${index}`]}</div>}
                  {errors[`qty-${index}`] && <div className="sales-form-error">{errors[`qty-${index}`]}</div>}
                </div>
              )
            })}
            <div className="sales-items__add">
              <Button type="button" variant="secondary" size="sm" onClick={addItem}>+ Add Product</Button>
            </div>
          </div>
        </FormSection>

        <InvoicePreview sale={form} totals={totals} />
      </form>
    </Modal>
  )
}
