import { useState } from 'react'
import { Button, Modal, useToast } from '../../../components/ui'
import {
  DATA_SCOPE_PERMISSIONS,
  FIRM_PERMISSIONS,
  PERMISSION_MODULES,
  USER_PERMISSIONS,
  getDefaultAccessPolicy,
} from '../data/rolePermissions'
import { useUsers } from '../hooks/useUsers'
import { useAuth, useFirmContext } from '../../../context/hooks'
import { canAccessRecord, hasModulePermission } from '../../../core/accessControl'
import { togglePermission } from '../utils/permissionUtils'

function displayLabel(value) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export default function UserPermissionMatrix({ user }) {
  const toast = useToast()
  const { currentUser } = useAuth()
  const { saveRolePermissions } = useUsers()
  const { accessibleFirms } = useFirmContext()
  const canEditPermissions = hasModulePermission(currentUser, 'Users & Permissions', 'edit') && (
    currentUser?.role === 'super_admin' || canAccessRecord(currentUser, user, 'Users & Permissions', 'edit')
  )
  const defaults = getDefaultAccessPolicy(user.role)
  const [permissions, setPermissions] = useState(user.permissions ?? defaults.modules)
  const [firmPermissions, setFirmPermissions] = useState(user.firmPermissions ?? defaults.firmPermissions)
  const [dataPermissions, setDataPermissions] = useState(user.dataPermissions ?? defaults.dataPermissions)
  const [firmAccessIds, setFirmAccessIds] = useState(user.firmAccessIds ?? [])
  const [openConfirm, setOpenConfirm] = useState(false)

  const updatePermission = (moduleId, permission, checked) =>
    setPermissions((current) => togglePermission(current, moduleId, permission, checked))

  const updateScopePermission = (moduleId, permission, checked) =>
    setDataPermissions((current) => ({
      ...current,
      [moduleId]: {
        ...(current[moduleId] ?? {}),
        [permission]: Boolean(checked),
      },
    }))

  const isModuleAllChecked = (moduleId) =>
    USER_PERMISSIONS.every((permission) => permissions[moduleId]?.[permission])

  const isScopeAllChecked = (moduleId) =>
    DATA_SCOPE_PERMISSIONS.every((permission) => dataPermissions[moduleId]?.[permission.id])

  const handleSave = () => {
    if (!canEditPermissions) return
    const saved = saveRolePermissions(user.id, permissions, { firmPermissions, dataPermissions, firmAccessIds })
    if (saved) toast.success('Permissions saved')
  }

  const handleResetConfirm = () => {
    if (!canEditPermissions) return
    const reset = getDefaultAccessPolicy(user.role)
    setPermissions(reset.modules)
    setFirmPermissions(reset.firmPermissions)
    setDataPermissions(reset.dataPermissions)
    setFirmAccessIds([])
    toast.success('Permissions reset to role defaults')
    setOpenConfirm(false)
  }

  return (
    <div className="users-permissions">
      <div className="users-permissions__intro">
        <div>
          <h2>Access control</h2>
          <p>Module actions and firm-data scope are independent. Viewing a module does not grant cross-firm editing.</p>
        </div>
        {user.role === 'super_admin' && <span className="users-permissions__admin-note">Super Admin has full access by default</span>}
      </div>

      <section className="users-permissions__section">
        <div className="users-permissions__section-heading">
          <div><h3>Firm information permissions</h3><p>Control which firm records the user can see or manage.</p></div>
        </div>
        <div className="users-firm-permissions">
          {FIRM_PERMISSIONS.map((permission) => (
            <label key={permission.id} className="users-access-checkbox">
              <input
                type="checkbox"
                disabled={!canEditPermissions}
                checked={Boolean(firmPermissions[permission.id])}
                onChange={(event) => setFirmPermissions((current) => ({ ...current, [permission.id]: event.target.checked }))}
              />
              <span>{permission.label}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="users-permissions__section">
        <div className="users-permissions__section-heading">
          <div><h3>Firm access</h3><p>Grant workspace access to additional firms independently from module scope.</p></div>
        </div>
        <div className="users-firm-permissions">
          {accessibleFirms.map((firm) => (
            <label key={firm.id} className="users-access-checkbox">
              <input
                type="checkbox"
                disabled={!canEditPermissions || user.role === 'super_admin' || firm.id === user.firmId}
                checked={user.role === 'super_admin' || firm.id === user.firmId || firmAccessIds.includes(firm.id)}
                onChange={(event) => setFirmAccessIds((current) => event.target.checked ? [...new Set([...current, firm.id])] : current.filter((id) => id !== firm.id))}
              />
              <span>{firm.name}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="users-permissions__section">
        <div className="users-permissions__section-heading">
          <div><h3>Module permissions</h3><p>View, create, edit, delete, export and approve are assigned separately.</p></div>
        </div>
        <div className="users-permission-matrix users-permission-matrix--module">
          {PERMISSION_MODULES.map((module) => (
            <div key={module.id} className="users-permission-row">
              <span className="users-permission-row__label">
                <input
                  type="checkbox"
                  disabled={!canEditPermissions}
                  aria-label={`Select all ${module.id} permissions`}
                  checked={isModuleAllChecked(module.id)}
                  onChange={(event) => {
                    setPermissions((current) => ({
                      ...current,
                      [module.id]: Object.fromEntries(USER_PERMISSIONS.map((permission) => [permission, event.target.checked])),
                    }))
                  }}
                />
                {module.id}
              </span>
              <div className="users-permission-row__permissions">
                {USER_PERMISSIONS.map((permission) => (
                  <label key={permission} className="users-permission-cell">
                    <input type="checkbox" disabled={!canEditPermissions} checked={Boolean(permissions[module.id]?.[permission])} onChange={(event) => updatePermission(module.id, permission, event.target.checked)} />
                    <span>{displayLabel(permission)}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="users-permissions__section">
        <div className="users-permissions__section-heading">
          <div><h3>Cross-firm data scope</h3><p>Use the All Firms columns only when this user should work outside their assigned firm.</p></div>
        </div>
        <div className="users-permission-matrix users-permission-matrix--scope">
          {PERMISSION_MODULES.map((module) => (
            <div key={module.id} className="users-permission-row">
              <span className="users-permission-row__label">
                <input type="checkbox" disabled={!canEditPermissions} aria-label={`Select all ${module.id} data scope permissions`} checked={isScopeAllChecked(module.id)} onChange={(event) => setDataPermissions((current) => ({ ...current, [module.id]: Object.fromEntries(DATA_SCOPE_PERMISSIONS.map((permission) => [permission.id, event.target.checked])) }))} />
                {module.id}
              </span>
              <div className="users-permission-row__permissions">
                {DATA_SCOPE_PERMISSIONS.map((permission) => (
                  <label key={permission.id} className="users-permission-cell users-permission-cell--scope">
                    <input type="checkbox" disabled={!canEditPermissions} checked={Boolean(dataPermissions[module.id]?.[permission.id])} onChange={(event) => updateScopePermission(module.id, permission.id, event.target.checked)} />
                    <span>{permission.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="users-permissions__actions">
        <Button variant="secondary" size="sm" onClick={() => setOpenConfirm(true)} disabled={!canEditPermissions}>Reset</Button>
        <Button variant="primary" size="sm" onClick={handleSave} disabled={!canEditPermissions}>Save Changes</Button>
      </div>

      <Modal
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        title="Reset permissions?"
        description="Reset module, firm and cross-firm permissions for this user back to their role defaults."
        footer={<><Button variant="secondary" onClick={() => setOpenConfirm(false)}>Cancel</Button><Button variant="primary" onClick={handleResetConfirm}>Yes, reset permissions</Button></>}
      />
    </div>
  )
}
