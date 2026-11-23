import { Link } from 'react-router-dom'
import { ArrowRight, ClipboardList } from 'lucide-react'
import {
  Badge,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
} from '../../../components/ui'
import { ORDER_STATUSES } from '../utils/dashboardConfig'
import { formatCurrency } from '../utils/format'
import { formatDateLabel } from '../utils/dateRange'
import DashboardEmptyState from './DashboardEmptyState'
import './DashboardPanels.css'

export default function PendingOrders({ orders = [] }) {
  return (
    <Card className="dash-panel-card">
      <CardHeader
        title="Pending orders"
        description="Open sales orders in the selected period."
        actions={
          <Badge variant="neutral" size="sm">
            {orders.length} open
          </Badge>
        }
      />

      <CardBody flush>
        {orders.length === 0 ? (
          <div className="dash-panel-empty">
            <DashboardEmptyState
              compact
              icon={ClipboardList}
              title="No pending orders"
              description="Open sales orders for the selected period will appear here."
            />
          </div>
        ) : (
          <div
            className="dash-table-scroll"
            role="region"
            aria-label="Pending orders table"
            tabIndex={0}
          >
            <table className="dash-table dash-mini-table orders-table">
              <thead>
                <tr>
                  <th scope="col">Order</th>
                  <th scope="col">Customer</th>
                  <th scope="col">Order date</th>
                  <th scope="col" className="dash-table__number">
                    Amount
                  </th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const statusMeta = ORDER_STATUSES[order.status]

                  return (
                    <tr key={order.id}>
                      <td>
                        <span className="dash-order-number">
                          {order.orderNumber}
                        </span>
                      </td>
                      <td className="dash-cell-ellipsis">
                        {order.customerName}
                      </td>
                      <td>
                        <time dateTime={order.date}>
                          {formatDateLabel(order.date)}
                        </time>
                      </td>
                      <td className="dash-table__number tabular-nums">
                        {formatCurrency(order.amount)}
                      </td>
                      <td>
                        <Badge
                          variant={statusMeta?.variant ?? 'neutral'}
                          size="sm"
                        >
                          {statusMeta?.label ?? order.status}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardBody>

      <CardFooter className="dash-panel-footer">
        <span className="dash-panel-note">Sales order pipeline</span>
        <Link to="/sales-orders" className="dash-panel-link">
          View sales orders
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </CardFooter>
    </Card>
  )
}
