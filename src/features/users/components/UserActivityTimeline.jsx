import { Badge } from '../../../components/ui'
import { formatUserDate } from '../utils/userUtils'

const VARIANTS = {
  'user-created': 'success',
  'user-updated': 'info',
  'role-changed': 'info',
  'permission-changed': 'warning',
  'account-activated': 'success',
  'account-deactivated': 'warning',
  'last-login': 'info',
}

export default function UserActivityTimeline({ activities }) {
  if (!activities?.length) return <p className="users-empty">No activity for this user.</p>

  return (
    <div className="users-activity">
      {activities.map((activity) => (
        <div key={activity.id} className="users-activity__item">
          <Badge variant={VARIANTS[activity.type] ?? 'info'} size="sm" className="users-activity__badge">
            {activity.label}
          </Badge>
          <div className="users-activity__body">
            <p className="users-activity__title">{activity.targetName}</p>
            <p className="users-activity__meta">{activity.actorName} · {formatUserDate(activity.createdAt)}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
