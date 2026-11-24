import {
  getDefaultAccessPolicy,
  getDefaultDataPermissions,
  getDefaultFirmPermissions,
} from '../features/users/data/rolePermissions'

export const FIRM_PERMISSION_KEYS = [
  'viewFirmDetails',
  'editFirmDetails',
  'createFirms',
  'editAllFirms',
  'manageAllFirms',
]

export const DATA_SCOPE_ACTIONS = ['view', 'create', 'edit', 'delete', 'export', 'approve']

function isSuperAdmin(user) {
  return user?.role === 'super_admin'
}

function getModulePermissions(user, moduleId) {
  return user?.permissions?.[moduleId] ?? {}
}

function getModuleAliases(moduleId) {
  if (moduleId === 'Users & Permissions') return ['Users', 'Users & Permissions']
  if (moduleId === 'Users') return ['Users', 'Users & Permissions']
  if (moduleId === 'Firms') return ['Firms']
  return [moduleId]
}

export function hasModulePermission(user, moduleId, action = 'view') {
  if (!user || user.status === 'inactive') return false
  if (isSuperAdmin(user)) return true

  return getModuleAliases(moduleId).some((id) => Boolean(getModulePermissions(user, id)[action]))
}

function getPolicyValue(policy, key) {
  if (!policy) return undefined
  if (typeof policy[key] === 'boolean') return policy[key]
  return undefined
}

export function hasFirmPermission(user, permission) {
  if (!user || user.status === 'inactive') return false
  if (isSuperAdmin(user)) return true

  const explicit = getPolicyValue(user.firmPermissions, permission)
  if (explicit !== undefined) return explicit

  return Boolean(getDefaultFirmPermissions(user.role)[permission])
}

export function getDataPermission(user, moduleId, action, scope = 'own') {
  if (!user || user.status === 'inactive') return false
  if (isSuperAdmin(user)) return true

  const modulePermissions =
    user.dataPermissions?.[moduleId] ??
    user.dataPermissions?.[getModuleAliases(moduleId).find((id) => user.dataPermissions?.[id])] ??
    getDefaultDataPermissions(user.role)[moduleId] ??
    {}
  const scopeKey = `${action}${scope === 'all' ? 'All' : 'Own'}`

  if (typeof modulePermissions[scopeKey] === 'boolean') {
    return modulePermissions[scopeKey]
  }

  return scope === 'own' && hasModulePermission(user, moduleId, action)
}

export function canAccessFirm(user, firmId) {
  if (!user || !firmId || user.status === 'inactive') return false
  if (isSuperAdmin(user)) return true
  if (user.firmId === firmId) return true
  return Array.isArray(user.firmAccessIds) && user.firmAccessIds.includes(firmId)
}

export function canViewFirmDetails(user, firmId) {
  return canAccessFirm(user, firmId) && hasFirmPermission(user, 'viewFirmDetails')
}

export function canEditFirm(user, firmId) {
  if (!canAccessFirm(user, firmId)) return false
  if (isSuperAdmin(user)) return true
  if (user.firmId === firmId) return hasFirmPermission(user, 'editFirmDetails')
  return hasFirmPermission(user, 'editAllFirms') || hasFirmPermission(user, 'manageAllFirms')
}

export function canCreateFirm(user) {
  return hasFirmPermission(user, 'createFirms')
}

export function canManageAllFirms(user) {
  return hasFirmPermission(user, 'manageAllFirms')
}

export function getAccessibleFirms(user, firms = []) {
  if (!user || user.status === 'inactive') return []
  if (isSuperAdmin(user)) return firms
  return firms.filter((firm) => {
    const firmId = firm.id ?? firm.firmId
    return canAccessFirm(user, firmId) && hasFirmPermission(user, 'viewFirmDetails')
  })
}

export function getAccessibleFirmIds(user, firms = []) {
  return getAccessibleFirms(user, firms).map((firm) => firm.id ?? firm.firmId)
}

export function canAccessRecord(user, record, moduleId, action = 'view') {
  const firmId = record?.firmId
  if (!hasModulePermission(user, moduleId, action)) return false
  // Global records such as the Super Admin profile are never visible to a
  // firm-scoped user, but remain manageable by another Super Admin.
  if (!firmId) return isSuperAdmin(user)

  if (isSuperAdmin(user) || user.firmId === firmId) {
    return getDataPermission(user, moduleId, action, 'own')
  }

  // Cross-firm module scope never replaces firm access. A user must have both
  // an explicit firm assignment and the matching all-firms action.
  return canAccessFirm(user, firmId) && getDataPermission(user, moduleId, action, 'all')
}

export function filterRecordsForUser(
  records,
  user,
  moduleId,
  action = 'view',
  selectedFirmId = null,
) {
  return records.filter((record) => {
    if (selectedFirmId && record.firmId !== selectedFirmId) return false
    return canAccessRecord(user, record, moduleId, action)
  })
}

export function resolveAuthorizedFirmId(user, requestedFirmId, moduleId = null, action = 'view') {
  if (!user || user.status === 'inactive') return null
  const targetFirmId = requestedFirmId ?? user.firmId
  if (isSuperAdmin(user)) return targetFirmId ?? null
  if (!targetFirmId) return null
  if (targetFirmId === user.firmId) return user.firmId
  return moduleId && canAccessRecord(user, { firmId: targetFirmId }, moduleId, action)
    ? targetFirmId
    : null
}

export function enforceCreateFirmId(user, requestedFirmId, moduleId = null) {
  if (!user || user.status === 'inactive') return null
  const targetFirmId = requestedFirmId ?? user.firmId
  if (isSuperAdmin(user)) return targetFirmId ?? null
  if (!targetFirmId || targetFirmId === user.firmId) return user.firmId ?? null

  // A cross-firm create is allowed only when the target firm is explicitly
  // accessible and this module has its own createAll grant. Otherwise ignore
  // the requested ID instead of allowing a form/URL to move ownership.
  return moduleId && canAccessRecord(user, { firmId: targetFirmId }, moduleId, 'create')
    ? targetFirmId
    : user.firmId ?? null
}

export function getUserAccessPolicy(user) {
  if (!user) return getDefaultAccessPolicy('viewer')
  return {
    modules: user.permissions ?? getDefaultAccessPolicy(user.role).modules,
    firmPermissions:
      user.firmPermissions ?? getDefaultAccessPolicy(user.role).firmPermissions,
    dataPermissions:
      user.dataPermissions ?? getDefaultAccessPolicy(user.role).dataPermissions,
    firmAccessIds: [...(user.firmAccessIds ?? [])],
  }
}
