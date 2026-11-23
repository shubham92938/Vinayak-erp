import './forms.css'

function FormSection({
  title,
  description,
  actions,
  className = '',
  children,
  ...props
}) {
  return (
    <section
      className={['form-section', className].filter(Boolean).join(' ')}
      {...props}
    >
      {(title || description || actions) && (
        <div className="form-section__header">
          <div className="form-section__heading">
            {title && <h3 className="form-section__title">{title}</h3>}
            {description && (
              <p className="form-section__description">{description}</p>
            )}
          </div>
          {actions && (
            <div className="form-section__actions">{actions}</div>
          )}
        </div>
      )}

      {children}
    </section>
  )
}

export default FormSection
