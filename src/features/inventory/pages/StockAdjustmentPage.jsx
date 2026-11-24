import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/hooks'
import { hasModulePermission } from '../../../core/accessControl'
import { Button, Card, CardBody, Modal, useToast } from '../../../components/ui'
import { Select } from '../../../components/ui'
import { FormField, FormGrid, FormInput, FormLabel, FormSection } from '../../../components/forms'
import { getProducts } from '../../products/services/productService'
import { createAdjustment, getStockHistory, getStockTable } from '../services/inventoryService'
import '../styles/inventory.css'

export default function StockAdjustmentPage() {
  const toast = useToast()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const canEditInventory = hasModulePermission(currentUser, 'Inventory', 'edit')
  const [form, setForm] = useState({ productId: '', newQuantity: 0, reason: '' })
  const [errors, setErrors] = useState({})
  const [confirmOpen, setConfirmOpen] = useState(false)

  const products = getProducts()
  const stockRows = getStockTable()
  const selectedProduct = products.find((product) => product.id === form.productId)
  const history = form.productId ? getStockHistory(form.productId) : []

  const validate = () => {
    const nextErrors = {}
    if (!form.productId) nextErrors.productId = 'Select a product'
    if (!form.newQuantity || Number(form.newQuantity) < 0) nextErrors.newQuantity = 'New quantity cannot be negative'
    if (!form.reason?.trim()) nextErrors.reason = 'Enter an adjustment reason'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!canEditInventory) return
    if (!validate()) return
    setConfirmOpen(true)
  }

  const handleConfirm = () => {
    if (!selectedProduct) return
    const previousStock = selectedProduct.quantity ?? 0
    try {
      const adjustment = createAdjustment({
        productId: form.productId,
        newQuantity: Number(form.newQuantity),
        reason: form.reason.trim(),
        date: new Date().toISOString(),
      })
      setConfirmOpen(false)
      toast.success(`Stock adjusted from ${previousStock} to ${adjustment.newStock}`)
    } catch (error) {
      toast.error(error.message ?? 'Could not adjust stock')
      setConfirmOpen(false)
    }
  }

  return (
    <div className="inventory-page">
      <header className="inventory-header">
        <div className="inventory-header__top">
          <div className="inventory-header__text">
            <p className="inventory-header__eyebrow"><span aria-hidden="true">#</span> Stock Adjustments</p>
            <h1 className="inventory-header__title">Adjustments</h1>
            <p className="inventory-header__description">Set a product's quantity directly. Adjustments always require confirmation.</p>
          </div>
          <Button size="sm" variant="secondary" onClick={() => navigate('/inventory')}>Back to Inventory</Button>
        </div>
      </header>

      <Card className="inventory-card">
        <CardBody>
          <form className="inventory-form" onSubmit={handleSubmit} noValidate>
            <FormSection>
              <FormGrid>
                <FormField label="Product" error={errors.productId} required>
                  <Select
                    value={form.productId}
                    onChange={(event) => setForm((current) => ({ ...current, productId: event.target.value }))}
                    options={stockRows.map((product) => ({ value: product.id, label: `${product.name} (${product.code})` }))}
                    placeholder="Select product"
                  />
                </FormField>
                <FormField label="Current Quantity">
                  <FormInput readOnly value={selectedProduct?.quantity ?? 0} placeholder="0" />
                </FormField>
                <FormField label="New Quantity" error={errors.newQuantity} required hint="Positive quantity. Negative is rejected.">
                  <FormInput
                    type="number"
                    min="0"
                    value={form.newQuantity}
                    onChange={(event) => setForm((current) => ({ ...current, newQuantity: event.target.value }))}
                    placeholder="0"
                  />
                </FormField>
                <FormField label="Adjustment Reason" error={errors.reason} required>
                  <FormInput
                    value={form.reason}
                    onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))}
                    placeholder="Recount, spoilage or audit adjustment"
                  />
                </FormField>
              </FormGrid>
              <FormField className="inventory-adjust-difference">
                <FormLabel>Difference</FormLabel>
                <FormInput readOnly value={form.newQuantity - (selectedProduct?.quantity ?? 0)} />
              </FormField>
              <Button type="submit" variant="primary" disabled={!canEditInventory}>Confirm Adjustment</Button>
            </FormSection>
          </form>
          <AdjustmentHistory history={history} />
        </CardBody>
      </Card>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirm Stock Adjustment?"
        description="This will set the product's stock to the new quantity."
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleConfirm} disabled={!canEditInventory}>Apply Adjustment</Button>
          </>
        }
      />
    </div>
  )
}

function AdjustmentHistory({ history }) {
  if (!history.length) {
    return <p className="inventory-empty">No adjustments recorded for the selected product.</p>
  }

  return (
    <ul className="inventory-history">
      {history.map((entry) => (
        <li key={entry.id} className="inventory-history__item">
          <strong>{entry.reason}</strong>
          <span>Qty: {entry.qty} · Prev: {entry.previousStock} → New: {entry.newStock}</span>
          <small>{new Date(entry.date).toLocaleString('en-IN')}</small>
        </li>
      ))}
    </ul>
  )
}
