import { useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import useDialogBehavior from '../../../hooks/useDialogBehavior'
import './Modal.css'

function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  showClose = true,
  closeOnOverlayClick = true,
  className = '',
  ariaLabel = 'Dialog',
  describedBy,
  role = 'dialog',
}) {
  const panelRef = useRef(null)
  const titleId = useId()
  const descriptionId = useId()

  useDialogBehavior({ open, onClose, panelRef })

  if (!open) return null

  return createPortal(
    <div
      className="ui-modal-backdrop"
      onMouseDown={(event) => {
        if (closeOnOverlayClick && event.target === event.currentTarget) {
          onClose?.()
        }
      }}
    >
      <div
        ref={panelRef}
        className={['ui-modal', `ui-modal--${size}`, className]
          .filter(Boolean)
          .join(' ')}
        role={role}
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={!title ? ariaLabel : undefined}
        aria-describedby={
          describedBy || (description ? descriptionId : undefined)
        }
        tabIndex={-1}
      >
        <div className="ui-modal__header">
          <div className="ui-modal__heading">
            {title && (
              <h2 className="ui-modal__title" id={titleId}>
                {title}
              </h2>
            )}
            {description && (
              <p className="ui-modal__description" id={descriptionId}>
                {description}
              </p>
            )}
          </div>

          {showClose && (
            <button
              type="button"
              className="ui-modal__close"
              onClick={() => onClose?.()}
              aria-label="Close dialog"
            >
              <X size={16} aria-hidden="true" />
            </button>
          )}
        </div>

        {children && <div className="ui-modal__body">{children}</div>}

        {footer && <div className="ui-modal__footer">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}

export default Modal
