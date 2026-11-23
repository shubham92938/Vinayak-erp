import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from 'lucide-react'
import { ToastContext } from './ToastContext'
import './Toast.css'

const DEFAULT_DURATION = 4500

const TOAST_ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: TriangleAlert,
  info: Info,
}

function ToastItem({
  id,
  title,
  description,
  variant = 'info',
  duration = DEFAULT_DURATION,
  onDismiss,
}) {
  const Icon = TOAST_ICONS[variant] ?? Info

  useEffect(() => {
    if (!duration || duration <= 0) return undefined

    const timer = window.setTimeout(() => onDismiss(id), duration)

    return () => window.clearTimeout(timer)
  }, [duration, id, onDismiss])

  return (
    <div
      className={`ui-toast ui-toast--${variant}`}
      role={variant === 'error' ? 'alert' : 'status'}
      aria-atomic="true"
    >
      <span className="ui-toast__icon" aria-hidden="true">
        <Icon size={15} />
      </span>

      <div className="ui-toast__content">
        {title && <p className="ui-toast__title">{title}</p>}
        {description && <p className="ui-toast__description">{description}</p>}
      </div>

      <button
        type="button"
        className="ui-toast__close"
        onClick={() => onDismiss(id)}
        aria-label="Dismiss notification"
      >
        <X size={14} aria-hidden="true" />
      </button>
    </div>
  )
}

export function ToastProvider({
  children,
  position = 'bottom-right',
  maxToasts = 4,
}) {
  const [toasts, setToasts] = useState([])
  const counterRef = useRef(0)
  const limit = Math.max(1, Number(maxToasts) || 4)

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const toast = useCallback(
    (options) => {
      const normalized =
        typeof options === 'string' ? { title: options } : options

      if (!normalized?.title && !normalized?.description) return null

      counterRef.current += 1
      const id = `ui-toast-${counterRef.current}`

      setToasts((current) =>
        [
          ...current,
          {
            variant: 'info',
            duration: DEFAULT_DURATION,
            ...normalized,
            id,
          },
        ].slice(-limit),
      )

      return id
    },
    [limit],
  )

  const success = useCallback(
    (title, options = {}) =>
      toast({ ...options, title, variant: 'success' }),
    [toast],
  )

  const error = useCallback(
    (title, options = {}) => toast({ ...options, title, variant: 'error' }),
    [toast],
  )

  const warning = useCallback(
    (title, options = {}) =>
      toast({ ...options, title, variant: 'warning' }),
    [toast],
  )

  const info = useCallback(
    (title, options = {}) => toast({ ...options, title, variant: 'info' }),
    [toast],
  )

  const value = useMemo(
    () => ({ toast, dismiss, success, error, warning, info }),
    [toast, dismiss, success, error, warning, info],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}

      {toasts.length > 0 && (
        <div
          className={`ui-toast-viewport ui-toast-viewport--${position}`}
          aria-label="Notifications"
        >
          {toasts.map((item) => (
            <ToastItem key={item.id} {...item} onDismiss={dismiss} />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  )
}


