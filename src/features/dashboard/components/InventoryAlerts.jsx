import { Link } from 'react-router-dom'
import { ArrowUpRight, Boxes } from 'lucide-react'
import {
  Badge,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
} from '../../../components/ui'
import { INVENTORY_STATUSES } from '../utils/dashboardConfig'
import DashboardEmptyState from './DashboardEmptyState'
import './DashboardPanels.css'

const VISIBLE_ROWS = 6

export default function InventoryAlerts({ inventory, loading = false }) {
  const items = inventory?.items ?? []
  const total = inventory?.total ?? items.length
  const attentionCount = inventory?.attentionCount ?? 0
  const visibleItems = items.slice(0, VISIBLE_ROWS)

  return (
    <Card className="dash-panel-card inventory-panel">
      <CardHeader
        title="Inventory alerts"
        description={`${attentionCount} of ${total} products are at or below minimum stock.`}
        actions={
          <Badge
            variant={attentionCount > 0 ? 'warning' : 'success'}
            size="sm"
            dot
          >
            {attentionCount > 0
              ? `${attentionCount} alerts`
              : 'Healthy stock'}
          </Badge>
        }
      />

      <CardBody flush>
        {visibleItems.length === 0 && !loading ? (
          <div className="dash-panel-empty">
            <DashboardEmptyState
              compact
              icon={Boxes}
              title="No inventory records"
              description="Products matching the selected firm will appear here."
            />
          </div>
        ) : (
          <div
            className="dash-table-scroll"
            role="region"
            aria-label="Inventory alerts table"
            tabIndex={0}
          >
            <table className="dash-table dash-mini-table inventory-table">
              <thead>
                <tr>
                  <th scope="col">Product</th>
                  <th scope="col" className="dash-table__number">
                    On hand
                  </th>
                  <th scope="col" className="dash-table__number">
                    Minimum
                  </th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {visibleItems.map((item) => {
                  const statusMeta = INVENTORY_STATUSES[item.status]

                  return (
                    <tr key={item.id}>
                      <td>
                        <span className="dash-cell-stack">
                          <span className="dash-cell-stack__primary">
                            {item.name}
                          </span>
                          <span className="dash-cell-stack__secondary">
                            {item.code}
                          </span>
                        </span>
                      </td>
                      <td className="dash-table__number tabular-nums">
                        {item.stock} {item.unit}
                      </td>
                      <td className="dash-table__number tabular-nums">
                        {item.minStock} {item.unit}
                      </td>
                      <td>
                        <Badge variant={statusMeta?.variant ?? 'neutral'} size="sm">
                          {statusMeta?.label ?? item.status}
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
        <span className="dash-panel-note">
          Current stock snapshot · not date filtered
        </span>
        <Link
          to="/inventory/stock-in"
          className="dash-panel-link"
          aria-label="View inventory"
        >
          View inventory
          <ArrowUpRight size={14} aria-hidden="true" />
        </Link>
      </CardFooter>
    </Card>
  )
}
