import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Card, CardBody, Modal, Select, useToast } from '../../../components/ui'
import { useUsers } from '../hooks/useUsers'
import { useAuth } from '../../../context/hooks'
import { canAccessRecord, hasModulePermission } from '../../../core/accessControl'
import UserActivityTimeline from '../components/UserActivityTimeline'
import UserPermissionMatrix from '../components/UserPermissionMatrix'
import UserProfileCard from '../components/UserProfileCard'
import { getFirmLabel, formatUserDate } from '../utils/userUtils'
import { USER_ROLES } from '../data/userDemoData'

const TABS = ['Overview', 'Permissions', 'Activity']
const ROLE_OPTIONS = USER_ROLES.map((role) => ({ value: role.id, label: role.label }))

export default function UserDetailsPage() {
  const navigate = useNavigate()
  const { userId } = useParams()
  const toast = useToast()
  const { currentUser } = useAuth()
  const { getUserById, saveUser, getActivityForUser, toggleUserStatus } = useUsers()
  const user = getUserById(userId)
  const canEditUsers = hasModulePermission(currentUser, 'Users & Permissions', 'edit') && (
    currentUser?.role === 'super_admin' || canAccessRecord(currentUser, user, 'Users & Permissions', 'edit')
  )
  const [tab, setTab] = useState('Overview')
  const [role, setRole] = useState(() => user?.role ?? 'viewer')
  const [isEditingRole, setIsEditingRole] = useState(false)

  const handleSaveRole = () => {
    if (!user || !canEditUsers) return
    const updated = saveUser(user.id, { ...user, role })
    if (updated) toast.success('Role updated')
    setIsEditingRole(false)
  }

  const handleToggleStatus = () => {
    if (!user || !canEditUsers) return
    const updated = toggleUserStatus(user.id)
    if (updated) toast.success(updated.status === 'active' ? 'User activated' : 'User deactivated')
  }

  return (
    <div className="users-page">
      <header className="users-header">
        <div className="users-details-header">
          <div className="users-header__text">
            <p className="users-header__eyebrow"><span aria-hidden="true">#</span> User Details</p>
            <h1 className="users-details-header__title">{user?.name ?? 'User not found'}</h1>
            <p className="users-details-header__subtitle">
              {user ? `${user.email} · ${getFirmLabel(user.firmId)} · ${user.role}` : 'User details unavailable'}
            </p>
          </div>
          {user ? (
            <div className="users-details-header__actions">
              <Button variant="secondary" onClick={() => navigate('/users')}>Back to Users</Button>
              <Button variant="secondary" onClick={handleToggleStatus} disabled={!canEditUsers}>
                {user.status === 'active' ? 'Deactivate' : 'Activate'}
              </Button>
            </div>
          ) : (
            <Button variant="secondary" onClick={() => navigate('/users')}>Back to Users</Button>
          )}
        </div>

        {user && (
          <div className="users-details-tabs">
            {TABS.map((tabName) => (
              <button
                key={tabName}
                type="button"
                className={['users-tab', tab === tabName && 'users-tab--active'].filter(Boolean).join(' ')}
                onClick={() => setTab(tabName)}
              >
                {tabName}
              </button>
            ))}
          </div>
        )}
      </header>

      {user && (
        <>
          <UserProfileCard user={user} actions={<Button size="sm" onClick={() => setIsEditingRole(true)} disabled={!canEditUsers}>Edit Role</Button>} />

          {tab === 'Overview' && (
            <Card className="users-details-card">
              <CardBody className="users-details-summary">
                <div className="users-details-summary__item">
                  <span className="users-details-summary__label">Firm</span>
                  <span className="users-details-summary__value">{getFirmLabel(user.firmId)}</span>
                </div>
                <div className="users-details-summary__item">
                  <span className="users-details-summary__label">Role</span>
                  <span className="users-details-summary__value">{user.role}</span>
                </div>
                <div className="users-details-summary__item">
                  <span className="users-details-summary__label">Last Login</span>
                  <span className="users-details-summary__value">{formatUserDate(user.lastLogin)}</span>
                </div>
                <div className="users-details-summary__item">
                  <span className="users-details-summary__label">Created</span>
                  <span className="users-details-summary__value">{formatUserDate(user.createdAt)}</span>
                </div>
              </CardBody>
            </Card>
          )}

          {tab === 'Permissions' && <UserPermissionMatrix user={user} />}
          {tab === 'Activity' && <UserActivityTimeline activities={getActivityForUser(user.id)} />}
        </>
      )}

      <Modal
        open={isEditingRole}
        onClose={() => setIsEditingRole(false)}
        title="Edit Role"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsEditingRole(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSaveRole} disabled={!canEditUsers}>Save Role</Button>
          </>
        }
      >
        {user && (
          <Select label="Role" options={ROLE_OPTIONS} value={role} onChange={(event) => setRole(event.target.value)} />
        )}
      </Modal>
    </div>
  )
}
