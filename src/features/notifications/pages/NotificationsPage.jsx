import { useState } from 'react'
import { Button } from '../../../components/ui'
import { useAuth } from '../../../context/hooks'
import { hasModulePermission } from '../../../core/accessControl'
import { DataTable } from '../../../components/data-table'
import { getNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification } from '../../../core/store'
import { downloadCsv } from '../../../utils/csv'
import '../styles/notifications.css'

const COLUMNS = [
  { key: 'createdAt', label: 'Date' },
  { key: 'title', label: 'Title' },
  { key: 'body', label: 'Description' },
  { key: 'type', label: 'Type' },
  { key: 'read', label: 'Status' },
]

const TYPE_FILTERS = ['All', 'Low Stock', 'New Sale', 'Purchase Order', 'Payment Due', 'System', 'Expense Recorded', 'Payment Received']

export default function NotificationsPage() {
  const { currentUser } = useAuth()
  const canEditNotifications = hasModulePermission(currentUser, 'Notifications', 'edit')
  const canDeleteNotifications = hasModulePermission(currentUser, 'Notifications', 'delete')
  const canExportNotifications = hasModulePermission(currentUser, 'Notifications', 'export')
  const [filters, setFilters] = useState({ search: '', type: 'All', status: 'All' })

  const notifications = getNotifications()
    .filter((notification) => {
      if (filters.type !== 'All') {
        const want = filters.type.toLowerCase()
        const have = notification.type.replace(/-/g, ' ').toLowerCase()
        if (!have.includes(want)) return false
      }
      if (filters.status === 'Unread' && notification.read) return false
      if (filters.status === 'Read' && !notification.read) return false
      const query = String(filters.search ?? '').trim().toLowerCase()
      if (query && !`${notification.id} ${notification.title} ${notification.body}`.toLowerCase().includes(query)) return false
      return true
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const unread = getNotifications().filter((notification) => !notification.read).length

  const exportCsv = () => {
    downloadCsv({
      filename: 'vinayak-notifications.csv',
      columns: COLUMNS,
      rows: notifications.map((notification) => ({
        createdAt: notification.createdAt,
        title: notification.title,
        body: notification.body,
        type: notification.type,
        read: notification.read ? 'Read' : 'Unread',
      })),
    })
  }

  const columns = [
    { id: 'createdAt', header: 'Date', accessor: 'createdAt', width: '120px', cell: (row) => <span className="notifications-date">{formatShortDate(row.createdAt)}</span> },
    { id: 'read', header: 'Status', accessor: 'read', width: '90px', cell: (row) => <span className={['notifications-read', !row.read && 'notifications-read--unread'].filter(Boolean).join(' ')}>{row.read ? 'Read' : 'Unread'}</span> },
    { id: 'title', header: 'Title', accessor: 'title', minWidth: '240px', cell: (row) => <span className={['notifications-title', !row.read && 'notifications-title--unread'].filter(Boolean).join(' ')}>{row.title}</span> },
    { id: 'body', header: 'Description', accessor: 'body', minWidth: '240px' },
    { id: 'type', header: 'Type', accessor: 'type', width: '120px', cell: (row) => <span className="notifications-type">{row.type.replace(/-/g, ' ')}</span> },
    {
      id: 'actions',
      header: 'Actions',
      width: '110px',
      sortable: false,
      cell: (row) => (
        <div className="notifications-actions">
          <Button size="sm" variant="ghost" onClick={() => markNotificationRead(row.id)} disabled={!canEditNotifications}>Mark Read</Button>
          <Button size="sm" variant="ghost" onClick={() => deleteNotification(row.id)} disabled={!canDeleteNotifications}>Delete</Button>
        </div>
      ),
    },
  ]

  return (
    <div className="notifications-page">
      <header className="notifications-header">
        <div className="notifications-header__top">
          <div className="notifications-header__text">
            <p className="notifications-header__eyebrow"><span aria-hidden="true">#</span> Notifications</p>
            <h1 className="notifications-header__title">Notifications</h1>
            <p className="notifications-header__description">Recent system activity. {unread} unread.</p>
          </div>
          <div className="notifications-header__actions">
            <Button size="sm" variant="secondary" onClick={() => markAllNotificationsRead()} disabled={!canEditNotifications}>Mark All Read</Button>
            <Button size="sm" variant="secondary" onClick={exportCsv} disabled={!canExportNotifications}>Export CSV</Button>
          </div>
        </div>
        <div className="notifications-kpi-grid">
          <KpiCard label="Total Notifications" value={getNotifications().length} />
          <KpiCard label="Unread" value={unread} />
        </div>
      </header>

      <DataTable
        data={notifications}
        columns={columns}
        getRowId={(row) => row.id}
        search={filters.search}
        onSearchChange={(search) => setFilters((current) => ({ ...current, search }))}
        searchPlaceholder="Search notifications..."
        minWidth={900}
        filtersActive={Boolean(filters.search || filters.type !== 'All' || filters.status !== 'All')}
        filters={
          <div className="notifications-filters">
            <select
              className="notifications-filter-select"
              aria-label="Filter by type"
              value={filters.type}
              onChange={(event) => setFilters((current) => ({ ...current, type: event.target.value }))}
            >
              {TYPE_FILTERS.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
            <select
              className="notifications-filter-select"
              aria-label="Filter by status"
              value={filters.status}
              onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
            >
              <option value="All">All statuses</option>
              <option value="Unread">Unread</option>
              <option value="Read">Read</option>
            </select>
          </div>
        }
        onClearFilters={() => setFilters({ search: '', type: 'All', status: 'All' })}
      />
    </div>
  )
}

function formatShortDate(value) {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '—'
  return parsed.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function KpiCard({ label, value }) {
  return (
    <div className="notifications-kpi-card">
      <span className="notifications-kpi-card__label">{label}</span>
      <span className="notifications-kpi-card__value">{value}</span>
    </div>
  )
}
