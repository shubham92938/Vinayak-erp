import { Badge } from '../../../components/ui'

const STATUS_VARIANTS = {
  active: 'success',
  inactive: 'danger',
}

export default function UserStatusBadge({ user }) {
  const status = user?.status ?? '—'
  return (
    <Badge variant={STATUS_VARIANTS[status] ?? 'neutral'} size="sm">
      {status[0].toUpperCase() + status.slice(1)}
    </Badge>
  )
}
