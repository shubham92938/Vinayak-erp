import { useState } from 'react'
import { Button, Modal, useToast } from '../components/ui'
import {
  FormField,
  FormGrid,
  FormInput,
  FormSection,
  FormSelect,
  FormTextarea,
} from '../components/forms'
import {
  getFirmId,
  getFirmInitials,
} from '../config/firms'
import {
  isFirmIdAvailable,
  isFirmNameAvailable,
} from '../core/firmStore'
import { getUsers } from '../features/users/services/userService'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^(?:\+91[\s-]?)?[6-9]\d{9}$/
const FIRM_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const GST_PATTERN = /^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z\d]Z[A-Z\d]$/
const PAN_PATTERN = /^[A-Z]{5}\d{4}[A-Z]$/
const PIN_PATTERN = /^\d{6}$/

const BUSINESS_TYPES = [
  'Sole Proprietorship',
  'Partnership',
  'Private Limited',
  'Public Limited',
  'LLP',
  'Trust',
  'Other',
].map((value) => ({ value, label: value }))

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

function getInitialForm(firm) {
  return {
    firmId: getFirmId(firm) ?? '',
    name: firm?.name ?? '',
    businessType: firm?.businessType ?? firm?.entity ?? '',
    contactPerson: firm?.contactPerson ?? '',
    phone: firm?.phone ?? '',
    email: firm?.email ?? '',
    address: firm?.address ?? '',
    city: firm?.city ?? firm?.location ?? '',
    state: firm?.state ?? '',
    pinCode: firm?.pinCode ?? '',
    gstNumber: firm?.gstNumber ?? firm?.gst ?? '',
    panNumber: firm?.panNumber ?? firm?.pan ?? '',
    status: firm?.status ?? 'active',
  }
}

export default function FirmForm({ mode = 'create', firm = null, onClose, onSubmit }) {
  const toast = useToast()
  const isEditing = mode === 'edit'
  const [form, setForm] = useState(() => getInitialForm(firm))
  const [admin, setAdmin] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateFirmField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const updateAdminField = (field) => (event) => {
    setAdmin((current) => ({ ...current, [field]: event.target.value }))
    setErrors((current) => ({ ...current, [`admin${field}`]: undefined }))
  }

  const validate = () => {
    const nextErrors = {}
    const firmId = form.firmId.trim().toLowerCase()
    const name = form.name.trim()
    const email = form.email.trim().toLowerCase()
    const phone = form.phone.trim().replace(/[\s-]/g, '')

    if (!name) nextErrors.name = 'Firm name is required'
    else if (name.length < 2) nextErrors.name = 'Firm name must be at least 2 characters'
    else if (!isFirmNameAvailable(name, firm?.id ?? null)) nextErrors.name = 'This firm name is already in use'

    if (!firmId) nextErrors.firmId = 'Unique Firm ID is required'
    else if (!FIRM_ID_PATTERN.test(firmId)) nextErrors.firmId = 'Use lowercase letters, numbers and hyphens only'
    else if (!isFirmIdAvailable(firmId, firm?.id ?? null)) nextErrors.firmId = 'This Firm ID is already in use'

    if (!form.businessType) nextErrors.businessType = 'Business type is required'
    if (!form.contactPerson.trim()) nextErrors.contactPerson = 'Contact person is required'

    if (!form.phone.trim()) nextErrors.phone = 'Phone number is required'
    else if (!PHONE_PATTERN.test(phone)) nextErrors.phone = 'Enter a valid Indian phone number'

    if (!email) nextErrors.email = 'Email address is required'
    else if (!EMAIL_PATTERN.test(email)) nextErrors.email = 'Enter a valid email address'

    if (!form.address.trim()) nextErrors.address = 'Address is required'
    if (!form.city.trim()) nextErrors.city = 'City is required'
    if (!form.state.trim()) nextErrors.state = 'State is required'
    if (!PIN_PATTERN.test(form.pinCode.trim())) nextErrors.pinCode = 'PIN Code must contain 6 digits'

    if (form.gstNumber.trim() && !GST_PATTERN.test(form.gstNumber.trim().toUpperCase())) {
      nextErrors.gstNumber = 'Enter a valid 15-character GST number'
    }
    if (form.panNumber.trim() && !PAN_PATTERN.test(form.panNumber.trim().toUpperCase())) {
      nextErrors.panNumber = 'Enter a valid 10-character PAN number'
    }
    if (!STATUS_OPTIONS.some((option) => option.value === form.status)) {
      nextErrors.status = 'Choose a firm status'
    }

    if (!isEditing) {
      if (!admin.name.trim()) nextErrors.adminname = 'Admin name is required'
      if (!admin.email.trim()) nextErrors.adminemail = 'Admin login ID / email is required'
      else if (!EMAIL_PATTERN.test(admin.email.trim())) nextErrors.adminemail = 'Enter a valid admin email address'
      else if (getUsers().some((user) => user.email?.toLowerCase() === admin.email.trim().toLowerCase())) nextErrors.adminemail = 'This login ID is already in use'
      if (!admin.password) nextErrors.adminpassword = 'Initial password is required'
      else if (admin.password.length < 6) nextErrors.adminpassword = 'Password must be at least 6 characters'
      if (!admin.confirmPassword) nextErrors.adminconfirmPassword = 'Confirm the initial password'
      else if (admin.password !== admin.confirmPassword) nextErrors.adminconfirmPassword = 'Passwords do not match'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event?.preventDefault?.()
    if (isSubmitting) return
    if (!validate()) {
      toast.error('Please correct the highlighted fields')
      return
    }

    setIsSubmitting(true)
    try {
      const firmData = {
        ...form,
        firmId: form.firmId.trim().toLowerCase(),
        id: form.firmId.trim().toLowerCase(),
        initials: getFirmInitials(form.name),
        name: form.name.trim(),
        businessType: form.businessType,
        contactPerson: form.contactPerson.trim(),
        phone: form.phone.trim(),
        email: form.email.trim().toLowerCase(),
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pinCode: form.pinCode.trim(),
        gstNumber: form.gstNumber.trim().toUpperCase(),
        panNumber: form.panNumber.trim().toUpperCase(),
      }
      await onSubmit(
        firmData,
        isEditing
          ? null
          : {
              name: admin.name.trim(),
              email: admin.email.trim().toLowerCase(),
              password: admin.password,
            },
      )
      toast.success(isEditing ? 'Firm details updated' : 'Firm and initial admin created')
      onClose()
    } catch (error) {
      toast.error(error?.message ?? 'Could not save the firm')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={isEditing ? `Edit ${firm?.name ?? 'firm'}` : 'Create New Firm'}
      description={isEditing ? 'Update the centralized firm record used throughout the ERP.' : 'Create the firm and its initial Firm Admin account in one step.'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} loading={isSubmitting}>
            {isEditing ? 'Save changes' : 'Create firm'}
          </Button>
        </>
      }
    >
      <form className="firm-form" onSubmit={handleSubmit} noValidate>
        <FormSection title="Firm Information" description="These details appear on the firm card and in My Firm.">
          <FormGrid>
            <FormField label="Firm Name" error={errors.name} required>
              <FormInput value={form.name} onChange={updateFirmField('name')} placeholder="Shree Vinayak Agency" />
            </FormField>
            <FormField label="Unique Firm ID" error={errors.firmId} hint={isEditing ? 'Firm IDs identify data ownership and cannot be changed to an existing ID.' : 'Lowercase letters, numbers and hyphens.'} required>
              <FormInput value={form.firmId} onChange={updateFirmField('firmId')} placeholder="shree-vinayak-agency" disabled={isEditing} />
            </FormField>
            <FormField label="Business Type" error={errors.businessType} required>
              <FormSelect value={form.businessType} onChange={updateFirmField('businessType')} options={BUSINESS_TYPES} placeholder="Select business type" />
            </FormField>
            <FormField label="Contact Person" error={errors.contactPerson} required>
              <FormInput value={form.contactPerson} onChange={updateFirmField('contactPerson')} placeholder="Aarav Mehta" />
            </FormField>
            <FormField label="Phone Number" error={errors.phone} required>
              <FormInput type="tel" value={form.phone} onChange={updateFirmField('phone')} placeholder="+91 9876543210" />
            </FormField>
            <FormField label="Email Address" error={errors.email} required>
              <FormInput type="email" value={form.email} onChange={updateFirmField('email')} placeholder="office@firm.in" />
            </FormField>
            <FormField label="Address" error={errors.address} fullWidth required>
              <FormTextarea value={form.address} onChange={updateFirmField('address')} placeholder="Street address, building and area" rows={2} />
            </FormField>
            <FormField label="City" error={errors.city} required>
              <FormInput value={form.city} onChange={updateFirmField('city')} placeholder="Indore" />
            </FormField>
            <FormField label="State" error={errors.state} required>
              <FormInput value={form.state} onChange={updateFirmField('state')} placeholder="Madhya Pradesh" />
            </FormField>
            <FormField label="PIN Code" error={errors.pinCode} required>
              <FormInput inputMode="numeric" value={form.pinCode} onChange={updateFirmField('pinCode')} placeholder="452001" />
            </FormField>
            <FormField label="GST Number" error={errors.gstNumber} optional>
              <FormInput value={form.gstNumber} onChange={updateFirmField('gstNumber')} placeholder="23AABCV1234A1Z5" />
            </FormField>
            <FormField label="PAN Number" error={errors.panNumber} optional>
              <FormInput value={form.panNumber} onChange={updateFirmField('panNumber')} placeholder="AABCV1234A" />
            </FormField>
            <FormField label="Firm Status" error={errors.status} required>
              <FormSelect value={form.status} onChange={updateFirmField('status')} options={STATUS_OPTIONS} />
            </FormField>
          </FormGrid>
        </FormSection>

        {!isEditing && (
          <FormSection title="Initial Firm Admin Account" description="The admin is assigned to this firm automatically. Demo passwords are local mock data only.">
            <FormGrid>
              <FormField label="Admin Name" error={errors.adminname} required>
                <FormInput value={admin.name} onChange={updateAdminField('name')} placeholder="Firm administrator" />
              </FormField>
              <FormField label="Login ID / Email" error={errors.adminemail} required>
                <FormInput type="email" value={admin.email} onChange={updateAdminField('email')} placeholder="admin@firm.in" autoComplete="off" />
              </FormField>
              <FormField label="Initial Password" error={errors.adminpassword} hint="At least 6 characters." required>
                <FormInput type="password" value={admin.password} onChange={updateAdminField('password')} placeholder="Create a demo password" autoComplete="new-password" />
              </FormField>
              <FormField label="Confirm Password" error={errors.adminconfirmPassword} required>
                <FormInput type="password" value={admin.confirmPassword} onChange={updateAdminField('confirmPassword')} placeholder="Repeat the password" autoComplete="new-password" />
              </FormField>
            </FormGrid>
          </FormSection>
        )}
      </form>
    </Modal>
  )
}
