import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Package,
  Receipt,
  ShoppingBag,
  ShoppingCart,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import KpiCard from './KpiCard'
import {
  formatCompactCurrency,
  formatNumber,
} from '../utils/format'

const KPI_DEFINITIONS = [
  {
    key: 'totalSales',
    label: 'Total Sales',
    hint: 'Gross invoiced value',
    icon: ShoppingCart,
    formatValue: formatCompactCurrency,
    polarity: 'positive',
  },
  {
    key: 'totalPurchases',
    label: 'Total Purchases',
    hint: 'Supplier invoices',
    icon: ShoppingBag,
    formatValue: formatCompactCurrency,
    polarity: 'neutral',
  },
  {
    key: 'totalRevenue',
    label: 'Total Revenue',
    hint: 'Net of invoice discounts',
    icon: Wallet,
    formatValue: formatCompactCurrency,
    polarity: 'positive',
  },
  {
    key: 'totalExpenses',
    label: 'Total Expenses',
    hint: 'Operating expenses',
    icon: Receipt,
    formatValue: formatCompactCurrency,
    polarity: 'negative',
  },
  {
    key: 'grossProfit',
    label: 'Gross Profit',
    hint: 'Revenue less cost of goods',
    icon: TrendingUp,
    formatValue: formatCompactCurrency,
    polarity: 'positive',
  },
  {
    key: 'netProfit',
    label: 'Net Profit',
    hint: 'After operating expenses',
    icon: TrendingUp,
    formatValue: formatCompactCurrency,
    polarity: 'positive',
  },
  {
    key: 'outstandingReceivables',
    label: 'Outstanding Receivables',
    hint: 'Open customer balances',
    icon: ArrowDownLeft,
    formatValue: formatCompactCurrency,
    polarity: 'negative',
  },
  {
    key: 'outstandingPayables',
    label: 'Outstanding Payables',
    hint: 'Open supplier balances',
    icon: ArrowUpRight,
    formatValue: formatCompactCurrency,
    polarity: 'negative',
  },
  {
    key: 'totalProducts',
    label: 'Total Products',
    hint: 'Active product catalogue',
    icon: Package,
    formatValue: formatNumber,
    polarity: 'neutral',
  },
  {
    key: 'lowStockProducts',
    label: 'Low Stock Products',
    hint: 'At or below minimum level',
    icon: AlertTriangle,
    formatValue: formatNumber,
    polarity: 'negative',
  },
]

export default function KpiGrid({ kpis }) {
  return (
    <section className="kpi-grid" aria-label="Business performance indicators">
      {KPI_DEFINITIONS.map((definition) => {
        const metric = kpis[definition.key] ?? { value: 0, previous: 0 }

        return (
          <KpiCard
            key={definition.key}
            label={definition.label}
            icon={definition.icon}
            formatValue={definition.formatValue}
            hint={definition.hint}
            polarity={definition.polarity}
            value={metric.value}
            previousValue={metric.previous}
          />
        )
      })}
    </section>
  )
}
