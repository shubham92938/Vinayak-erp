import { forwardRef, useId } from 'react'
import { AlertCircle } from 'lucide-react'
import './Textarea.css'

const Textarea = forwardRef(function Textarea(
  {
    label,
    hint,
    error,
    id,
    required = false,
    disabled = false,
    rows = 4,
    className = '',
    containerClassName = '',
    ...props
  },
  ref,
) {
  const generatedId = useId()
  const textareaId = id || `ui-textarea-${generatedId}`
  const messageId = `${textareaId}-message`
  const hasMessage = Boolean(error || hint)

  return (
    <div
      className={['ui-field', containerClassName].filter(Boolean).join(' ')}
    >
      {label && (
        <label className="ui-field__label" htmlFor={textareaId}>
          {label}
          {required && (
            <span className="ui-field__required" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <textarea
        ref={ref}
        id={textareaId}
        className={[
          'ui-textarea',
          error && 'ui-textarea--error',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        rows={rows}
        required={required}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={hasMessage ? messageId : undefined}
        {...props}
      />

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

Textarea.displayName = 'Textarea'

export default Textarea
