import './forms.css'

function FormActions({
  children,
  align = 'end',
  bordered = true,
  className = '',
  ...props
}) {
  return (
    <div
      className={[
        'form-actions',
        `form-actions--${align}`,
        bordered && 'form-actions--bordered',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </div>
  )
}

export default FormActions
