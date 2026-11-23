import { useState } from 'react'
import { Button, Modal, useToast } from '../../../components/ui'
import { PERMISSION_MODULES, USER_PERMISSIONS, getDefaultPermissions } from '../data/rolePermissions'
import { useUsers } from '../hooks/useUsers'
import { togglePermission } from '../utils/permissionUtils'

export default function UserPermissionMatrix({ user }) {
  const toast = useToast()
  const { saveRolePermissions } = useUsers()
  const [permissions, setPermissions] = useState(user.permissions ?? getDefaultPermissions(user.role))
  const [openConfirm, setOpenConfirm] = useState(false)

  const updatePermission = (moduleId, permission, checked) =>
    setPermissions((current) => togglePermission(current, moduleId, permission, checked))

  const isModuleAllChecked = (moduleId) =>
    USER_PERMISSIONS.every((permission) => permissions[moduleId]?.[permission])

  const handleSave = () => {
    saveRolePermissions(user.id, permissions)
    toast.success('Permissions saved')
  }

  const handleResetConfirm = () => {
    setPermissions(getDefaultPermissions(user.role))
    toast.success('Permissions reset to role defaults')
    setOpenConfirm(false)
  }

  return (
    <div className="users-permissions">
      <div className="users-permissions__actions">
        <Button variant="secondary" size="sm" onClick={() => setOpenConfirm(true)}>Reset</Button>
        <Button variant="primary" size="sm" onClick={handleSave}>Save Changes</Button>
      </div>

      <div className="users-permission-matrix">
        {PERMISSION_MODULES.map((module) => (
          <div key={module.id} className="users-permission-row">
            <span className="users-permission-row__label">
              <input
                type="checkbox"
                aria-label={`Select all ${module.id} permissions`}
                checked={isModuleAllChecked(module.id)}
                onChange={(event) => {
                  setPermissions((current) => ({
                    ...current,
                    [module.id]: Object.fromEntries(
                      USER_PERMISSIONS.map((permission) => [permission, event.target.checked]),
                    ),
                  }))
                }}
              />
              {module.id}
            </span>
            <div className="users-permission-row__permissions">
              {USER_PERMISSIONS.map((permission) => (
                <label key={permission} className="users-permission-cell">
                  <input
                    type="checkbox"
                    checked={Boolean(permissions[module.id]?.[permission])}
                    onChange={(event) => updatePermission(module.id, permission, event.target.checked)}
                  />
                  <span>{permission.charAt(0).toUpperCase() + permission.slice(1)}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        title="Reset permissions?"
        description="Reset all permission changes for this user back to their role defaults."
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpenConfirm(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleResetConfirm}>Yes, reset permissions</Button>
          </>
        }
      />
    </div>
  )
}
