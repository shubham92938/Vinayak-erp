import { formatCurrency } from '../utils/format'

export default function ChartTooltip({
  active,
  payload,
  label,
  valueFormatter = formatCurrency,
  footer,
}) {
  if (!active || !payload?.length) return null

  const row = payload[0]?.payload
  const title = row?.fullLabel ?? label

  return (
    <div className="dash-chart-tooltip">
      {title && <p className="dash-chart-tooltip__label">{title}</p>}

      <div className="dash-chart-tooltip__rows">
        {payload.map((entry) => (
          <div
            className="dash-chart-tooltip__row"
            key={`${entry.dataKey}-${entry.name}`}
          >
            <span className="dash-chart-tooltip__name">
              <span
                className="dash-chart-tooltip__swatch"
                style={{ background: entry.color }}
                aria-hidden="true"
              />
              {entry.name}
            </span>
            <span className="dash-chart-tooltip__value">
              {valueFormatter(entry.value, entry, row)}
            </span>
          </div>
        ))}
      </div>

      {footer && row && (
        <p className="dash-chart-tooltip__footer">{footer(row)}</p>
      )}
    </div>
  )
}
