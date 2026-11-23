import { useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import useDialogBehavior from '../../../hooks/useDialogBehavior'
import './Drawer.css'

function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  side = 'right',
  showClose = true,
  closeOnOverlayClick = true,
  className = '',
  ariaLabel = 'Panel',
}) {
  const panelRef = useRef(null)
  const titleId = useId()
  const descriptionId = useId()

  useDialogBehavior({ open, onClose, panelRef })

  if (!open) return null

  return createPortal(
    <div
      className={`ui-drawer-backdrop ui-drawer-backdrop--${side}`}
      onMouseDown={(event) => {
        if (closeOnOverlayClick && event.target === event.currentTarget) {
          onClose?.()
        }
      }}
    >
      <aside
        ref={panelRef}
        className={[
          'ui-drawer',
          `ui-drawer--${size}`,
          `ui-drawer--${side}`,
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={!title ? ariaLabel : undefined}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
      >
        <div className="ui-drawer__header">
          <div className="ui-drawer__heading">
            {title && (
              <h2 className="ui-drawer__title" id={titleId}>
                {title}
              </h2>
            )}
            {description && (
              <p className="ui-drawer__description" id={descriptionId}>
                {description}
              </p>
            )}
          </div>

          {showClose && (
            <button
              type="button"
              className="ui-drawer__close"
              onClick={() => onClose?.()}
              aria-label="Close panel"
            >
              <X size={16} aria-hidden="true" />
            </button>
          )}
        </div>

        {children && <div className="ui-drawer__body">{children}</div>}

        {footer && <div className="ui-drawer__footer">{footer}</div>}
      </aside>
    </div>,
    document.body,
  )
}

export default Drawer
