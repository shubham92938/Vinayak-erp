import { useState } from 'react'
import { CheckCircle2, CircleAlert, ShieldCheck } from 'lucide-react'
import { Button, ConfirmDialog, Modal, Select, useToast } from '../../../components/ui'
import UserTable from '../components/UserTable'
import UserForm from '../components/UserForm'
import { useUsers } from '../hooks/useUsers'
import { USER_ROLES } from '../data/userDemoData'
import { USER_CSV_COLUMNS } from '../utils/userUtils'
import { downloadCsv } from '../../../utils/csv'

const USER_ROLES_OPTIONS = USER_ROLES.map((role) => ({
  value: role.id,
  label: role.label,
}))

export default function UsersPage() {
  const toast = useToast()
  const { users, filters, setFilters, toggleUserStatus, deleteUser, createUser, saveUser } = useUsers()

  const [formState, setFormState] = useState(null)
  const [confirmState, setConfirmState] = useState(null)
  const [confirmBulkState, setConfirmBulkState] = useState(null)

  const activeUsers = users.filter((user) => user.status === 'active').length
  const inactiveUsers = users.filter((user) => user.status === 'inactive').length
  const firmAdminCount = users.filter((user) => user.role === 'firm_admin').length
  const userCount = users.length

  const clearFilters = () => setFilters({ search: '', firmId: 'all', role: 'all', status: 'all' })

  const exportCsv = () => {
    downloadCsv({
      filename: 'vinayak-users.csv',
      columns: USER_CSV_COLUMNS,
      rows: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        firmId: user.firmId ?? '—',
        role: user.role,
        status: user.status,
        lastLogin: user.lastLogin ?? '—',
        createdAt: user.createdAt,
      })),
    })
  }

  const confirmBulkAction = () => {
    if (!confirmBulkState) return
    for (const user of confirmBulkState.users) toggleUserStatus(user.id)
    toast.success(`Activated ${confirmBulkState.users.length} user(s)`)
    setConfirmBulkState(null)
  }

  const handleStatusChange = (userId, status) => {
    const user = users.find((current) => current.id === userId)
    if (!user) return
    saveUser(userId, { ...user, status })
    toast.success(status === 'active' ? 'User activated' : 'User deactivated')
  }

  const handleSaveUser = (user) => {
    if (formState?.mode === 'add') {
      createUser(user)
      toast.success('User created')
    } else {
      saveUser(user.id, user)
      toast.success('User updated')
    }
    setFormState(null)
  }

  return (
    <div className="users-page">
      <header className="users-header">
        <div className="users-header__top">
          <div className="users-header__text">
            <p className="users-header__eyebrow"><span aria-hidden="true">#</span> Users Management</p>
            <h1 className="users-header__title">Users</h1>
            <p className="users-header__description">Manage users and their access across the ERP.</p>
          </div>
          <div className="users-header__actions">
            <Button variant="secondary" onClick={exportCsv}>Export CSV</Button>
            <Button size="sm" onClick={() => setFormState({ mode: 'add' })}>Add User</Button>
          </div>
        </div>

        <div className="users-kpi-grid">
          <div className="kpi-card users-kpi-card">
            <div className="kpi-card__top">
              <span className="users-kpi-card__label">Total Users</span>
              <ShieldCheck className="users-kpi-card__icon" />
            </div>
            <span className="users-kpi-card__value">{userCount}</span>
          </div>
          <div className="kpi-card users-kpi-card">
            <div className="kpi-card__top">
              <span className="users-kpi-card__label">Active Users</span>
              <CheckCircle2 className="users-kpi-card__icon" />
            </div>
            <span className="users-kpi-card__value">{activeUsers}</span>
          </div>
          <div className="kpi-card users-kpi-card">
            <div className="kpi-card__top">
              <span className="users-kpi-card__label">Inactive Users</span>
              <CircleAlert className="users-kpi-card__icon" />
            </div>
            <span className="users-kpi-card__value">{inactiveUsers}</span>
          </div>
          <div className="kpi-card users-kpi-card">
            <div className="kpi-card__top">
              <span className="users-kpi-card__label">Firm Admins</span>
              <ShieldCheck className="users-kpi-card__icon" />
            </div>
            <span className="users-kpi-card__value">{firmAdminCount}</span>
          </div>
        </div>
      </header>

      <UserTable
        users={users}
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={clearFilters}
        onRowView={(id) => setFormState({ mode: 'view', id })}
        onRowEdit={(id) => setFormState({ mode: 'edit', id })}
        onRowChangeRole={(id) => setFormState({ mode: 'changeRole', id })}
        onRowActivate={(id) => {
          const user = users.find((current) => current.id === id)
          if (user?.status === 'inactive') toggleUserStatus(id)
        }}
        onRowDeactivate={(id) => {
          const user = users.find((current) => current.id === id)
          if (user?.status === 'active') setConfirmState({ type: 'deactivate', user })
        }}
        onUserDelete={(id) => setConfirmState({ type: 'delete', user: users.find((u) => u.id === id) })}
        onBulkActivate={() => setConfirmBulkState({ type: 'activate', users: users.filter((u) => u.status === 'inactive') })}
        onBulkDeactivate={() => setConfirmBulkState({ type: 'deactivate', users: users.filter((u) => u.status === 'active') })}
        downloadUsers={exportCsv}
      />

      {formState && (
        <UserForm
          key={formState.id ?? formState.mode}
          mode={formState.mode}
          user={formState.id ? users.find((u) => u.id === formState.id) : null}
          onClose={() => setFormState(null)}
          onSubmit={handleSaveUser}
        />
      )}

      <Modal
        open={formState?.mode === 'changeRole'}
        onClose={() => setFormState(null)}
        title="Change Role"
        footer={
          <>
            <Button variant="secondary" onClick={() => setFormState(null)}>Cancel</Button>
            <Button variant="primary" onClick={() => {
              const user = users.find((u) => u.id === formState?.id)
              if (user && formState) {
                saveUser(user.id, { ...user, role: formState.role })
                toast.success('Role updated')
              }
              setFormState(null)
            }}>Save Role</Button>
          </>
        }
      >
        {formState && (
          <Select
            label="New Role"
            options={USER_ROLES_OPTIONS}
            value={formState.role ?? 'viewer'}
            onChange={(event) => setFormState({ ...formState, role: event.target.value })}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={confirmState?.type === 'deactivate'}
        onClose={() => setConfirmState(null)}
        onConfirm={() => {
          if (confirmState?.user) handleStatusChange(confirmState.user.id, 'inactive')
          setConfirmState(null)
        }}
        title="Deactivate user?"
        description={`Deactivating ${confirmState?.user?.name} will restrict their access.`}
        confirmLabel="Deactivate User"
        cancelLabel="Keep Active"
        tone="danger"
      />

      <ConfirmDialog
        open={confirmState?.type === 'delete'}
        onClose={() => setConfirmState(null)}
        onConfirm={() => {
          if (confirmState?.user) deleteUser(confirmState.user.id)
          toast.success('User deleted')
          setConfirmState(null)
        }}
        title="Delete user?"
        description={`${confirmState?.user?.name} will be permanently removed from the user list.`}
        confirmLabel="Delete User"
        cancelLabel="Cancel"
        tone="danger"
      />

      <ConfirmDialog
        open={Boolean(confirmBulkState)}
        onClose={() => setConfirmBulkState(null)}
        onConfirm={confirmBulkAction}
        title={`Activate ${confirmBulkState?.users.length ?? 0} selected user(s)?`}
        description="This will change the status of all selected users."
        confirmLabel="Activate Selected"
        cancelLabel="Cancel"
        tone="success"
      />
    </div>
  )
}
