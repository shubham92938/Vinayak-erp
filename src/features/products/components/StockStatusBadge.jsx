import { Badge } from '../../../components/ui'
import { getStockStatus } from '../utils/productUtils'

const VARIANTS = {
  'in-stock': 'success',
  'low-stock': 'warning',
  'out-of-stock': 'danger',
  untracked: 'neutral',
}

export default function StockStatusBadge({ product }) {
  const status = getStockStatus(product)
  return (
    <Badge variant={VARIANTS[status] ?? 'neutral'} size="sm">
      {status
        ? status.replace(/-/g, ' ').toUpperCase()
        : 'Untracked'}
    </Badge>
  )
}
