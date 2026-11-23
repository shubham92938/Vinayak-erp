import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import './Button.css'

const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    leadingIcon,
    trailingIcon,
    iconOnly = false,
    loading = false,
    fullWidth = false,
    className = '',
    type = 'button',
    disabled = false,
    ...props
  },
  ref,
) {
  const classes = [
    'ui-button',
    `ui-button--${variant}`,
    `ui-button--${size}`,
    iconOnly && 'ui-button--icon-only',
    fullWidth && 'ui-button--full-width',
    loading && 'ui-button--loading',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && (
        <span className="ui-button__icon" aria-hidden="true">
          <Loader2 className="ui-button__spinner" />
        </span>
      )}

      {!loading && iconOnly && (
        <span className="ui-button__icon" aria-hidden="true">
          {leadingIcon || children}
        </span>
      )}

      {!loading && !iconOnly && leadingIcon && (
        <span className="ui-button__icon" aria-hidden="true">
          {leadingIcon}
        </span>
      )}

      {!iconOnly && children != null && (
        <span className="ui-button__label">{children}</span>
      )}

      {!loading && !iconOnly && trailingIcon && (
        <span className="ui-button__icon" aria-hidden="true">
          {trailingIcon}
        </span>
      )}
    </button>
  )
})

Button.displayName = 'Button'

export default Button
