import { Button, Card, CardBody, Select, useToast } from '../../../components/ui'
import { FormField, FormGrid, FormInput, FormSection } from '../../../components/forms'
import { useState } from 'react'
import { useAuth, useFirmContext } from '../../../context/hooks'
import { canAccessRecord } from '../../../core/accessControl'
import { getAllProducts } from '../../products/services/productService'
import { createTransfer } from '../services/inventoryService'
import { useNavigate } from 'react-router-dom'
import '../styles/inventory.css'

export default function StockTransferPage() {
  const toast = useToast()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { accessibleFirms } = useFirmContext()
  const [form, setForm] = useState({ sourceFirmId: '', destinationFirmId: '', productId: '', qty: 0, notes: '' })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const firms = accessibleFirms
  const products = getAllProducts().filter((product) =>
    canAccessRecord(currentUser, product, 'Inventory', 'edit'),
  )

  const validate = () => {
    const nextErrors = {}
    if (!form.sourceFirmId) nextErrors.sourceFirmId = 'Select source firm'
    if (!form.destinationFirmId) nextErrors.destinationFirmId = 'Select destination firm'
    if (form.sourceFirmId === form.destinationFirmId) nextErrors.destinationFirmId = 'Choose a different destination firm'
    if (!form.productId) nextErrors.productId = 'Select a product'
    if (!form.qty || Number(form.qty) <= 0) nextErrors.qty = 'Enter a quantity greater than 0'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    if (!validate()) {
      setIsSubmitting(false)
      return
    }

    try {
      const { outgoing, incoming } = createTransfer({
        sourceFirmId: form.sourceFirmId,
        destinationFirmId: form.destinationFirmId,
        productId: form.productId,
        qty: Number(form.qty),
        notes: form.notes.trim(),
        user: currentUser,
      })
      setForm((current) => ({ ...current, qty: 0, notes: '' }))
      setIsSubmitting(false)
      toast.success(`Transferred ${outgoing.qty} to ${incoming.productId}. Out and in movements recorded.`)
    } catch (error) {
      toast.error(error.message ?? 'Transfer failed')
      setIsSubmitting(false)
    }
  }

  void navigate

  return (
    <div className="inventory-page">
      <header className="inventory-header">
        <div className="inventory-header__top">
          <div className="inventory-header__text">
            <p className="inventory-header__eyebrow"><span aria-hidden="true">#</span> Stock Transfers</p>
            <h1 className="inventory-header__title">Transfer between Firms</h1>
            <p className="inventory-header__description">Move stock between firms. Outgoing and incoming stock movements are recorded.</p>
          </div>
          <Button size="sm" variant="secondary" onClick={() => navigate('/inventory')}>Back to Inventory</Button>
        </div>
      </header>

      <Card className="inventory-card">
        <CardBody>
          <form className="inventory-form" onSubmit={handleSubmit} noValidate>
            <FormSection>
              <FormGrid>
                <FormField label="Source Firm" error={errors.sourceFirmId} required>
                  <Select
                    value={form.sourceFirmId}
                    onChange={(event) => setForm((current) => ({ ...current, sourceFirmId: event.target.value }))}
                    options={firms.filter((firm) => canAccessRecord(currentUser, { firmId: firm.id }, 'Inventory', 'edit')).map((firm) => ({ value: firm.id, label: firm.name }))}
                    placeholder="Select source firm"
                  />
                </FormField>
                <FormField label="Destination Firm" error={errors.destinationFirmId} required>
                  <Select
                    value={form.destinationFirmId}
                    onChange={(event) => setForm((current) => ({ ...current, destinationFirmId: event.target.value }))}
                    options={firms.filter((firm) => canAccessRecord(currentUser, { firmId: firm.id }, 'Inventory', 'create')).map((firm) => ({ value: firm.id, label: firm.name }))}
                    placeholder="Select destination firm"
                  />
                </FormField>
                <FormField label="Product" error={errors.productId} required>
                  <Select
                    value={form.productId}
                    onChange={(event) => setForm((current) => ({ ...current, productId: event.target.value }))}
                    options={products
                      .filter((product) => product.firmId === form.sourceFirmId)
                      .map((product) => ({ value: product.id, label: `${product.name} (${product.code})` }))}
                    placeholder="Select product"
                    disabled={!form.sourceFirmId}
                  />
                </FormField>
                <FormField label="Quantity" error={errors.qty} required>
                  <FormInput type="number" min="1" value={form.qty} onChange={(event) => setForm((current) => ({ ...current, qty: event.target.value }))} placeholder="0" />
                </FormField>
                <FormField label="Notes" optional>
                  <FormInput value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} placeholder="e.g. Replenishment from parent firm" />
                </FormField>
              </FormGrid>
              <Button type="submit" variant="primary" disabled={isSubmitting}>Transfer Stock</Button>
            </FormSection>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
