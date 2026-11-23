import { Link } from 'react-router-dom'
import { ArrowRight, Users } from 'lucide-react'
import {
  Badge,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
} from '../../../components/ui'
import {
  formatCurrency,
  formatInitials,
} from '../utils/format'
import DashboardEmptyState from './DashboardEmptyState'
import './DashboardPanels.css'

export default function TopCustomers({ customers = [] }) {
  return (
    <Card className="dash-panel-card">
      <CardHeader
        title="Top customers"
        description="By sales value in the selected period."
        actions={
          <Badge variant="neutral" size="sm">
            Top {customers.length || 5}
          </Badge>
        }
      />

      <CardBody flush>
        {customers.length === 0 ? (
          <div className="dash-panel-empty">
            <DashboardEmptyState
              compact
              icon={Users}
              title="No customer sales"
              description="Customer rankings will appear when sales exist for the selected filters."
            />
          </div>
        ) : (
          <div
            className="dash-table-scroll"
            role="region"
            aria-label="Top customers table"
            tabIndex={0}
          >
            <table className="dash-table dash-mini-table customers-table">
              <thead>
                <tr>
                  <th scope="col">Customer</th>
                  <th scope="col" className="dash-table__number">
                    Purchases
                  </th>
                  <th scope="col" className="dash-table__number">
                    Outstanding
                  </th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <span className="dash-party">
                        <span className="dash-avatar" aria-hidden="true">
                          {formatInitials(customer.name)}
                        </span>
                        <span className="dash-cell-stack">
                          <span className="dash-cell-stack__primary">
                            {customer.name}
                          </span>
                          <span className="dash-cell-stack__secondary">
                            {customer.invoiceCount}{' '}
                            {customer.invoiceCount === 1
                              ? 'invoice'
                              : 'invoices'}
                          </span>
                        </span>
                      </span>
                    </td>
                    <td className="dash-table__number tabular-nums">
                      {formatCurrency(customer.totalPurchases)}
                    </td>
                    <td
                      className={`dash-table__number tabular-nums ${
                        customer.outstanding > 0
                          ? 'dash-table__number--warning'
                          : ''
                      }`}
                    >
                      {formatCurrency(customer.outstanding)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardBody>

      <CardFooter className="dash-panel-footer">
        <span className="dash-panel-note">Ranked by invoiced sales</span>
        <Link to="/customers" className="dash-panel-link">
          View customers
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </CardFooter>
    </Card>
  )
}
