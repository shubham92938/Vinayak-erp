import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, CircleAlert, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../../context/hooks'
import { canAccessRecord, hasModulePermission } from '../../../core/accessControl'
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
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { users, filters, setFilters, toggleUserStatus, deleteUser, createUser, saveUser } = useUsers()
  const canCreateUsers = hasModulePermission(currentUser, 'Users & Permissions', 'create')
  const canEditUsers = hasModulePermission(currentUser, 'Users & Permissions', 'edit')
  const canDeleteUsers = hasModulePermission(currentUser, 'Users & Permissions', 'delete')
  const canExportUsers = hasModulePermission(currentUser, 'Users & Permissions', 'export')
  const canEditUser = (user) =>
    canEditUsers && (currentUser?.role === 'super_admin' || canAccessRecord(currentUser, user, 'Users & Permissions', 'edit'))
  const canDeleteUser = (user) =>
    canDeleteUsers && (currentUser?.role === 'super_admin' || canAccessRecord(currentUser, user, 'Users & Permissions', 'delete'))

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
    if (!canEditUsers || !confirmBulkState) return
    const editableUsers = confirmBulkState.users.filter(canEditUser)
    editableUsers.forEach((user) => toggleUserStatus(user.id))
    if (editableUsers.length > 0) toast.success(`Updated ${editableUsers.length} user(s)`)
    setConfirmBulkState(null)
  }

  const handleStatusChange = (userId, status) => {
    const user = users.find((current) => current.id === userId)
    if (!user || !canEditUser(user)) return
    const updated = saveUser(userId, { ...user, status })
    if (updated) toast.success(status === 'active' ? 'User activated' : 'User deactivated')
  }

  const handleSaveUser = (user) => {
    if (formState?.mode === 'add') {
      if (!canCreateUsers) throw new Error('You do not have permission to create users')
      const created = createUser(user)
      if (!created) throw new Error('Could not create user')
      toast.success('User created')
    } else {
      const existing = users.find((current) => current.id === user.id)
      if (!existing || !canEditUser(existing)) throw new Error('You do not have permission to edit this user')
      const updated = saveUser(user.id, user)
      if (!updated) throw new Error('Could not update user')
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
            <Button variant="secondary" onClick={exportCsv} disabled={!canExportUsers}>Export CSV</Button>
            {canCreateUsers && <Button size="sm" onClick={() => setFormState({ mode: 'add' })}>Add User</Button>}
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
        onRowView={(id) => navigate(`/users/${id}`)}
        onRowEdit={(id) => setFormState({ mode: 'edit', id })}
        onRowChangeRole={(id) => setFormState({ mode: 'changeRole', id })}
        onRowActivate={(id) => {
          const user = users.find((current) => current.id === id)
          if (user?.status === 'inactive' && canEditUser(user)) toggleUserStatus(id)
        }}
        onRowDeactivate={(id) => {
          const user = users.find((current) => current.id === id)
          if (user?.status === 'active' && canEditUser(user)) setConfirmState({ type: 'deactivate', user })
        }}
        onUserDelete={(id) => {
          const user = users.find((current) => current.id === id)
          if (user && canDeleteUser(user)) setConfirmState({ type: 'delete', user })
        }}
        onBulkActivate={() => canEditUsers && setConfirmBulkState({ type: 'activate', users: users.filter((u) => u.status === 'inactive') })}
        onBulkDeactivate={() => canEditUsers && setConfirmBulkState({ type: 'deactivate', users: users.filter((u) => u.status === 'active') })}
        downloadUsers={exportCsv}
        canEdit={canEditUsers}
        canDelete={canDeleteUsers}
        canExport={canExportUsers}
        canEditUser={canEditUser}
        canDeleteUser={canDeleteUser}
      />

      {(formState?.mode === 'add' || formState?.mode === 'edit') && (
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
            <Button variant="primary" disabled={!formState?.id || !canEditUser(users.find((u) => u.id === formState?.id))} onClick={() => {
              const user = users.find((u) => u.id === formState?.id)
              if (user && formState && canEditUser(user)) {
                const updated = saveUser(user.id, { ...user, role: formState.role })
                if (updated) toast.success('Role updated')
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
          if (confirmState?.user && canDeleteUser(confirmState.user)) {
            const deleted = deleteUser(confirmState.user.id)
            if (deleted) toast.success('User deleted')
          }
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
