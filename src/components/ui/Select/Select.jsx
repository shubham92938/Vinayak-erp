import { forwardRef, useId } from 'react'
import { AlertCircle, ChevronDown } from 'lucide-react'
import './Select.css'

const Select = forwardRef(function Select(
  {
    label,
    hint,
    error,
    id,
    size = 'md',
    options = [],
    placeholder = 'Select an option',
    required = false,
    disabled = false,
    className = '',
    containerClassName = '',
    children,
    ...props
  },
  ref,
) {
  const generatedId = useId()
  const selectId = id || `ui-select-${generatedId}`
  const messageId = `${selectId}-message`
  const hasMessage = Boolean(error || hint)
  const isControlled = props.value !== undefined
  const hasDefaultValue = props.defaultValue !== undefined

  const wrapperClasses = [
    'ui-select',
    `ui-select--${size}`,
    error && 'ui-select--error',
    disabled && 'ui-select--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={['ui-field', containerClassName].filter(Boolean).join(' ')}
    >
      {label && (
        <label className="ui-field__label" htmlFor={selectId}>
          {label}
          {required && (
            <span className="ui-field__required" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <div className={wrapperClasses}>
        <select
          ref={ref}
          id={selectId}
          className="ui-select__control"
          required={required}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={hasMessage ? messageId : undefined}
          {...(!isControlled && !hasDefaultValue ? { defaultValue: '' } : {})}
          {...props}
        >
          {placeholder && (
            <option value="" key="select-placeholder" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
          {children}
        </select>
        <ChevronDown
          className="ui-select__chevron"
          size={15}
          aria-hidden="true"
        />
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

Select.displayName = 'Select'

export default Select
