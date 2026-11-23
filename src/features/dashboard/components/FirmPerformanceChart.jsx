import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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

export default function FirmPerformanceChart({
  firms = [],
  currentLabel = 'period',
  className = '',
}) {
  const isEmpty = firms.every(
    (firm) => firm.sales === 0 && firm.previousSales === 0,
  )
  const hasSelectedFirm = firms.some((firm) => firm.selected)

  return (
    <ChartCard
      title="Firm-wise performance"
      description="Current and previous period sales across all firms."
      action={
        <Badge variant="neutral" size="sm">
          All firms
        </Badge>
      }
      empty={isEmpty}
      emptyTitle="No firm sales in this period"
      emptyDescription="Choose a wider date range to compare performance across firms."
      chartLabel={`Firm-wise sales performance for ${currentLabel}`}
      className={className}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={firms}
          margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
          barGap={3}
          barCategoryGap="34%"
        >
          <CartesianGrid
            stroke={CHART_GRID_STROKE}
            strokeDasharray="3 3"
            vertical={false}
          />
          <XAxis
            dataKey="shortName"
            tick={CHART_AXIS_TICK}
            tickLine={false}
            axisLine={false}
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
            cursor={{ fill: 'rgba(241, 245, 249, 0.72)' }}
          />
          <Legend
            iconType="circle"
            iconSize={7}
            wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
          />
          <Bar
            dataKey="sales"
            name="Current period"
            radius={[3, 3, 0, 0]}
            maxBarSize={44}
          >
            {firms.map((firm) => (
              <Cell
                key={firm.firmId}
                fill={
                  hasSelectedFirm && !firm.selected
                    ? CHART_COLORS.mutedBar
                    : CHART_COLORS.primary
                }
              />
            ))}
          </Bar>
          <Bar
            dataKey="previousSales"
            name="Previous period"
            fill={CHART_COLORS.previous}
            radius={[3, 3, 0, 0]}
            maxBarSize={44}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
