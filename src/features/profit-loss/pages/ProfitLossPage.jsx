import { Card, CardBody } from '../../../components/ui'
import { formatMoney } from '../../../core/store'
import { getSalesReport } from '../../reports/services/reportService'
import { getExpenses } from '../../expenses/services/expenseService'
import '../styles/profitLoss.css'

export default function ProfitLossPage() {
  const monthlySales = getSalesReport()
  const monthlyExpenses = aggregateExpensesByMonth(getExpenses())
  const months = Array.from(
    new Set([...monthlySales.map((s) => s.month), ...monthlyExpenses.keys()])
  ).sort()

  const totalRevenue = monthlySales.reduce((sum, row) => sum + row.revenue, 0)
  const totalExpenses = Array.from(monthlyExpenses.values()).reduce(
    (sum, value) => sum + value,
    0
  )
  const netProfit = totalRevenue - totalExpenses

  return (
    <div className="profit-loss-page">
      <header className="profit-loss-header">
        <div className="profit-loss-header__text">
          <p className="profit-loss-header__eyebrow">
            <span aria-hidden="true">#</span> Profit &amp; Loss
          </p>
          <h1 className="profit-loss-header__title">Profit &amp; Loss Statement</h1>
          <p className="profit-loss-header__description">
            Revenue, expenses and net profit computed from your sales, purchases and expenses. Demo data.
          </p>
        </div>
      </header>

      <div className="profit-loss-kpi-grid">
        <KpiCard label="Revenue" value={formatMoney(totalRevenue)} />
        <KpiCard label="Total Expenses" value={formatMoney(totalExpenses)} />
        <KpiCard label="Net Profit" value={formatMoney(netProfit)} />
      </div>

      <div className="profit-loss-grid">
        <Card className="profit-loss-card">
          <CardBody>
            <h3 className="profit-loss-title">Monthly Revenue Trend</h3>
            {monthlySales.length === 0 ? (
              <p className="profit-loss-empty">No sales recorded yet.</p>
            ) : (
              <table className="profit-loss-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th className="align-right">Transactions</th>
                    <th className="align-right">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlySales.map((row) => (
                    <tr key={row.month}>
                      <td>{formatMonth(row.month)}</td>
                      <td className="align-right">{row.count}</td>
                      <td className="align-right">{formatMoney(row.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardBody>
        </Card>

        <Card className="profit-loss-card">
          <CardBody>
            <h3 className="profit-loss-title">Monthly Expense Trend</h3>
            {monthlyExpenses.size === 0 ? (
              <p className="profit-loss-empty">No expenses recorded yet.</p>
            ) : (
              <table className="profit-loss-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th className="align-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {months.map((month) => (
                    <tr key={month}>
                      <td>{formatMonth(month)}</td>
                      <td className="align-right">
                        {formatMoney(monthlyExpenses.get(month) ?? 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

function aggregateExpensesByMonth(expenses) {
  const byMonth = new Map()
  expenses.forEach((expense) => {
    const month = String(expense.date ?? '').slice(0, 7)
    if (!month) return
    byMonth.set(month, (byMonth.get(month) ?? 0) + Number(expense.amount || 0))
  })
  return byMonth
}

function formatMonth(month) {
  const [year, mon] = String(month).split('-')
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${names[Number(mon) - 1] ?? 'Unknown'} ${year}`
}

function KpiCard({ label, value }) {
  return (
    <div className="profit-loss-kpi-card">
      <span className="profit-loss-kpi-card__label">{label}</span>
      <span className="profit-loss-kpi-card__value">{value}</span>
    </div>
  )
}
