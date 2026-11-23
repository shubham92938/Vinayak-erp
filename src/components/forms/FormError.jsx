import { AlertCircle } from 'lucide-react'
import './forms.css'

function FormError({ children, id, className = '' }) {
  if (!children) return null

  return (
    <p
      className={['ui-field__error', 'form-error', className]
        .filter(Boolean)
        .join(' ')}
      id={id}
    >
      <AlertCircle size={13} aria-hidden="true" />
      <span>{children}</span>
    </p>
  )
}

export default FormError
