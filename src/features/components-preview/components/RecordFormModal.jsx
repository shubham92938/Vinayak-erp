import { useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { AlertCircle } from 'lucide-react'
import { Button, Modal } from '../../../components/ui'
import {
  FormActions,
  FormDatePicker,
  FormField,
  FormGrid,
  FormInput,
  FormSection,
  FormSelect,
  FormTextarea,
} from '../../../components/forms'
import { SAMPLE_FIRMS } from '../../../config/firms'
import {
  PREVIEW_CATEGORY_OPTIONS,
  PREVIEW_PARTY_TYPE_OPTIONS,
  PREVIEW_STATUS_OPTIONS,
} from '../data/previewData'
import {
  getRecordFormDefaults,
  recordFormSchema,
} from '../utils/recordSchema'

const FIRM_OPTIONS = SAMPLE_FIRMS.map((firm) => ({
  value: firm.id,
  label: `${firm.name} \u00b7 ${firm.location}`,
}))

export default function RecordFormModal({
  mode = 'add',
  record,
  onClose,
  onSubmit,
}) {
  const [submitError, setSubmitError] = useState(null)
  const submittingRef = useRef(false)
  const isEditing = mode === 'edit' && Boolean(record)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(recordFormSchema),
    defaultValues: getRecordFormDefaults(record),
    mode: 'onTouched',
  })

  const submitForm = async (values) => {
    if (submittingRef.current) return

    submittingRef.current = true
    setSubmitError(null)

    try {
      await onSubmit(values)
    } catch (cause) {
      setSubmitError(
        cause instanceof Error
          ? cause.message
          : 'The demo record could not be saved.',
      )
    } finally {
      submittingRef.current = false
    }
  }

  return (
    <Modal
      open
      onClose={isSubmitting ? undefined : onClose}
      title={isEditing ? `Edit ${record.id}` : 'Add demo record'}
      description={
        isEditing
          ? 'Update the local demo values. Changes are not sent to a server.'
          : 'Create a local demo record. Nothing is persisted outside this page.'
      }
      size="lg"
      showClose={!isSubmitting}
      closeOnOverlayClick={!isSubmitting}
    >
      {/* The ref guard is only read inside the submit event. RHF's
          handleSubmit is not invoked during render. */}
      {/* eslint-disable-next-line react-hooks/refs */}
      <form onSubmit={handleSubmit(submitForm)} noValidate>
        {submitError && (
          <div className="preview-form-error" role="alert">
            <AlertCircle size={15} aria-hidden="true" />
            <span>{submitError}</span>
          </div>
        )}

        <FormSection
          title="Record details"
          description="Fields marked with an asterisk are required."
        >
          <FormGrid>
            <FormField
              label="Party name"
              error={errors.party?.message}
              required
              fullWidth
            >
              <FormInput
                placeholder="e.g. Sunrise Traders"
                autoComplete="off"
                {...register('party')}
              />
            </FormField>

            <FormField
              label="Party type"
              error={errors.partyType?.message}
              required
            >
              <FormSelect
                options={PREVIEW_PARTY_TYPE_OPTIONS}
                placeholder="Select party type"
                {...register('partyType')}
              />
            </FormField>

            <FormField
              label="Record date"
              error={errors.date?.message}
              required
            >
              <FormDatePicker {...register('date')} />
            </FormField>

            <FormField
              label="Firm"
              error={errors.firmId?.message}
              required
            >
              <FormSelect
                options={FIRM_OPTIONS}
                placeholder="Select firm"
                {...register('firmId')}
              />
            </FormField>

            <FormField
              label="Category"
              error={errors.category?.message}
              required
            >
              <FormSelect
                options={PREVIEW_CATEGORY_OPTIONS}
                placeholder="Select category"
                {...register('category')}
              />
            </FormField>

            <FormField
              label="Status"
              error={errors.status?.message}
              required
            >
              <FormSelect
                options={PREVIEW_STATUS_OPTIONS}
                placeholder="Select status"
                {...register('status')}
              />
            </FormField>

            <FormField
              label="Amount (INR)"
              error={errors.amount?.message}
              hint="Stored as a demo value, not posted to any ledger."
              required
            >
              <FormInput
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                placeholder="0.00"
                {...register('amount')}
              />
            </FormField>

            <FormField
              label="Notes"
              error={errors.notes?.message}
              hint="Optional context for this demo record."
              optional
              fullWidth
            >
              <FormTextarea
                rows={3}
                placeholder="Add a short note..."
                {...register('notes')}
              />
            </FormField>
          </FormGrid>
        </FormSection>

        <FormActions>
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isEditing ? 'Save changes' : 'Add record'}
          </Button>
        </FormActions>
      </form>
    </Modal>
  )
}
