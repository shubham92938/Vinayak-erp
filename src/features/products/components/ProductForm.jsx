import { Camera, X } from 'lucide-react'
import { useState } from 'react'
import { useToast } from '../../../components/ui'
import { useFirmContext } from '../../../context/hooks'
import { getCurrentUser } from '../../users/utils/userUtils'
import { generateUniqueProductCode } from '../services/productService'
import { UNITS } from '../utils/productUtils'
import '../styles/products.css'

const toNumber = (value) => {
  const parsed = Number(String(value ?? '').trim())
  return Number.isFinite(parsed) ? parsed : 0
}

export default function ProductForm({ mode, product, categories, onClose, onSubmit }) {
  const toast = useToast()
  const { currentFirmId } = useFirmContext()
  const currentUser = getCurrentUser()
  const isEditing = mode === 'edit' && Boolean(product)
  const initialFirmId = product?.firmId ?? currentFirmId ?? currentUser?.firmId ?? null
  const [form, setForm] = useState(() => ({
    name: product?.name ?? '',
    code: product?.code ?? '',
    categoryId: product?.categoryId ?? '',
    buyingPrice: product?.buyingPrice ?? '',
    sellingPrice: product?.sellingPrice ?? '',
    quantity: product?.quantity ?? 0,
    minStock: product?.minStock ?? 0,
    unit: product?.unit ?? 'nos',
    taxSGST: product?.taxSGST ?? '',
    taxCGST: product?.taxCGST ?? '',
    taxIGST: product?.taxIGST ?? '',
    notes: product?.description ?? product?.notes ?? '',
    firmId: initialFirmId,
    status: product?.status ?? 'active',
  }))
  const [imagePreview, setImagePreview] = useState(product?.image ?? '')
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))

  const submit = async (event) => {
    event.preventDefault()
    if (saving) return
    const nextErrors = {}
    if (!form.name.trim()) nextErrors.name = 'Product name is required'
    if (!form.categoryId) nextErrors.categoryId = 'Category is required'
    if (!form.unit) nextErrors.unit = 'Unit is required'
    if (toNumber(form.buyingPrice) < 0) nextErrors.buyingPrice = 'Enter a valid buying price'
    if (toNumber(form.sellingPrice) < 0) nextErrors.sellingPrice = 'Enter a valid selling price'
    if (toNumber(form.quantity) < 0) nextErrors.quantity = 'Quantity cannot be negative'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      toast.error('Please complete the required fields')
      return
    }

    setSaving(true)
    const code = form.code.trim().toUpperCase() || generateUniqueProductCode(form.firmId, form.name.trim().slice(0, 12) || 'PRD')
    const data = {
      id: product?.id,
      name: form.name.trim(),
      code,
      categoryId: form.categoryId,
      unit: form.unit,
      image: imagePreview || undefined,
      firmId: form.firmId,
      buyingPrice: toNumber(form.buyingPrice),
      sellingPrice: toNumber(form.sellingPrice),
      quantity: toNumber(form.quantity),
      minStock: toNumber(form.minStock),
      taxSGST: form.taxSGST === '' ? null : toNumber(form.taxSGST),
      taxCGST: form.taxCGST === '' ? null : toNumber(form.taxCGST),
      taxIGST: form.taxIGST === '' ? null : toNumber(form.taxIGST),
      description: form.notes.trim(),
      status: form.status,
    }

    try {
      const saved = await onSubmit(data)
      if (saved) onClose()
    } finally {
      setSaving(false)
    }
  }

  const chooseImage = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be smaller than 2 MB')
      return
    }
    const reader = new FileReader()
    reader.onload = () => setImagePreview(String(reader.result))
    reader.onerror = () => toast.error('Could not read the image')
    reader.readAsDataURL(file)
  }

  return (
    <section className="recorded-product-form" aria-labelledby="product-form-title">
      <div className="recorded-product-form__titlebar">
        <h1 id="product-form-title">{isEditing ? 'Edit Product' : 'Add Product'}</h1>
        <button type="button" onClick={onClose} aria-label="Close product form" title="Close"><X size={15} /></button>
      </div>

      <form onSubmit={submit} noValidate>
        <div className="recorded-product-form__photo">
          <span className="recorded-product-form__label">Product Image</span>
          <div className="recorded-product-form__photo-preview">
            {imagePreview ? <img src={imagePreview} alt="Product preview" /> : <><Camera size={58} strokeWidth={1.5} /><strong>NO PHOTO</strong></>}
          </div>
          <small>JPG or PNG no longer than 2 MB</small>
          <label className="recorded-file-input">
            <span>Choose file</span>
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={chooseImage} />
          </label>
        </div>

        <div className="recorded-product-form__body">
          <div className="recorded-product-form__section-title">{isEditing ? 'Edit Product' : 'Add Product'} <span aria-hidden="true">×</span></div>
          <div className="recorded-product-form__grid">
            <Field label="Name" error={errors.name} required><input value={form.name} onChange={update('name')} placeholder="Product name" /></Field>
            <Field label="Categories" error={errors.categoryId} required>
              <select value={form.categoryId} onChange={update('categoryId')}>
                <option value="">Select a Categories:</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </Field>
            <Field label="Dealer Selling Price" error={errors.buyingPrice}><input type="number" min="0" step="0.01" value={form.buyingPrice} onChange={update('buyingPrice')} placeholder="0" /></Field>
            <Field label="Customer Selling Price" error={errors.sellingPrice}><input type="number" min="0" step="0.01" value={form.sellingPrice} onChange={update('sellingPrice')} placeholder="0" /></Field>
            <Field label="Quantity" error={errors.quantity}><input type="number" min="0" step="1" value={form.quantity} onChange={update('quantity')} placeholder="0" /></Field>
            <Field label="Quantity Alert"><input type="number" min="0" step="1" value={form.minStock} onChange={update('minStock')} placeholder="0" /></Field>
            <Field label="Unit" error={errors.unit} required>
              <select value={form.unit} onChange={update('unit')}>
                <option value="">Select a unit:</option>
                {UNITS.map((unit) => <option key={unit.value} value={unit.value}>{unit.label}</option>)}
              </select>
            </Field>
            <Field label="Tax (SGST)-(optional)"><input type="number" min="0" step="0.01" value={form.taxSGST} onChange={update('taxSGST')} placeholder="0" /></Field>
            <Field label="Tax (CGST)-(optional)"><input type="number" min="0" step="0.01" value={form.taxCGST} onChange={update('taxCGST')} placeholder="0" /></Field>
            <Field label="Tax (IGST)-(optional)"><input type="number" min="0" step="0.01" value={form.taxIGST} onChange={update('taxIGST')} placeholder="0" /></Field>
            <Field label="Notes (Optional)" className="is-wide"><textarea value={form.notes} onChange={update('notes')} placeholder="Product notes" rows={4} /></Field>
          </div>
          <div className="recorded-product-form__actions">
            <button type="submit" className="recorded-primary-button" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
            <button type="button" className="recorded-danger-button" onClick={onClose} disabled={saving}>Cancel</button>
          </div>
        </div>
      </form>
    </section>
  )
}

function Field({ label, children, required, error, className = '' }) {
  return (
    <label className={['recorded-form-field', className].filter(Boolean).join(' ')}>
      <span>{label}{required && <b> *</b>}</span>
      {children}
      {error && <small className="recorded-form-field__error">{error}</small>}
    </label>
  )
}
