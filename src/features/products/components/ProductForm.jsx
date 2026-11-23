import { useState } from 'react'
import { Button, Modal, useToast } from '../../../components/ui'
import {
  FormActions,
  FormField,
  FormGrid,
  FormInput,
  FormSection,
  FormSelect,
  FormTextarea,
} from '../../../components/forms'
import { PRODUCT_STATUSES, UNITS, productCodeExists, productImageUrl } from '../utils/productUtils'
import { getCurrentUser, getManageableFirms, isSuperAdmin } from '../../users/utils/userUtils'
import { getProducts } from '../services/productService'
import '../styles/products.css'

const PRODUCT_CODE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9-_]{1,19}$/
const PRICE_PATTERN = /^\d+(\.\d+)?$/

const toNumber = (value) => {
  const trimmed = String(value ?? '').trim()
  if (trimmed === '') return null
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : null
}

function isValidPrice(value) {
  if (value === '' || value === null || value === undefined) return true
  return PRICE_PATTERN.test(String(value)) && Number(value) >= 0
}

export default function ProductForm({ mode, product, categories, onClose, onSubmit }) {
  const toast = useToast()
  const isCreating = mode === 'add'
  const isEditing = mode === 'edit' && Boolean(product)

  const currentUser = getCurrentUser()
  const isSuperAdminUser = isSuperAdmin(currentUser)
  const currentUserFirmId = currentUser?.firmId ?? null

  const firmOptions = getManageableFirms(currentUser).map((firm) => ({
    value: firm.id,
    label: `${firm.name} · ${firm.location}`,
  }))

  const categoryOptions = categories?.map((category) => ({
    value: category.id,
    label: `${category.name} · ${category.code}`,
  }))

  const initialFirmId = isSuperAdminUser
    ? product?.firmId ?? ''
    : currentUserFirmId ?? ''

  const [form, setForm] = useState(() => ({
    name: product?.name ?? '',
    code: product?.code ?? '',
    categoryId: product?.categoryId ?? '',
    description: product?.description ?? '',
    unit: product?.unit ?? 'pcs',
    buyingPrice: product?.buyingPrice ?? '',
    sellingPrice: product?.sellingPrice ?? '',
    mrp: product?.mrp ?? '',
    openingStock: product?.quantity ?? 0,
    minStock: product?.minStock ?? 0,
    stockTracking: product?.stockTracking !== false,
    status: product?.status ?? 'active',
    firmId: initialFirmId,
  }))
  const [imagePreview, setImagePreview] = useState(
    product?.image ?? productImageUrl(product?.name ?? 'New product'),
  )
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateField = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }))

  const validate = () => {
    const nextErrors = {}

    if (!form.name.trim()) {
      nextErrors.name = 'Product name is required'
    } else if (form.name.trim().length < 2 || form.name.trim().length > 80) {
      nextErrors.name = 'Product name must be between 2 and 80 characters'
    }

    if (!form.code.trim()) {
      nextErrors.code = 'Product code is required'
    } else if (!PRODUCT_CODE_PATTERN.test(form.code.trim())) {
      nextErrors.code = 'Use letters, digits, hyphens or underscores (2-20 characters)'
    } else if (productCodeExists(getProducts(), form.firmId, form.code.trim(), product?.id)) {
      nextErrors.code = 'This product code is already used in this firm'
    }

    if (!form.categoryId) {
      nextErrors.categoryId = 'Select a category'
    }

    if (!UNITS.some((unit) => unit.value === form.unit)) {
      nextErrors.unit = 'Select a unit'
    }

    if (!isValidPrice(form.buyingPrice)) {
      nextErrors.buyingPrice = 'Buying price must be 0 or more'
    }
    if (!isValidPrice(form.sellingPrice)) {
      nextErrors.sellingPrice = 'Selling price must be 0 or more'
    }
    if (form.mrp !== '' && form.mrp !== null && (!isValidPrice(form.mrp) || Number(form.mrp) < 0)) {
      nextErrors.mrp = 'MRP must be 0 or more'
    }
    if (!isValidPrice(form.openingStock) || Number(form.openingStock ?? 0) < 0) {
      nextErrors.openingStock = 'Opening stock must be 0 or more'
    }
    if (!isValidPrice(form.minStock) || Number(form.minStock ?? 0) < 0) {
      nextErrors.minStock = 'Minimum stock must be 0 or more'
    }

    if (!form.firmId) {
      nextErrors.firmId = 'Firm is required'
    } else if (!isSuperAdminUser && form.firmId !== currentUserFirmId) {
      nextErrors.firmId = 'You can only assign products to your own firm'
    }

    if (!form.status) {
      nextErrors.status = 'Choose a status'
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

    const nextProduct = {
      id: product?.id,
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      categoryId: form.categoryId,
      description: form.description?.trim() ?? '',
      unit: form.unit,
      image: imagePreview || undefined,
      firmId: form.firmId || null,
      buyingPrice: toNumber(form.buyingPrice) ?? 0,
      sellingPrice: toNumber(form.sellingPrice) ?? 0,
      mrp: toNumber(form.mrp),
      quantity: toNumber(form.openingStock) ?? 0,
      minStock: toNumber(form.minStock) ?? 0,
      stockTracking: form.stockTracking,
      status: form.status,
    }

    try {
      await onSubmit(nextProduct)
      onClose()
      toast.success(isCreating ? 'Product created' : 'Product updated')
    } catch {
      toast.error('Could not save product')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be smaller than 2 MB')
      return
    }

    const reader = new FileReader()
    reader.onload = () => setImagePreview(reader.result)
    reader.onerror = () => toast.error('Could not read the image file')
    reader.readAsDataURL(file)
  }

  const handleFileClear = () => setImagePreview('')

  return (
    <Modal
      open
      onClose={onClose}
      title={isEditing ? `Edit ${product.name}` : 'Add product'}
      description="Products belong to a firm. Prices must be 0 or more and stock can be set at setup."
      size="lg"
      footer={
        <FormActions>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : isCreating ? 'Create product' : 'Save changes'}
          </Button>
        </FormActions>
      }
    >
      <form className="products-form" onSubmit={handleSubmit} noValidate>
        {Object.keys(errors).length > 0 && (
          <div className="products-form-error" role="alert">
            {Object.values(errors)[0]}
          </div>
        )}

        <FormSection title="Basic Information">
          <FormGrid>
            <FormField label="Product Name" error={errors.name} required>
              <FormInput value={form.name} onChange={updateField('name')} placeholder="e.g. Samsung Galaxy S24" />
            </FormField>

            <FormField label="Product Code" error={errors.code} hint="Unique per firm, 2-20 characters." required>
              <FormInput value={form.code} onChange={updateField('code')} placeholder="e.g. SMG24U" />
            </FormField>

            <FormField label="Product Image" hint="Optional preview image. Upload shows it before saving.">
              <div className="products-form-image">
                <img src={imagePreview} alt="" className="products-form-image__preview" />
                <label className="products-form-image__upload">
                  Upload image
                  <input
                    type="file"
                    className="products-form-image__input"
                    accept="image/png,image/jpeg,image/webp"
                    aria-label="Product image"
                    onChange={handleImageChange}
                  />
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleFileClear}
                  disabled={isEditing && !product?.image}
                >
                  Clear
                </Button>
              </div>
            </FormField>

            <FormField label="Category" error={errors.categoryId} required>
              <FormSelect
                value={form.categoryId}
                onChange={updateField('categoryId')}
                options={categoryOptions}
                placeholder="Select category"
              />
            </FormField>

            <FormField label="Description" optional>
              <FormTextarea
                value={form.description}
                onChange={updateField('description')}
                placeholder="Product description"
              />
            </FormField>

            <FormField label="Unit" error={errors.unit} required>
              <FormSelect value={form.unit} onChange={updateField('unit')} options={UNITS} />
            </FormField>
          </FormGrid>
        </FormSection>

        <FormSection title="Pricing" description="Leave MRP blank when not applicable.">
          <FormGrid>
            <FormField label="Buying Price" error={errors.buyingPrice} hint="Cost paid by the firm." required>
              <FormInput
                type="number"
                min="0"
                step="0.01"
                value={form.buyingPrice}
                onChange={updateField('buyingPrice')}
                placeholder="0.00"
              />
            </FormField>

            <FormField label="Selling Price" error={errors.sellingPrice} hint="Customer-facing price." required>
              <FormInput
                type="number"
                min="0"
                step="0.01"
                value={form.sellingPrice}
                onChange={updateField('sellingPrice')}
                placeholder="0.00"
              />
            </FormField>

            <FormField label="MRP (Optional)" error={errors.mrp}>
              <FormInput
                type="number"
                min="0"
                step="0.01"
                value={form.mrp}
                onChange={updateField('mrp')}
                placeholder="Maximum Retail Price"
              />
            </FormField>
          </FormGrid>
        </FormSection>

        <FormSection title="Inventory">
          <FormGrid>
            <FormField label="Opening Stock" error={errors.openingStock}>
              <FormInput
                type="number"
                min="0"
                step="1"
                value={form.openingStock}
                onChange={updateField('openingStock')}
                placeholder="0"
              />
            </FormField>

            <FormField label="Minimum Stock Alert" error={errors.minStock}>
              <FormInput
                type="number"
                min="0"
                step="1"
                value={form.minStock}
                onChange={updateField('minStock')}
                placeholder="0"
              />
            </FormField>

            <FormField label="Stock Tracking" hint="When disabled, stock levels are not monitored.">
              <FormSelect
                value={form.stockTracking ? 'enabled' : 'disabled'}
                onChange={(event) =>
                  setForm((current) => ({ ...current, stockTracking: event.target.value === 'enabled' }))
                }
                options={[
                  { value: 'enabled', label: 'Enabled' },
                  { value: 'disabled', label: 'Disabled' },
                ]}
              />
            </FormField>

            <FormField label="Account Status" error={errors.status} required>
              <FormSelect value={form.status} onChange={updateField('status')} options={PRODUCT_STATUSES} />
            </FormField>
          </FormGrid>
        </FormSection>

        <FormSection title="Firm Assignment">
          <FormField
            label="Firm"
            error={errors.firmId}
            hint={
              isSuperAdminUser
                ? 'Super Admin can assign the product to any firm.'
                : 'Firm Admin can only assign to their own firm.'
            }
            required
          >
            <FormSelect
              value={form.firmId}
              onChange={updateField('firmId')}
              options={firmOptions}
              placeholder={isSuperAdminUser ? 'Select firm' : 'Own firm'}
              disabled={Boolean(currentUserFirmId) && !isSuperAdminUser}
            />
          </FormField>
        </FormSection>
      </form>
    </Modal>
  )
}
