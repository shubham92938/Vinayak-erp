import { Card, CardBody, CardHeader } from '../../../components/ui'
import DashboardEmptyState from './DashboardEmptyState'
import './DashboardCharts.css'

export default function ChartCard({
  title,
  description,
  action,
  summary,
  children,
  empty = false,
  emptyTitle = 'No chart data',
  emptyDescription = 'There are no records for the selected filters.',
  chartLabel,
  height = 258,
  className = '',
}) {
  return (
    <Card className={['dash-chart-card', className].filter(Boolean).join(' ')}>
      <CardHeader
        title={title}
        description={description}
        actions={action}
      />

      <CardBody className="dash-chart-card__body">
        {summary && <div className="dash-chart-stats">{summary}</div>}

        {empty ? (
          <DashboardEmptyState
            compact
            title={emptyTitle}
            description={emptyDescription}
            className="dash-chart-card__empty"
          />
        ) : (
          <div
            className="dash-chart-frame"
            role="img"
            aria-label={chartLabel ?? `${title} chart`}
          >
            <div
              className="dash-chart-frame__canvas"
              style={{ height: `${height}px` }}
            >
              {children}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  )
}
