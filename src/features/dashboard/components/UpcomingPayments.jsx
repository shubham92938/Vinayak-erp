import { Link } from 'react-router-dom'
import { ArrowRight, CalendarClock } from 'lucide-react'
import {
  Badge,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
} from '../../../components/ui'
import { formatCurrency } from '../utils/format'
import { formatDateLabel } from '../utils/dateRange'
import DashboardEmptyState from './DashboardEmptyState'
import './DashboardPanels.css'

export default function UpcomingPayments({ payments = [] }) {
  return (
    <Card className="dash-panel-card">
      <CardHeader
        title="Upcoming payments"
        description="Open dues scheduled in the selected period."
        actions={
          <Badge variant="neutral" size="sm">
            {payments.length} due
          </Badge>
        }
      />

      <CardBody flush>
        {payments.length === 0 ? (
          <div className="dash-panel-empty">
            <DashboardEmptyState
              compact
              icon={CalendarClock}
              title="No payments due"
              description="There are no open receivables or payables due in this period."
            />
          </div>
        ) : (
          <div
            className="dash-table-scroll"
            role="region"
            aria-label="Upcoming payments table"
            tabIndex={0}
          >
            <table className="dash-table dash-mini-table payments-table">
              <thead>
                <tr>
                  <th scope="col">Party</th>
                  <th scope="col">Due date</th>
                  <th scope="col" className="dash-table__number">
                    Amount
                  </th>
                  <th scope="col">Type</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={`${payment.id}-${payment.paymentType}`}>
                    <td className="dash-cell-ellipsis">{payment.party}</td>
                    <td>
                      <span className="dash-cell-stack">
                        <span className="dash-cell-stack__primary">
                          <time dateTime={payment.dueDate}>
                            {formatDateLabel(payment.dueDate)}
                          </time>
                        </span>
                        <span
                          className={`dash-cell-stack__secondary ${
                            payment.status === 'overdue'
                              ? 'dash-due--overdue'
                              : ''
                          }`}
                        >
                          {payment.status === 'overdue'
                            ? 'Overdue'
                            : 'Scheduled'}
                        </span>
                      </span>
                    </td>
                    <td className="dash-table__number tabular-nums">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td>
                      <Badge
                        variant={
                          payment.paymentType === 'Receivable'
                            ? 'info'
                            : 'warning'
                        }
                        size="sm"
                      >
                        {payment.paymentType}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardBody>

      <CardFooter className="dash-panel-footer">
        <span className="dash-panel-note">Scheduled by due date</span>
        <Link to="/transactions" className="dash-panel-link">
          View transactions
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </CardFooter>
    </Card>
  )
}
