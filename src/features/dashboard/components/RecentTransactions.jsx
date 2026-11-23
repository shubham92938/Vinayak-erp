import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowUpRight,
  Eye,
  Search,
  SearchX,
} from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Input,
  Modal,
  Select,
} from '../../../components/ui'
import {
  PAYMENT_STATUSES,
  PAYMENT_STATUS_OPTIONS,
  TRANSACTION_TYPES,
  TRANSACTION_TYPE_OPTIONS,
} from '../utils/dashboardConfig'
import { formatCurrency } from '../utils/format'
import { formatDateLabel } from '../utils/dateRange'
import DashboardEmptyState from './DashboardEmptyState'
import './RecentTransactions.css'

const VISIBLE_ROWS = 7

const PARTY_TYPE_LABELS = {
  customer: 'Customer',
  supplier: 'Supplier',
  vendor: 'Vendor',
}

export default function RecentTransactions({
  transactions,
  totalCount,
  filters,
  onFilterChange,
  onResetFilters,
  rangeLabel,
}) {
  const navigate = useNavigate()
  const [selected, setSelected] = useState(null)
  const visibleRows = useMemo(
    () => transactions.slice(0, VISIBLE_ROWS),
    [transactions],
  )
  const filtersActive =
    filters.search.trim() !== '' ||
    filters.type !== 'all' ||
    filters.status !== 'all'
  const formatTypeLabel = (type) =>
    TRANSACTION_TYPES[type]?.label ?? type

  const closeDetails = () => setSelected(null)

  return (
    <Card className="txn-card">
      <CardHeader
        title="Recent transactions"
        description={
          rangeLabel
            ? `${totalCount} records in the selected period · ${rangeLabel}`
            : `${totalCount} records in the selected period`
        }
        actions={
          <Button
            variant="secondary"
            size="sm"
            trailingIcon={<ArrowUpRight size={14} />}
            onClick={() => navigate('/transactions')}
          >
            View all
          </Button>
        }
      />

      <div className="txn-toolbar">
        <Input
          type="search"
          size="sm"
          leadingIcon={<Search size={15} />}
          placeholder="Search ID, party, or firm..."
          value={filters.search}
          onChange={(event) =>
            onFilterChange({ search: event.target.value })
          }
          containerClassName="txn-toolbar__search"
          aria-label="Search transactions"
        />
        <Select
          size="sm"
          options={TRANSACTION_TYPE_OPTIONS}
          value={filters.type}
          onChange={(event) =>
            onFilterChange({ type: event.target.value })
          }
          placeholder=""
          containerClassName="txn-toolbar__filter"
          aria-label="Filter by transaction type"
        />
        <Select
          size="sm"
          options={PAYMENT_STATUS_OPTIONS}
          value={filters.status}
          onChange={(event) =>
            onFilterChange({ status: event.target.value })
          }
          placeholder=""
          containerClassName="txn-toolbar__filter"
          aria-label="Filter by payment status"
        />
      </div>

      <CardBody flush>
        <div
          className="dash-table-scroll"
          role="region"
          aria-label="Recent transactions table"
          tabIndex={0}
        >
          <table className="dash-table txn-table">
            <thead>
              <tr>
                <th scope="col">Transaction ID</th>
                <th scope="col">Date</th>
                <th scope="col">Type</th>
                <th scope="col">Customer / Supplier</th>
                <th scope="col">Firm</th>
                <th scope="col" className="dash-table__number">
                  Amount
                </th>
                <th scope="col">Payment status</th>
                <th scope="col" className="dash-table__actions">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {visibleRows.length === 0 ? (
                <tr>
                  <td colSpan="8" className="txn-table__empty-cell">
                    <DashboardEmptyState
                      compact
                      icon={filtersActive ? SearchX : Search}
                      title={
                        filtersActive
                          ? 'No matching transactions'
                          : 'No transactions in this period'
                      }
                      description={
                        filtersActive
                          ? 'Try a different search, or clear the type and status filters.'
                          : 'Adjust the date range or firm filter to see transaction activity.'
                      }
                      action={
                        filtersActive ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={onResetFilters}
                          >
                            Clear table filters
                          </Button>
                        ) : null
                      }
                    />
                  </td>
                </tr>
              ) : (
                visibleRows.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>
                      <span className="txn-id">{transaction.id}</span>
                    </td>
                    <td className="txn-date">
                      <time dateTime={transaction.date}>
                        {formatDateLabel(transaction.date)}
                      </time>
                    </td>
                    <td>
                      <span
                        className={`txn-type txn-type--${transaction.type}`}
                      >
                        {formatTypeLabel(transaction.type)}
                      </span>
                    </td>
                    <td>
                      <span className="txn-party">
                        <span className="txn-party__name">
                          {transaction.party}
                        </span>
                        <span className="txn-party__kind">
                          {PARTY_TYPE_LABELS[transaction.partyType] ??
                            transaction.partyType}
                        </span>
                      </span>
                    </td>
                    <td className="txn-firm">{transaction.firmName}</td>
                    <td className="dash-table__number">
                      <span className="txn-amount">
                        {formatCurrency(transaction.amount)}
                      </span>
                      {transaction.balanceDue > 0 && (
                        <span className="txn-amount__balance">
                          {formatCurrency(transaction.balanceDue)} due
                        </span>
                      )}
                    </td>
                    <td>
                      <Badge
                        variant={
                          PAYMENT_STATUSES[transaction.status]?.variant ??
                          'neutral'
                        }
                        size="sm"
                      >
                        {PAYMENT_STATUSES[transaction.status]?.label ??
                          transaction.status}
                      </Badge>
                    </td>
                    <td className="dash-table__actions">
                      <button
                        type="button"
                        className="txn-action"
                        aria-label={`View details for ${transaction.id}`}
                        title="View details"
                        onClick={() => setSelected(transaction)}
                      >
                        <Eye size={15} aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardBody>

      <CardFooter className="txn-card__footer">
        <span>
          Showing {visibleRows.length} of {transactions.length} filtered
          {transactions.length === 1 ? ' transaction' : ' transactions'}
        </span>
        {transactions.length > VISIBLE_ROWS && (
          <span className="txn-card__export-note">
            Export includes all filtered records
          </span>
        )}
      </CardFooter>

      <Modal
        open={Boolean(selected)}
        onClose={closeDetails}
        title={selected ? `Transaction ${selected.id}` : 'Transaction'}
        description={
          selected
            ? `${formatTypeLabel(selected.type)} · ${formatDateLabel(
                selected.date,
              )}`
            : undefined
        }
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={closeDetails}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                closeDetails()
                navigate('/transactions')
              }}
            >
              Open transactions
            </Button>
          </>
        }
      >
        {selected && (
          <dl className="txn-details">
            <div>
              <dt>Party</dt>
              <dd>{selected.party}</dd>
            </div>
            <div>
              <dt>Firm</dt>
              <dd>{selected.firmName}</dd>
            </div>
            <div>
              <dt>Amount</dt>
              <dd>{formatCurrency(selected.amount)}</dd>
            </div>
            <div>
              <dt>Paid</dt>
              <dd>{formatCurrency(selected.paidAmount)}</dd>
            </div>
            <div>
              <dt>Balance due</dt>
              <dd>{formatCurrency(selected.balanceDue)}</dd>
            </div>
            <div>
              <dt>Payment status</dt>
              <dd>
                <Badge
                  variant={
                    PAYMENT_STATUSES[selected.status]?.variant ?? 'neutral'
                  }
                  size="sm"
                >
                  {PAYMENT_STATUSES[selected.status]?.label ??
                    selected.status}
                </Badge>
              </dd>
            </div>
            <div>
              <dt>Due date</dt>
              <dd>{formatDateLabel(selected.dueDate)}</dd>
            </div>
            <div>
              <dt>Due category</dt>
              <dd>
                {selected.category ??
                  (selected.balanceDue > 0 ? 'Open invoice' : 'Settled')}
              </dd>
            </div>
            {selected.method && (
              <div>
                <dt>Method</dt>
                <dd>{selected.method}</dd>
              </div>
            )}
            {selected.lineCount > 0 && (
              <div>
                <dt>Line items</dt>
                <dd>{selected.lineCount}</dd>
              </div>
            )}
          </dl>
        )}
      </Modal>
    </Card>
  )
}
