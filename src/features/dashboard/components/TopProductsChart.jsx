import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
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
  formatCurrency,
  formatNumber,
} from '../utils/format'
import ChartCard from './ChartCard'
import ChartTooltip from './ChartTooltip'

function truncateProductName(name = '') {
  return name.length > 17 ? `${name.slice(0, 16)}…` : name
}

export default function TopProductsChart({ products = [] }) {
  const isEmpty = products.length === 0

  return (
    <ChartCard
      title="Top-selling products"
      description="Ranked by revenue. Hover a bar for units sold."
      action={
        <Badge variant="neutral" size="sm">
          Top {Math.min(products.length, 6) || 0}
        </Badge>
      }
      empty={isEmpty}
      emptyTitle="No product sales"
      emptyDescription="Product ranking will appear once sales exist for the selected filters."
      chartLabel="Top-selling products by revenue"
      height={258}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={products}
          layout="vertical"
          margin={{ top: 4, right: 54, left: 0, bottom: 0 }}
          barCategoryGap="26%"
        >
          <CartesianGrid
            stroke={CHART_GRID_STROKE}
            strokeDasharray="3 3"
            horizontal={false}
          />
          <XAxis
            type="number"
            tick={CHART_AXIS_TICK}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatCompactCurrency}
            height={24}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={128}
            tick={{ ...CHART_AXIS_TICK, fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={truncateProductName}
          />
          <Tooltip
            cursor={{ fill: 'rgba(241, 245, 249, 0.72)' }}
            content={
              <ChartTooltip
                valueFormatter={(value) => formatCurrency(value)}
                footer={(row) =>
                  `${formatNumber(row.quantity)} units sold · ${
                    row.orderCount
                  } orders`
                }
              />
            }
          />
          <Bar
            dataKey="revenue"
            name="Revenue"
            fill={CHART_COLORS.primary}
            radius={[0, 3, 3, 0]}
            maxBarSize={16}
          >
            <LabelList
              dataKey="revenue"
              position="right"
              formatter={formatCompactCurrency}
              style={{
                fill: '#64748B',
                fontSize: 10,
                fontVariantNumeric: 'tabular-nums',
              }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
