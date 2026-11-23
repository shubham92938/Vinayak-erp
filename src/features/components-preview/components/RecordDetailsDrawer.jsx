import { Badge, Button, Drawer } from '../../../components/ui'
import { PREVIEW_STATUS_META } from '../data/previewData'
import {
  formatPreviewCurrency,
  formatPreviewDate,
} from '../utils/format'

export default function RecordDetailsDrawer({
  record,
  onClose,
  onEdit,
}) {
  const status = record ? PREVIEW_STATUS_META[record.status] : null

  return (
    <Drawer
      open={Boolean(record)}
      onClose={onClose}
      title={record?.id ?? 'Demo record'}
      description={
        record
          ? `${record.party} \u00b7 ${record.category}`
          : undefined
      }
      size="md"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button size="sm" onClick={onEdit} disabled={!record}>
            Edit record
          </Button>
        </>
      }
    >
      {record && (
        <>
          <div className="preview-detail-status">
            <span className="preview-detail-status__label">
              Record status
            </span>
            <Badge
              variant={status?.variant ?? 'neutral'}
              size="sm"
            >
              {status?.label ?? record.status}
            </Badge>
          </div>

          <dl className="preview-details">
            <div>
              <dt>Party</dt>
              <dd>{record.party}</dd>
            </div>
            <div>
              <dt>Party type</dt>
              <dd>{record.partyTypeLabel}</dd>
            </div>
            <div>
              <dt>Record date</dt>
              <dd>{formatPreviewDate(record.date)}</dd>
            </div>
            <div>
              <dt>Firm</dt>
              <dd>{record.firmName}</dd>
            </div>
            <div>
              <dt>Category</dt>
              <dd>{record.category}</dd>
            </div>
            <div>
              <dt>Amount</dt>
              <dd>{formatPreviewCurrency(record.amount)}</dd>
            </div>
            <div className="preview-details__full">
              <dt>Notes</dt>
              <dd>{record.notes || 'No notes for this record.'}</dd>
            </div>
          </dl>

          <p className="preview-details__notice">
            This record exists only in the local demo dataset for this
            component preview.
          </p>
        </>
      )}
    </Drawer>
  )
}
