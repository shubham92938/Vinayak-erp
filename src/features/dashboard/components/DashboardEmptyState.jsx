import { Inbox } from 'lucide-react'

export default function DashboardEmptyState({
  icon: Icon = Inbox,
  title = 'Nothing to show',
  description,
  action,
  compact = false,
  className = '',
}) {
  return (
    <div
      className={[
        'dash-empty',
        compact && 'dash-empty--compact',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      role="status"
    >
      <span className="dash-empty__icon" aria-hidden="true">
        <Icon size={compact ? 18 : 22} strokeWidth={1.7} />
      </span>
      <div className="dash-empty__copy">
        <p className="dash-empty__title">{title}</p>
        {description && (
          <p className="dash-empty__description">{description}</p>
        )}
        {action && <div className="dash-empty__action">{action}</div>}
      </div>
    </div>
  )
}
