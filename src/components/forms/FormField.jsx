import { useId, useMemo } from 'react'
import FormError from './FormError'
import FormLabel from './FormLabel'
import { FormFieldContext } from './FormFieldContext'
import './forms.css'

function getErrorMessage(error) {
  if (!error) return ''
  if (typeof error === 'string') return error
  if (Array.isArray(error)) return getErrorMessage(error[0])
  if (typeof error === 'object' && error.message) {
    return String(error.message)
  }
  return ''
}

function FormField({
  id,
  label,
  hint,
  error,
  required = false,
  optional = false,
  hideLabel = false,
  fullWidth = false,
  className = '',
  children,
}) {
  const generatedId = useId()
  const fieldId = id || `form-field-${generatedId}`
  const message = getErrorMessage(error)
  const errorId = `${fieldId}-error`
  const hintId = `${fieldId}-hint`
  const describedBy = message ? errorId : hint ? hintId : undefined

  const contextValue = useMemo(
    () => ({
      id: fieldId,
      label,
      invalid: Boolean(message),
      required,
      describedBy,
    }),
    [fieldId, label, message, required, describedBy],
  )

  return (
    <div
      className={[
        'form-field',
        fullWidth && 'form-field--full',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {label && (
        <FormLabel
          htmlFor={fieldId}
          required={required}
          optional={optional}
          className={hideLabel ? 'visually-hidden' : ''}
        >
          {label}
        </FormLabel>
      )}

      <FormFieldContext.Provider value={contextValue}>
        {children}
      </FormFieldContext.Provider>

      {message ? (
        <FormError id={errorId}>{message}</FormError>
      ) : hint ? (
        <p className="ui-field__hint" id={hintId}>
          {hint}
        </p>
      ) : null}
    </div>
  )
}

export default FormField
