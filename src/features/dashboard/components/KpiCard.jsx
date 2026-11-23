import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { Card } from '../../../components/ui'
import { formatSignedPercent } from '../utils/format'

const TREND_ICONS = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  flat: Minus,
}

export default function KpiCard({
  label,
  value,
  previousValue,
  icon: Icon,
  formatValue,
  hint,
  polarity = 'neutral',
}) {
  const hasPrevious = Number.isFinite(previousValue) && previousValue !== 0
  const delta = hasPrevious
    ? ((value - previousValue) / Math.abs(previousValue)) * 100
    : null
  const direction =
    delta === null || Math.abs(delta) < 0.05
      ? 'flat'
      : delta > 0
        ? 'up'
        : 'down'

  let tone = 'neutral'

  if (delta !== null && direction !== 'flat' && polarity !== 'neutral') {
    const isFavourable =
      (direction === 'up' && polarity === 'positive') ||
      (direction === 'down' && polarity === 'negative')
    tone = isFavourable ? 'success' : 'danger'
  }

  const TrendIcon = TREND_ICONS[direction]
  const trendText =
    delta === null
      ? '—'
      : Math.abs(delta) < 0.05
        ? 'No change'
        : formatSignedPercent(delta)
  const trendAria =
    delta === null
      ? 'No previous period data available'
      : `Change of ${formatSignedPercent(delta)} versus the previous period`

  return (
    <Card as="article" className="kpi-card">
      <div className="kpi-card__top">
        <p className="kpi-card__label">{label}</p>
        <span className="kpi-card__icon" aria-hidden="true">
          <Icon size={16} strokeWidth={1.8} />
        </span>
      </div>

      <p className="kpi-card__value tabular-nums" title={formatValue(value)}>
        {formatValue(value)}
      </p>

      <div className="kpi-card__footer">
        <span
          className={`kpi-card__trend kpi-card__trend--${tone}`}
          aria-label={trendAria}
        >
          <TrendIcon size={13} strokeWidth={2.2} aria-hidden="true" />
          <span>{trendText}</span>
        </span>
        <span className="kpi-card__comparison">
          vs previous
        </span>
      </div>

      <p className="kpi-card__hint">{hint}</p>
    </Card>
  )
}
