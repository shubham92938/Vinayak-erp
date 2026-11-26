import {
  Area,
  AreaChart,
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
import { formatCompactCurrency } from '../utils/format'
import ChartCard from './ChartCard'
import ChartTooltip from './ChartTooltip'

export default function SalesOverviewChart({
  data,
  currentLabel = 'Last 30 days',
}) {
  const points = data?.points ?? []
  const isEmpty = points.every(
    (point) => point.current === 0 && point.previous === 0,
  )

  return (
    <ChartCard
      title="Sales overview"
      description="Net sales for the selected period against the previous period."
      action={
        <Badge variant="neutral" size="sm">
          {data?.granularity === 'month' ? 'Monthly' : 'Daily'}
        </Badge>
      }
      empty={isEmpty}
      emptyTitle="No sales in this period"
      emptyDescription="Adjust the date range or firm filter to see sales performance."
      chartLabel={`Sales overview for ${currentLabel}`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={points}
          margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
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
            cursor={{ stroke: 'var(--chart-grid)', strokeDasharray: '4 4' }}
          />
          <Legend
            iconType="circle"
            iconSize={7}
            wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
          />
          <Area
            type="monotone"
            dataKey="previous"
            name="Previous period"
            stroke={CHART_COLORS.previous}
            strokeWidth={1.5}
            strokeDasharray="4 4"
            fill="transparent"
            dot={false}
            activeDot={false}
          />
          <Area
            type="monotone"
            dataKey="current"
            name="Current period"
            stroke={CHART_COLORS.primary}
            strokeWidth={2}
            fill={CHART_COLORS.primary}
            fillOpacity={0.1}
            dot={false}
            activeDot={{ r: 3, strokeWidth: 1 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
