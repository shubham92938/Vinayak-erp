import { useId, useState } from 'react'
import { Button, Modal, useToast } from '../../../components/ui'
import { FormActions, FormField, FormGrid, FormInput, FormSelect } from '../../../components/forms'
import { createCustomer, saveCustomer } from '../../../core/store'
import { getCustomers } from '../../../core/store'
import { getFirmLabel } from '../utils/customerUtils'
import { useAuth, useFirmContext } from '../../../context/hooks'
import { canAccessRecord, enforceCreateFirmId } from '../../../core/accessControl'
import { CUSTOMER_TYPES } from '../utils/customerUtils'
import '../styles/customers.css'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^\+?[0-9][0-9\s()+-]{8,}$/
const CODE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9-_ ]{2,14}$/

const initialForm = (customer) => ({
  name: customer?.name ?? '',
  code: customer?.code ?? '',
  customerType: customer?.customerType ?? 'Regular Customer',
  contactPerson: customer?.contactPerson ?? '',
  phone: customer?.phone ?? '',
  alternatePhone: customer?.alternatePhone ?? '',
  email: customer?.email ?? '',
  gst: customer?.gst ?? '',
  pan: customer?.pan ?? '',
  billingAddress: customer?.address ?? '',
  shippingAddress: customer?.shippingAddress ?? '',
  city: customer?.city ?? '',
  state: customer?.state ?? '',
  pinCode: customer?.pinCode ?? '',
  creditLimit: customer?.creditLimit ?? 0,
  openingBalance: customer?.openingBalance ?? 0,
  paymentTerms: customer?.paymentTerms ?? '30 Days',
  status: customer?.status ?? 'Active',
})

export default function CustomerForm({ customer, onClose, onSave }) {
  const toast = useToast()
  const formId = useId()
  const { currentUser } = useAuth()
  const { currentFirmId } = useFirmContext()
  const isEditing = Boolean(customer && customer.id)
  const [form, setForm] = useState(() => initialForm(customer))
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateField = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }))

  const validate = () => {
    const nextErrors = {}
    if (!form.name.trim()) nextErrors.name = 'Customer name is required'
    else if (form.name.trim().length > 80) nextErrors.name = 'Name must be 80 characters or less'

    if (!form.code.trim()) nextErrors.code = 'Customer code is required'
    else if (!CODE_PATTERN.test(form.code)) nextErrors.code = 'Use letters, digits, spaces and hyphens'

    const customers = getCustomers()
    const duplicate = customers.some(
      (entry) => entry.code?.toLowerCase() === form.code.trim().toLowerCase() && entry.id !== customer?.id,
    )
    if (duplicate) nextErrors.code = 'This customer code is already registered'

    if (form.phone && !PHONE_PATTERN.test(form.phone)) nextErrors.phone = 'Enter a valid phone number'
    if (form.alternatePhone && !PHONE_PATTERN.test(form.alternatePhone)) nextErrors.alternatePhone = 'Enter a valid phone number'
    if (!form.email.trim()) {
      // Email is optional for dealers
    } else if (!EMAIL_PATTERN.test(form.email)) {
      nextErrors.email = 'Enter a valid email address'
    }

    if (form.openingBalance !== '' && Number(form.openingBalance) < 0) nextErrors.openingBalance = 'Opening balance cannot be negative'
    if (form.creditLimit !== '' && Number(form.creditLimit) < 0) nextErrors.creditLimit = 'Credit limit cannot be negative'

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

    const customerData = {
      code: form.code.trim().toUpperCase(),
      name: form.name.trim(),
      customerType: form.customerType,
      type: form.customerType,
      contactPerson: form.contactPerson.trim(),
      phone: form.phone.trim(),
      alternatePhone: form.alternatePhone.trim(),
      email: form.email.trim().toLowerCase(),
      gst: form.gst.trim().toUpperCase(),
      pan: form.pan.trim().toUpperCase(),
      address: form.billingAddress.trim(),
      billingAddress: form.billingAddress.trim(),
      shippingAddress: form.shippingAddress.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      pinCode: form.pinCode.trim(),
      creditLimit: Number(form.creditLimit || 0),
      openingBalance: Number(form.openingBalance || 0),
      paymentTerms: form.paymentTerms,
      status: form.status,
      firmId: customer?.firmId ?? currentFirmId ?? currentUser?.firmId ?? undefined,
    }

    try {
      const firmId = isEditing
        ? customer?.firmId
        : enforceCreateFirmId(currentUser, customerData.firmId, 'Customers')
      if (!firmId || !canAccessRecord(currentUser, { firmId }, 'Customers', isEditing ? 'edit' : 'create')) {
        throw new Error('You do not have permission to save this customer')
      }

      const saved = isEditing
        ? saveCustomer(customer.id, { ...customerData, firmId })
        : createCustomer({ ...customerData, firmId })
      if (!saved) throw new Error('Could not save customer')
      onSave(saved)
      onClose()
      toast.success(isEditing ? 'Customer updated' : 'Customer created')
    } catch {
      toast.error('Could not save customer')
    } finally {
      setIsSubmitting(false)
    }
  }

  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
  ]

  return (
    <Modal
      open
      onClose={onClose}
      title={isEditing ? `Edit ${customer.name}` : 'Add customer'}
      description="Customer code must be unique. Phone numbers are validated."
      size="lg"
      footer={
        <FormActions>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" form={formId} variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : isEditing ? 'Save customer' : 'Create customer'}
          </Button>
        </FormActions>
      }
    >
      <form id={formId} className="customers-form" onSubmit={handleSubmit} noValidate>
        {Object.keys(errors).length > 0 && (
          <div className="customers-form-error" role="alert">{Object.values(errors)[0]}</div>
        )}

        <FormGrid>
          <FormField label="Customer Name" error={errors.name} required>
            {/* placeholder */}
            {null}
            <FormInput value={form.name} onChange={updateField('name')} placeholder="e.g. Globe Cart Papers & Stationery" />
          </FormField>
          <FormField label="Customer Code" error={errors.code} required hint="Unique identifier (unique per firm)">
            <FormInput value={form.code} onChange={updateField('code')} placeholder="e.g. VAA-01" />
          </FormField>
          <FormField label="Customer Type" error={errors.customerType} hint="Dealers buy in bulk quantities." required>
            <FormSelect value={form.customerType} onChange={updateField('customerType')} options={CUSTOMER_TYPES} />
          </FormField>
          <FormField label="Contact Person" error={errors.contactPerson}>
            <FormInput value={form.contactPerson} onChange={updateField('contactPerson')} placeholder="Priya Desai" />
          </FormField>
          <FormField label="Phone" error={errors.phone} hint="Example: +91-20-5555-1001">
            <FormInput type="tel" value={form.phone} onChange={updateField('phone')} placeholder="+91-20-5555-1001" />
          </FormField>
          <FormField label="Alternate Phone" error={errors.alternatePhone}>
            <FormInput type="tel" value={form.alternatePhone} onChange={updateField('alternatePhone')} placeholder="+91-20-5555-7003" />
          </FormField>
          <FormField label="Email" error={errors.email} hint="Used for invoices and reminders.">
            <FormInput type="email" value={form.email} onChange={updateField('email')} placeholder="amit.patel@hscotter.com" />
          </FormField>
        </FormGrid>

        <FormGrid>
          <FormField label="GST Number" hint="State code + PAN signature">
            <FormInput value={form.gst} onChange={updateField('gst')} placeholder="27AABCC1443L1" />
          </FormField>
          <FormField label="PAN Number" hint="For financial records">
            <FormInput value={form.pan} onChange={updateField('pan')} placeholder="ABCTZ0C87" />
          </FormField>
          <FormField label="Credit Limit" hint="Maximum outstanding balance">
            <FormInput type="number" min="0" value={form.creditLimit} onChange={updateField('creditLimit')} placeholder="0" />
          </FormField>
          <FormField label="Opening Balance" hint="Opening receivable / credit balance">
            <FormInput type="number" min="0" value={form.openingBalance} onChange={updateField('openingBalance')} placeholder="0" />
          </FormField>
          <FormField label="Payment Terms" hint="How quickly payments are expected">
            <FormInput value={form.paymentTerms} onChange={updateField('paymentTerms')} placeholder="30 Days" />
          </FormField>
          <FormField label="Status" error={errors.status} required>
            <FormSelect value={form.status} onChange={updateField('status')} options={statusOptions} />
          </FormField>
        </FormGrid>

        <FormGrid columns={1}>
          <FormField label="Billing Address" hint="Mailing address for documents">
            <FormInput value={form.billingAddress} onChange={updateField('billingAddress')} placeholder="104, Centrally Located Building" />
          </FormField>
          <FormField label="Shipping Address" hint="Goods receive address">
            <FormInput value={form.shippingAddress} onChange={updateField('shippingAddress')} placeholder="9th Floor, WhatsApp Building" />
          </FormField>
        </FormGrid>

        <FormGrid>
          <FormField label="City" error={errors.city}>
            <FormInput value={form.city} onChange={updateField('city')} placeholder="Mumbai" />
          </FormField>
          <FormField label="State" hint="State of the customer">
            <FormInput value={form.state} onChange={updateField('state')} placeholder="Maharashtra" />
          </FormField>
          <FormField label="PIN Code" error={errors.pinCode}>
            <FormInput type="tel" value={form.pinCode} onChange={updateField('pinCode')} placeholder="400002" />
          </FormField>
          <FormField label="Firm" hint="Company this customer belongs to">
            <FormInput value={getFirmLabel(customer?.firmId)} readOnly placeholder="Assigned firm" />
          </FormField>
        </FormGrid>
      </form>
    </Modal>
  )
}
