import { useId, useState } from 'react'
import { X } from 'lucide-react'
import { Button, Modal, useToast } from '../../../components/ui'
import {
  FormActions,
  FormField,
  FormGrid,
  FormInput,
  FormSelect,
  FormTextarea,
} from '../../../components/forms'
import { useFirmContext } from '../../../context/hooks'
import { getCurrentUser, getManageableFirms, isSuperAdmin } from '../../users/utils/userUtils'
import { CATEGORY_STATUSES, validateCategory } from '../services/categoryService'
import { getCategorySlug } from '../services/categoryUtils'
import '../styles/categories.css'

const CODE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9-_]{1,11}$/

function deriveCategoryCode(name) {
  const compact = getCategorySlug(name).replaceAll('-', '').slice(0, 12).toUpperCase()
  return compact.length >= 2 ? compact : 'CAT'
}

export default function CategoryForm({ mode, category, onClose, onSubmit, standalone = false }) {
  const toast = useToast()
  const formId = useId()
  const isCreating = mode === 'add'
  const isEditing = mode === 'edit' && Boolean(category)

  const currentUser = getCurrentUser()
  const { currentFirmId } = useFirmContext()
  const isSuperAdminUser = isSuperAdmin(currentUser)
  const currentUserFirmId = currentUser?.firmId ?? null
  const defaultFirmId = category?.firmId ?? currentFirmId ?? (isSuperAdminUser ? '' : currentUserFirmId ?? '')

  const firmOptions = getManageableFirms(currentUser).map((firm) => ({
    value: firm.id,
    label: `${firm.name} · ${firm.location}`,
  }))

  const [form, setForm] = useState(() => ({
    name: category?.name ?? '',
    code: category?.code ?? '',
    description: category?.description ?? '',
    status: category?.status ?? 'active',
    firmId: defaultFirmId,
  }))
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateField = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }))

  const validate = () => {
    const effectiveCode = form.code.trim() || deriveCategoryCode(form.name)
    const serviceErrors = validateCategory({
      firmId: form.firmId,
      name: form.name,
      code: effectiveCode,
      excludeId: category?.id,
    })

    const nextErrors = { ...serviceErrors }

    if (!form.name.trim()) {
      nextErrors.name = 'Category name is required'
    } else if (form.name.trim().length < 2 || form.name.trim().length > 80) {
      nextErrors.name = 'Category name must be between 2 and 80 characters'
    }

    if (!effectiveCode || !CODE_PATTERN.test(effectiveCode)) {
      nextErrors.code = 'Use letters, digits, hyphens or underscores (2-12 characters)'
    }

    if (!form.firmId) {
      nextErrors.firmId = 'Firm is required'
    } else if (!isSuperAdminUser && form.firmId !== currentUserFirmId) {
      nextErrors.firmId = 'You can only assign categories to your own firm'
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

    const categoryData = {
      id: category?.id,
      name: form.name.trim(),
      code: (form.code.trim() || deriveCategoryCode(form.name)).toUpperCase(),
      description: form.description?.trim() ?? '',
      firmId: form.firmId || null,
      status: form.status,
    }

    try {
      const saved = await onSubmit(categoryData)
      if (saved !== null && saved !== false) {
        onClose()
        toast.success(isCreating ? 'Category created' : 'Category updated')
      }
    } catch {
      toast.error('Could not save category')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (standalone) {
    return (
      <section className="recorded-category-form" aria-labelledby="category-form-title">
        <header className="recorded-category-form__header">
          <h1 id="category-form-title">{isCreating ? 'Create Categories' : 'Edit Categories'}</h1>
          <button type="button" onClick={onClose} aria-label="Close category form" title="Close">
            <X size={16} />
          </button>
        </header>
        <form id={formId} onSubmit={handleSubmit} noValidate>
          <label className="recorded-category-form__field">
            <span>Name <b>*</b></span>
            <input value={form.name} onChange={updateField('name')} placeholder="Enter name" autoFocus />
            {errors.name && <small>{errors.name}</small>}
          </label>
          <label className="recorded-category-form__field recorded-category-form__description-field">
            <textarea
              value={form.description}
              onChange={updateField('description')}
              placeholder="Enter Categories Description"
              aria-label="Category description"
              rows={3}
            />
          </label>
          <div className="recorded-category-form__footer">
            <button type="submit" className="recorded-category-form__submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : isCreating ? 'Create' : 'Update'}
            </button>
          </div>
        </form>
      </section>
    )
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={isEditing ? `Edit ${category.name}` : 'Add category'}
      description="Category names and codes must be unique within the same firm."
      size="lg"
      footer={
        <FormActions>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form={formId} variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : isCreating ? 'Create category' : 'Save changes'}
          </Button>
        </FormActions>
      }
    >
      <form id={formId} className="categories-form" onSubmit={handleSubmit} noValidate>
        {Object.keys(errors).length > 0 && (
          <div className="categories-form-error" role="alert">
            {Object.values(errors)[0]}
          </div>
        )}

        <FormGrid>
          <FormField label="Category Name" error={errors.name} required>
            <FormInput value={form.name} onChange={updateField('name')} placeholder="e.g. Industrial Equipment" />
          </FormField>

          <FormField label="Category Code" error={errors.code} hint="Unique per firm, 2-12 characters." required>
            <FormInput value={form.code} onChange={updateField('code')} placeholder="e.g. INDT" />
          </FormField>

          <FormField label="Description" optional>
            <FormTextarea value={form.description} onChange={updateField('description')} placeholder="What belongs in this category?" />
          </FormField>

          <FormField label="Firm" error={errors.firmId} hint={isSuperAdminUser ? 'Super Admin can assign to any firm.' : 'Firm Admin can only assign to their own firm.'} required>
            <FormSelect
              value={form.firmId}
              onChange={updateField('firmId')}
              options={firmOptions}
              placeholder={isSuperAdminUser ? 'Select firm' : 'Own firm'}
              disabled={Boolean(currentUserFirmId) && !isSuperAdminUser}
            />
          </FormField>

          <FormField label="Status" error={errors.status} required>
            <FormSelect value={form.status} onChange={updateField('status')} options={CATEGORY_STATUSES} />
          </FormField>
        </FormGrid>
      </form>
    </Modal>
  )
}
