import { useState } from 'react'
import * as userService from '../services/userService'
import { filterUsers, getActivityForUser } from '../utils/userUtils'

const initialFilters = { search: '', firmId: 'all', role: 'all', status: 'all' }

export function useUsers() {
  const [users, setUsers] = useState(() => userService.getUsers())
  const [filters, setFilters] = useState(initialFilters)

  const visibleUsers = filterUsers(users, filters)

  const saveUser = (userId, userData) => {
    const user = userService.saveUser(userId, userData)
    if (user) setUsers(userService.getUsers())
    return user
  }

  const createUser = (userData) => {
    const user = userService.createUser(userData)
    setUsers(userService.getUsers())
    return user
  }

  const deleteUser = (userId) => {
    userService.deleteUser(userId)
    setUsers(userService.getUsers())
  }

  const toggleUserStatus = (userId) => {
    const user = userService.toggleUserStatus(userId)
    setUsers(userService.getUsers())
    return user
  }

  const saveRolePermissions = (userId, modulePermissions) => {
    const user = userService.saveRolePermissions(userId, modulePermissions)
    setUsers(userService.getUsers())
    return user
  }

  return {
    users: visibleUsers,
    filters,
    setFilters,
    saveUser,
    createUser,
    deleteUser,
    toggleUserStatus,
    saveRolePermissions,
    getUserById: userService.getUserById,
    getActivityForUser,
  }
}
