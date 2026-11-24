import { useState } from 'react'
import { Button, Modal, Select, useToast } from '../../../components/ui'
import { FormActions, FormField, FormGrid, FormInput, FormSection } from '../../../components/forms'
import { getProducts } from '../../products/services/productService'
import '../styles/inventory.css'

export default function StockForm({ mode, onClose, onSubmit }) {
  const toast = useToast()
  const [form, setForm] = useState({ productId: '', qty: 0, unit: '', reference: '', reason: '' })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const products = getProducts()

  const validate = () => {
    const nextErrors = {}
    if (!form.productId) nextErrors.productId = 'Select a product'
    if (!form.qty || Number(form.qty) <= 0) nextErrors.qty = 'Enter a quantity greater than 0'
    if (!form.reference?.trim()) nextErrors.reference = 'Enter a reference number'
    if (!form.reason?.trim()) nextErrors.reason = 'Enter a reason'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)

    if (!validate()) {
      toast.error('Please complete the required fields')
      setIsSubmitting(false)
      return
    }

    try {
      onSubmit({
        productId: form.productId,
        qty: Number(form.qty),
        unit: products.find((product) => product.id === form.productId)?.unit ?? form.unit,
        reference: form.reference.trim(),
        reason: form.reason.trim(),
      })
      onClose()
    } catch (error) {
      toast.error(error.message ?? 'Could not save')
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={mode === 'stock-in' ? 'Record Stock In' : 'Record Stock Out'}
      description="Log a physical stock movement. Affects the product quantity."
      size="md"
      footer={
        <FormActions>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save Movement'}</Button>
        </FormActions>
      }
    >
      <form className="inventory-form" onSubmit={handleSubmit} noValidate>
        <FormSection>
          <FormGrid>
            <FormField label="Product" error={errors.productId} required>
              <Select
                value={form.productId}
                onChange={(event) => setForm((current) => ({ ...current, productId: event.target.value }))}
                options={products.map((product) => ({ value: product.id, label: `${product.name} (${product.code})` }))}
                placeholder="Select product"
              />
            </FormField>
            <FormField label="Quantity" error={errors.qty} required>
              <FormInput type="number" min="1" value={form.qty} onChange={(event) => setForm((current) => ({ ...current, qty: event.target.value }))} placeholder="0" />
            </FormField>
            <FormField label="Reference (e.g. PO-20261027)" error={errors.reference} required>
              <FormInput value={form.reference} onChange={(event) => setForm((current) => ({ ...current, reference: event.target.value }))} placeholder="PO-20261027" />
            </FormField>
            <FormField label="Reason" error={errors.reason} required hint={mode === 'stock-in' ? 'Why was stock received?' : 'Why was stock sold or returned?'}>
              <FormInput value={form.reason} onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))} placeholder="Sold" />
            </FormField>
          </FormGrid>
        </FormSection>
      </form>
    </Modal>
  )
}
