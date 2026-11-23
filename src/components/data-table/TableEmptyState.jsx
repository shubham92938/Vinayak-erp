import { Inbox, SearchX, TriangleAlert } from 'lucide-react'

function TableEmptyState({
  variant = 'empty',
  filtered = false,
  title,
  description,
  action,
}) {
  const isError = variant === 'error'
  const Icon = isError ? TriangleAlert : filtered ? SearchX : Inbox
  const resolvedTitle =
    title ??
    (isError
      ? 'Records could not be loaded'
      : filtered
        ? 'No matching records'
        : 'No records yet')
  const resolvedDescription =
    description ??
    (isError
      ? 'Please try again. If the problem continues, refresh the page.'
      : filtered
        ? 'Try a different search or adjust the active filters.'
        : 'Records will appear here once data is available.')

  return (
    <div
      className={[
        'data-table-empty',
        isError && 'data-table-empty--error',
      ]
        .filter(Boolean)
        .join(' ')}
      role={isError ? 'alert' : 'status'}
    >
      <span className="data-table-empty__icon" aria-hidden="true">
        <Icon size={20} />
      </span>
      <div className="data-table-empty__copy">
        <p className="data-table-empty__title">{resolvedTitle}</p>
        <p className="data-table-empty__description">
          {resolvedDescription}
        </p>
      </div>
      {action && <div className="data-table-empty__action">{action}</div>}
    </div>
  )
}

export default TableEmptyState
