import './Card.css'

export function Card({
  as: Component = 'div',
  interactive = false,
  className = '',
  children,
  ...props
}) {
  const classes = [
    'ui-card',
    interactive && 'ui-card--interactive',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  )
}

export function CardHeader({
  title,
  description,
  actions,
  className = '',
  children,
  ...props
}) {
  return (
    <div
      className={['ui-card__header', className].filter(Boolean).join(' ')}
      {...props}
    >
      <div className="ui-card__header-text">
        {title && <h3 className="ui-card__title">{title}</h3>}
        {description && <p className="ui-card__description">{description}</p>}
        {children}
      </div>
      {actions && <div className="ui-card__actions">{actions}</div>}
    </div>
  )
}

export function CardBody({ flush = false, className = '', children, ...props }) {
  return (
    <div
      className={[
        'ui-card__body',
        flush && 'ui-card__body--flush',
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

export function CardFooter({ className = '', children, ...props }) {
  return (
    <div
      className={['ui-card__footer', className].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </div>
  )
}
