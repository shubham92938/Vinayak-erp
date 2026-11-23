import { forwardRef, useId } from 'react'
import { AlertCircle } from 'lucide-react'
import './Input.css'

const Input = forwardRef(function Input(
  {
    label,
    hint,
    error,
    id,
    size = 'md',
    leadingIcon,
    trailingIcon,
    required = false,
    disabled = false,
    className = '',
    containerClassName = '',
    ...props
  },
  ref,
) {
  const generatedId = useId()
  const inputId = id || `ui-input-${generatedId}`
  const messageId = `${inputId}-message`
  const hasMessage = Boolean(error || hint)

  const wrapperClasses = [
    'ui-input',
    `ui-input--${size}`,
    error && 'ui-input--error',
    disabled && 'ui-input--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={['ui-field', containerClassName].filter(Boolean).join(' ')}
    >
      {label && (
        <label className="ui-field__label" htmlFor={inputId}>
          {label}
          {required && (
            <span className="ui-field__required" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <div className={wrapperClasses}>
        {leadingIcon && (
          <span className="ui-input__icon ui-input__icon--leading" aria-hidden="true">
            {leadingIcon}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          className="ui-input__control"
          required={required}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={hasMessage ? messageId : undefined}
          {...props}
        />

        {trailingIcon && (
          <span className="ui-input__icon ui-input__icon--trailing" aria-hidden="true">
            {trailingIcon}
          </span>
        )}
      </div>

      {error ? (
        <p className="ui-field__error" id={messageId}>
          <AlertCircle size={13} aria-hidden="true" />
          <span>{error}</span>
        </p>
      ) : hint ? (
        <p className="ui-field__hint" id={messageId}>
          {hint}
        </p>
      ) : null}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
