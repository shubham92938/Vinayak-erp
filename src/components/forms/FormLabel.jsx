import './forms.css'

function FormLabel({
  children,
  htmlFor,
  required = false,
  optional = false,
  className = '',
}) {
  if (!children) return null

  return (
    <label
      className={['ui-field__label', 'form-label', className]
        .filter(Boolean)
        .join(' ')}
      htmlFor={htmlFor}
    >
      <span>{children}</span>
      {required && (
        <span className="ui-field__required" aria-hidden="true">
          *
        </span>
      )}
      {!required && optional && (
        <span className="form-label__optional">Optional</span>
      )}
    </label>
  )
}

export default FormLabel
