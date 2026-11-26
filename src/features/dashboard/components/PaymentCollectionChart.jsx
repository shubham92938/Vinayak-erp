import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Badge } from '../../../components/ui'
import {
  CHART_AXIS_TICK,
  CHART_COLORS,
  CHART_GRID_STROKE,
} from '../utils/dashboardConfig'
import {
  formatCompactCurrency,
  formatPercent,
} from '../utils/format'
import ChartCard from './ChartCard'
import ChartTooltip from './ChartTooltip'

export default function PaymentCollectionChart({
  data,
  currentLabel = 'period',
}) {
  const points = data?.points ?? []
  const totals = data?.totals ?? {
    collected: 0,
    pending: 0,
    rate: 0,
    paymentCount: 0,
  }
  const isEmpty = points.every(
    (point) => point.collected === 0 && point.pending === 0,
  )

  return (
    <ChartCard
      title="Payment collection"
      description="Collected amounts and open balances against invoices raised."
      action={
        <Badge variant="neutral" size="sm">
          {formatPercent(totals.rate)} collected
        </Badge>
      }
      summary={
        <>
          <div className="dash-chart-stat">
            <span className="dash-chart-stat__label">Collected</span>
            <strong className="dash-chart-stat__value tabular-nums">
              {formatCompactCurrency(totals.collected)}
            </strong>
          </div>
          <div className="dash-chart-stat">
            <span className="dash-chart-stat__label">Pending</span>
            <strong className="dash-chart-stat__value tabular-nums">
              {formatCompactCurrency(totals.pending)}
            </strong>
          </div>
          <div className="dash-chart-stat">
            <span className="dash-chart-stat__label">Collection rate</span>
            <strong className="dash-chart-stat__value tabular-nums">
              {formatPercent(totals.rate)}
            </strong>
          </div>
        </>
      }
      empty={isEmpty}
      emptyTitle="No collections in this period"
      emptyDescription="Payments and open invoice balances will appear here when records exist."
      chartLabel={`Payment collection for ${currentLabel}`}
      height={218}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={points}
          margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
          barCategoryGap="28%"
        >
          <CartesianGrid
            stroke={CHART_GRID_STROKE}
            strokeDasharray="3 3"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={CHART_AXIS_TICK}
            tickLine={false}
            axisLine={false}
            minTickGap={26}
            dy={6}
          />
          <YAxis
            tick={CHART_AXIS_TICK}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatCompactCurrency}
            width={66}
          />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ fill: 'var(--chart-hover)' }}
          />
          <Legend
            iconType="circle"
            iconSize={7}
            wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
          />
          <Bar
            dataKey="collected"
            name="Collected"
            stackId="collection"
            fill={CHART_COLORS.collected}
            maxBarSize={28}
          />
          <Bar
            dataKey="pending"
            name="Pending"
            stackId="collection"
            fill={CHART_COLORS.pending}
            radius={[3, 3, 0, 0]}
            maxBarSize={28}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
