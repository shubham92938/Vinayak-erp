import { useEffect, useMemo, useState } from 'react'
import * as userService from '../services/userService'
import { filterUsers, getActivityForUser } from '../utils/userUtils'
import { useAppContext } from '../../../context/hooks'
import {
  canAccessFirm,
  canAccessRecord,
  getUserAccessPolicy,
  hasModulePermission,
} from '../../../core/accessControl'

const initialFilters = { search: '', firmId: 'all', role: 'all', status: 'all' }

function canSeeUser(currentUser, user) {
  if (!currentUser || !user) return false
  if (currentUser.role === 'super_admin') return true
  return canAccessRecord(currentUser, user, 'Users & Permissions', 'view')
}

function constrainAccessPolicy(currentUser, accessPolicy = {}) {
  if (currentUser?.role === 'super_admin') return accessPolicy

  const actorPolicy = getUserAccessPolicy(currentUser)
  const requestedModules = accessPolicy.modules ?? {}
  const requestedFirmPermissions = accessPolicy.firmPermissions ?? {}
  const requestedDataPermissions = accessPolicy.dataPermissions ?? {}

  const modules = Object.fromEntries(
    Object.entries(requestedModules).map(([moduleId, modulePermissions]) => [
      moduleId,
      Object.fromEntries(
        Object.entries(modulePermissions ?? {}).map(([permission, checked]) => [
          permission,
          Boolean(checked && actorPolicy.modules?.[moduleId]?.[permission]),
        ]),
      ),
    ]),
  )
  const firmPermissions = Object.fromEntries(
    Object.entries(requestedFirmPermissions).map(([permission, checked]) => [
      permission,
      Boolean(checked && actorPolicy.firmPermissions?.[permission]),
    ]),
  )
  const dataPermissions = Object.fromEntries(
    Object.entries(requestedDataPermissions).map(([moduleId, scopePermissions]) => [
      moduleId,
      Object.fromEntries(
        Object.entries(scopePermissions ?? {}).map(([permission, checked]) => [
          permission,
          Boolean(checked && actorPolicy.dataPermissions?.[moduleId]?.[permission]),
        ]),
      ),
    ]),
  )
  const firmAccessIds = (accessPolicy.firmAccessIds ?? []).filter((firmId) =>
    canAccessFirm(currentUser, firmId),
  )

  return { modules, firmPermissions, dataPermissions, firmAccessIds }
}

export function useUsers() {
  const { currentUser, userVersion } = useAppContext()
  const [allUsers, setAllUsers] = useState(() => userService.getUsers())
  const [filters, setFilters] = useState(initialFilters)

  useEffect(() => {
    // The context version changes when a user or permission record is updated.
    // Refreshing here keeps every open users view on the same mock collection.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAllUsers(userService.getUsers())
  }, [userVersion])

  const scopedUsers = useMemo(
    () => allUsers.filter((user) => canSeeUser(currentUser, user)),
    [allUsers, currentUser],
  )
  const visibleUsers = filterUsers(scopedUsers, filters)

  const saveUser = (userId, userData) => {
    const existing = userService.getUserById(userId)
    const canEdit = currentUser?.role === 'super_admin' || canAccessRecord(currentUser, existing, 'Users & Permissions', 'edit')
    if (!canSeeUser(currentUser, existing) || !canEdit || !hasModulePermission(currentUser, 'Users & Permissions', 'edit')) return null
    if (currentUser.role !== 'super_admin' && (existing.role === 'super_admin' || userData.role === 'super_admin')) return null

    const nextData =
      currentUser.role === 'super_admin'
        ? userData
        : { ...userData, firmId: currentUser.firmId }
    const user = userService.saveUser(userId, nextData)
    if (user) setAllUsers(userService.getUsers())
    return user
  }

  const createUser = (userData) => {
    if (!hasModulePermission(currentUser, 'Users & Permissions', 'create')) return null
    if (currentUser.role !== 'super_admin' && userData.role === 'super_admin') return null
    const nextData =
      currentUser.role === 'super_admin'
        ? userData
        : { ...userData, firmId: currentUser.firmId }
    const canCreate = currentUser?.role === 'super_admin'
      || (nextData.firmId && canAccessRecord(currentUser, { firmId: nextData.firmId }, 'Users & Permissions', 'create'))
    if (!canCreate) return null
    const user = userService.createUser(nextData)
    setAllUsers(userService.getUsers())
    return user
  }

  const deleteUser = (userId) => {
    const existing = userService.getUserById(userId)
    const canDelete = currentUser?.role === 'super_admin' || canAccessRecord(currentUser, existing, 'Users & Permissions', 'delete')
    if (!canSeeUser(currentUser, existing) || !canDelete || !hasModulePermission(currentUser, 'Users & Permissions', 'delete')) return null
    userService.deleteUser(userId)
    setAllUsers(userService.getUsers())
    return userId
  }

  const toggleUserStatus = (userId) => {
    const existing = userService.getUserById(userId)
    const canEdit = currentUser?.role === 'super_admin' || canAccessRecord(currentUser, existing, 'Users & Permissions', 'edit')
    if (!canSeeUser(currentUser, existing) || !canEdit || !hasModulePermission(currentUser, 'Users & Permissions', 'edit')) return null
    const user = userService.toggleUserStatus(userId)
    setAllUsers(userService.getUsers())
    return user
  }

  const saveRolePermissions = (userId, modulePermissions, accessPolicy) => {
    const existing = userService.getUserById(userId)
    const canEdit = currentUser?.role === 'super_admin' || canAccessRecord(currentUser, existing, 'Users & Permissions', 'edit')
    if (!canSeeUser(currentUser, existing) || !canEdit || !hasModulePermission(currentUser, 'Users & Permissions', 'edit')) return null
    const constrainedPolicy = constrainAccessPolicy(currentUser, accessPolicy)
    const user = userService.saveRolePermissions(userId, constrainedPolicy.modules, constrainedPolicy)
    setAllUsers(userService.getUsers())
    return user
  }

  const getVisibleUserById = (userId) => {
    const user = userService.getUserById(userId)
    return canSeeUser(currentUser, user) ? user : null
  }

  return {
    users: visibleUsers,
    allUsers: scopedUsers,
    filters,
    setFilters,
    saveUser,
    createUser,
    deleteUser,
    toggleUserStatus,
    saveRolePermissions,
    getUserById: getVisibleUserById,
    getActivityForUser,
  }
}
