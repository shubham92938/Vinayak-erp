import { useState } from 'react'
import { Button, Modal, useToast } from '../../../components/ui'
import {
  FormActions,
  FormField,
  FormGrid,
  FormInput,
  FormSelect,
  FormTextarea,
} from '../../../components/forms'
import { getCurrentUser, getManageableFirms, isSuperAdmin } from '../../users/utils/userUtils'
import { CATEGORY_STATUSES, validateCategory } from '../services/categoryService'
import '../styles/categories.css'

const CODE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9-_]{1,11}$/

export default function CategoryForm({ mode, category, onClose, onSubmit }) {
  const toast = useToast()
  const isCreating = mode === 'add'
  const isEditing = mode === 'edit' && Boolean(category)

  const currentUser = getCurrentUser()
  const isSuperAdminUser = isSuperAdmin(currentUser)
  const currentUserFirmId = currentUser?.firmId ?? null

  const firmOptions = getManageableFirms(currentUser).map((firm) => ({
    value: firm.id,
    label: `${firm.name} · ${firm.location}`,
  }))

  const [form, setForm] = useState(() => ({
    name: category?.name ?? '',
    code: category?.code ?? '',
    description: category?.description ?? '',
    status: category?.status ?? 'active',
    firmId: category?.firmId ?? (isSuperAdminUser ? '' : currentUserFirmId ?? ''),
  }))
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateField = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }))

  const validate = () => {
    const serviceErrors = validateCategory({
      firmId: form.firmId,
      name: form.name,
      code: form.code,
      excludeId: category?.id,
    })

    const nextErrors = { ...serviceErrors }

    if (!form.name.trim()) {
      nextErrors.name = 'Category name is required'
    } else if (form.name.trim().length < 2 || form.name.trim().length > 80) {
      nextErrors.name = 'Category name must be between 2 and 80 characters'
    }

    if (!form.code.trim()) {
      nextErrors.code = 'Category code is required'
    } else if (!CODE_PATTERN.test(form.code.trim())) {
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
      code: form.code.trim().toUpperCase(),
      description: form.description?.trim() ?? '',
      firmId: form.firmId || null,
      status: form.status,
    }

    try {
      await onSubmit(categoryData)
      onClose()
      toast.success(isCreating ? 'Category created' : 'Category updated')
    } catch {
      toast.error('Could not save category')
    } finally {
      setIsSubmitting(false)
    }
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
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : isCreating ? 'Create category' : 'Save changes'}
          </Button>
        </FormActions>
      }
    >
      <form className="categories-form" onSubmit={handleSubmit} noValidate>
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
