import { useState } from 'react'
import { Button, Modal, useToast } from '../../../components/ui'
import { useAuth } from '../../../context/hooks'
import { FormActions, FormField, FormGrid, FormInput, FormSection, FormSelect } from '../../../components/forms'
import { getManageableFirms, isSuperAdmin } from '../utils/userUtils'
import { USER_ROLES, USER_STATUSES } from '../data/userDemoData'
import { getDefaultAccessPolicy } from '../data/rolePermissions'
import { getUsers } from '../services/userService'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^\+?[0-9][0-9\s()-]{7,19}$/

export default function UserForm({ mode, user, onClose, onSubmit }) {
  const toast = useToast()
  const { currentUser } = useAuth()
  const isCreating = mode === 'add'
  const isEditing = mode === 'edit' && Boolean(user)

  const [form, setForm] = useState(() => ({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    firmId: user?.firmId ?? '',
    role: user?.role ?? 'viewer',
    status: user?.status ?? 'active',
  }))
  const [errors, setErrors] = useState({})
  const [imagePreview, setImagePreview] = useState(user?.profileImage ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const firmOptions = getManageableFirms().map((firm) => ({
    value: firm.id,
    label: `${firm.name} · ${firm.location}`,
  }))
  const roleOptions = USER_ROLES
    .filter((role) => currentUser?.role === 'super_admin' || role.id !== 'super_admin')
    .map((role) => ({ value: role.id, label: role.label }))
  const statusOptions = USER_STATUSES

  const updateField = (field) => (event) =>
    setForm((current) => {
      const next = { ...current, [field]: event.target.value }
      if (field === 'role' && event.target.value === 'super_admin') next.firmId = ''
      return next
    })

  const validate = () => {
    const nextErrors = {}

    if (!form.name.trim()) {
      nextErrors.name = 'Name is required'
    }

    if (!form.email.trim()) {
      nextErrors.email = 'Email is required'
    } else if (!EMAIL_PATTERN.test(form.email.trim())) {
      nextErrors.email = 'Enter a valid email address'
    }

    if (getUsers().some((entry) => entry.email?.toLowerCase() === form.email.trim().toLowerCase() && entry.id !== user?.id)) {
      nextErrors.email = 'Email is already in use'
    }

    if (form.phone && !PHONE_PATTERN.test(form.phone)) {
      nextErrors.phone = 'Enter a valid phone number'
    }

    if (form.role !== 'super_admin' && !form.firmId) {
      nextErrors.firmId = 'Firm is required for this role'
    }

    if (!statusOptions.some((option) => option.value === form.status)) {
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

    try {
      const userData = {
        id: user?.id,
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        profileImage: imagePreview,
        firmId: form.firmId || null,
        role: form.role,
        status: form.status,
        permissions: user?.permissions ?? getDefaultAccessPolicy(form.role).modules,
        firmPermissions: user?.firmPermissions ?? getDefaultAccessPolicy(form.role).firmPermissions,
        dataPermissions: user?.dataPermissions ?? getDefaultAccessPolicy(form.role).dataPermissions,
        createdAt: user?.createdAt ?? new Date().toISOString(),
        lastLogin: user?.lastLogin ?? null,
      }
      await onSubmit(userData)
      onClose()
      toast.success(isCreating ? 'User created' : 'User updated')
    } catch {
      toast.error('Could not save user')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={isEditing ? `Edit ${user.name}` : 'Add user'}
      description="User details required to manage access. Email must be unique."
      size="lg"
      footer={
        <FormActions>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : isCreating ? 'Create user' : 'Save changes'}
          </Button>
        </FormActions>
      }
    >
      <form className="users-user-form" onSubmit={handleSubmit} noValidate>
        <FormSection title="User Details" description="Fill in the user profile information.">
          <FormGrid>
            <FormField label="Name" error={errors.name} required>
              <FormInput value={form.name} onChange={updateField('name')} placeholder="Ada Lovelace" />
            </FormField>
            <FormField label="Email" error={errors.email} hint="Unique login identifier." required>
              <FormInput type="email" value={form.email} onChange={updateField('email')} placeholder="user@vinayak.in" autoComplete="off" />
            </FormField>
            <FormField label="Phone" error={errors.phone} hint="Indian phone number with country code.">
              <FormInput type="tel" value={form.phone} onChange={updateField('phone')} placeholder="+91-20-5555-0101" />
            </FormField>
            <FormField label="Firm" error={errors.firmId} hint={isSuperAdmin(form) ? 'Super Admin cannot be assigned to a firm.' : 'Required for all non-Super Admin users.'}>
              <FormSelect
                value={form.firmId}
                onChange={updateField('firmId')}
                options={firmOptions}
                placeholder={isSuperAdmin(form) ? 'Not assigned' : 'Select firm'}
                disabled={isSuperAdmin(form)}
              />
            </FormField>
            <FormField label="Role" error={errors.role} hint="Role determines module access." required>
              <FormSelect value={form.role} onChange={updateField('role')} options={roleOptions} />
            </FormField>
            <FormField label="Status" error={errors.status} hint="Deactivated users cannot log in." required>
              <FormSelect value={form.status} onChange={updateField('status')} options={statusOptions} />
            </FormField>
          </FormGrid>
        </FormSection>

        <FormSection title="Avatar">
          <div className="users-avatar-field">
            {imagePreview ? <img src={imagePreview} alt="" /> : <span className="users-avatar-field__initials">{form.name.slice(0, 2).toUpperCase()}</span>}
            <input
              type="file"
              className="users-avatar-field__input"
              aria-label="Upload avatar"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file && file.size <= 2 * 1024 * 1024) {
                  const reader = new FileReader()
                  reader.onload = () => setImagePreview(reader.result)
                  reader.readAsDataURL(file)
                } else if (file) {
                  toast.error('Avatar must be smaller than 2 MB')
                }
              }}
            />
            {imagePreview && (
              <Button type="button" variant="ghost" size="sm" onClick={() => setImagePreview('')}>Clear</Button>
            )}
          </div>
        </FormSection>
      </form>
    </Modal>
  )
}
