import { useMemo } from 'react'
import { ActionMenu, Button, Select } from '../../../components/ui'
import { DataTable } from '../../../components/data-table'
import { FirmFilter } from '../../../components/filters'
import { USER_ROLES, USER_STATUSES } from '../data/userDemoData'
import { formatUserDate, getFirmLabel } from '../utils/userUtils'
import UserAvatar from './UserAvatar'
import UserStatusBadge from './UserStatusBadge'
import '../styles/users.css'

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  ...USER_STATUSES,
]

const ROLE_OPTIONS = [
  { value: 'all', label: 'All roles' },
  ...USER_ROLES.map((role) => ({ value: role.id, label: role.label })),
]

export default function UserTable({
  users,
  filters,
  onFiltersChange,
  onClearFilters,
  onRowView,
  onRowEdit,
  onRowChangeRole,
  onRowActivate,
  onRowDeactivate,
  onUserDelete,
  onBulkActivate,
  onBulkDeactivate,
  downloadUsers,
  canEdit = true,
  canDelete = true,
  canExport = true,
  canEditUser = () => canEdit,
  canDeleteUser = () => canDelete,
}) {
  const columns = useMemo(
    () => [
      {
        id: 'avatar',
        header: 'Profile',
        width: '88px',
        sortable: false,
        cell: (user) => <UserAvatar user={user} size={32} />,
      },
      {
        id: 'name',
        header: 'Name',
        accessor: (user) => user.name,
        minWidth: '220px',
        cell: (user) => (
          <span className="users-user-name">
            <span className="users-user-name__name">{user.name}</span>
            <span className="users-user-name__email">{user.email}</span>
          </span>
        ),
      },
      {
        id: 'phone',
        header: 'Phone',
        accessor: 'phone',
        width: '140px',
      },
      {
        id: 'firm',
        header: 'Firm',
        accessor: (user) => getFirmLabel(user.firmId),
        width: '180px',
      },
      {
        id: 'role',
        header: 'Role',
        accessor: (user) => user.role,
        width: '130px',
        cell: (user) => <span className="users-role-label">{user.role}</span>,
      },
      {
        id: 'status',
        header: 'Status',
        accessor: 'status',
        width: '110px',
        cell: (user) => <UserStatusBadge user={user} />,
      },
      {
        id: 'createdAt',
        header: 'Created',
        accessor: 'createdAt',
        width: '120px',
        cell: (user) => <span className="users-date">{formatUserDate(user.createdAt)}</span>,
      },
      {
        id: 'lastLogin',
        header: 'Last Login',
        accessor: 'lastLogin',
        width: '120px',
        cell: (user) => <span className="users-date">{formatUserDate(user.lastLogin)}</span>,
      },
      {
        id: 'actions',
        header: 'Actions',
        width: '72px',
        sortable: false,
        cell: (user) => (
          <ActionMenu
            label="User actions"
            triggerLabel={`Actions for ${user.name}`}
            items={[
              { label: 'View details', onSelect: () => onRowView(user.id) },
              { label: 'Edit user', disabled: !canEditUser(user), onSelect: () => onRowEdit(user.id) },
              { label: 'Change role', disabled: !canEditUser(user), onSelect: () => onRowChangeRole(user.id) },
              {
                label: user.status === 'active' ? 'Deactivate user' : 'Activate user',
                disabled: !canEditUser(user),
                onSelect: () =>
                  user.status === 'active'
                    ? onRowDeactivate(user.id)
                    : onRowActivate(user.id),
              },
              { label: 'Delete user', danger: true, disabled: !canDeleteUser(user), onSelect: () => onUserDelete(user.id) },
            ]}
          />
        ),
      },
    ],
    [onRowView, onRowEdit, onRowChangeRole, onRowActivate, onRowDeactivate, onUserDelete, canEditUser, canDeleteUser],
  )

  return (
    <DataTable
      data={users}
      columns={columns}
      getRowId={(user) => user.id}
      search={filters.search}
      onSearchChange={(search) => onFiltersChange({ search })}
      searchPlaceholder="Search name, email or phone..."
      searchLabel="Search users"
      filtersActive={Boolean(filters.search || filters.firmId !== 'all' || filters.role !== 'all' || filters.status !== 'all')}
      onClearFilters={onClearFilters}
      filter={(user) =>
        (filters.firmId === 'all' || user.firmId === filters.firmId) &&
        (filters.role === 'all' || user.role === filters.role) &&
        (filters.status === 'all' || user.status === filters.status)
      }
      selectable
      initialSort={null}
      initialPageSize={10}
      actions={<Button variant="secondary" size="sm" onClick={() => downloadUsers(users)} disabled={!canExport}>Export CSV</Button>}
      toolbarActions={
        <>
          <Button variant="secondary" size="sm" onClick={onBulkActivate} disabled={!canEdit}>Activate Selected</Button>
          <Button variant="secondary" size="sm" onClick={onBulkDeactivate} disabled={!canEdit}>Deactivate Selected</Button>
        </>
      }
      bulkActions={(selectedRows) => {
        const anyActive = selectedRows.some((user) => user.status === 'active')
        const anyInactive = selectedRows.some((user) => user.status === 'inactive')
        return (
          <>
            {anyInactive && (
              <Button variant="secondary" size="sm" onClick={onBulkActivate} disabled={!canEdit}>Activate Selected</Button>
            )}
            {anyActive && (
              <Button variant="secondary" size="sm" onClick={onBulkDeactivate} disabled={!canEdit}>Deactivate Selected</Button>
            )}
          </>
        )
      }}
      filters={
        <div className="users-filters">
          <FirmFilter value={filters.firmId} onChange={(firmId) => onFiltersChange({ firmId })} />
          <Select
            label="Role"
            options={ROLE_OPTIONS}
            value={filters.role}
            onChange={(event) => onFiltersChange({ role: event.target.value })}
            aria-label="Filter by role"
          />
          <Select
            label="Status"
            options={STATUS_OPTIONS}
            value={filters.status}
            onChange={(event) => onFiltersChange({ status: event.target.value })}
            aria-label="Filter by status"
          />
        </div>
      }
    />
  )
}
