import { Badge } from '../../../components/ui'

const STATUS_VARIANTS = {
  active: 'success',
  inactive: 'neutral',
}

export default function ProductStatusBadge({ product }) {
  const status = product?.status ?? 'active'
  return (
    <Badge variant={STATUS_VARIANTS[status] ?? 'neutral'} size="sm">
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : '—'}
    </Badge>
  )
}
