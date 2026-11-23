import { useId } from 'react'
import { Info, TriangleAlert } from 'lucide-react'
import Button from '../Button/Button'
import Modal from '../Modal/Modal'
import './ConfirmDialog.css'

function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Confirm action',
  description,
  children,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'default',
  loading = false,
  closeOnOverlayClick = true,
  icon,
}) {
  const descriptionId = useId()
  const destructive = tone === 'danger'
  const Icon = icon ?? (destructive ? TriangleAlert : Info)

  const handleConfirm = () => {
    if (loading) return
    onConfirm?.()
  }

  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onClose}
      title={title}
      size="sm"
      role="alertdialog"
      describedBy={description ? descriptionId : undefined}
      showClose={!loading}
      closeOnOverlayClick={closeOnOverlayClick && !loading}
      footer={
        <>
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={loading}
            data-autofocus
          >
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? 'danger' : 'primary'}
            size="sm"
            onClick={handleConfirm}
            loading={loading}
            disabled={loading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="ui-confirm">
        <span
          className={[
            'ui-confirm__icon',
            destructive && 'ui-confirm__icon--danger',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-hidden="true"
        >
          <Icon size={18} />
        </span>

        <div className="ui-confirm__content">
          {description && (
            <p className="ui-confirm__description" id={descriptionId}>
              {description}
            </p>
          )}
          {children}
        </div>
      </div>
    </Modal>
  )
}

export default ConfirmDialog
