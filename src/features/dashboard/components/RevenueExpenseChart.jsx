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
import { formatCompactCurrency } from '../utils/format'
import ChartCard from './ChartCard'
import ChartTooltip from './ChartTooltip'

export default function RevenueExpenseChart({ data, currentLabel = 'period' }) {
  const points = data?.points ?? []
  const isEmpty = points.every(
    (point) => point.revenue === 0 && point.expenses === 0,
  )

  return (
    <ChartCard
      title="Revenue vs expenses"
      description="Compare recognised revenue with operating expenses over time."
      action={
        <Badge variant="neutral" size="sm">
          {data?.granularity === 'month' ? 'Monthly' : 'Daily'}
        </Badge>
      }
      empty={isEmpty}
      emptyTitle="No revenue or expenses"
      emptyDescription="There are no sales or expense entries for the selected filters."
      chartLabel={`Revenue versus expenses for ${currentLabel}`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={points}
          margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
          barGap={3}
          barCategoryGap="26%"
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
            dataKey="revenue"
            name="Revenue"
            fill={CHART_COLORS.revenue}
            radius={[3, 3, 0, 0]}
            maxBarSize={22}
          />
          <Bar
            dataKey="expenses"
            name="Expenses"
            fill={CHART_COLORS.expense}
            radius={[3, 3, 0, 0]}
            maxBarSize={22}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
