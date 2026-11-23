import { USER_DEMO_DATA } from '../data/userDemoData'

let users = USER_DEMO_DATA.map((user) => ({ ...user }))

export const DEFAULT_USER_ID = 'user-01'

export const getUsers = () => users.map((user) => ({ ...user }))

export const getUserById = (userId) => {
  const user = users.find((current) => current.id === userId)
  return user ? { ...user } : null
}

export function saveUser(userId, userData) {
  const index = users.findIndex((user) => user.id === userId)
  if (index === -1) return null

  const updated = { ...userData }
  users[index] = updated
  return { ...updated }
}

export function createUser(userData) {
  const user = { ...userData }
  users = [user, ...users]
  return { ...user }
}

export function deleteUser(userId) {
  users = users.filter((user) => user.id !== userId)
  return userId
}

export function toggleUserStatus(userId) {
  const user = users.find((current) => current.id === userId)
  if (!user) return null

  const status = user.status === 'active' ? 'inactive' : 'active'
  users = users.map((current) =>
    current.id === userId ? { ...current, status } : current,
  )
  return { ...user, status }
}

export function saveRolePermissions(userId, modulePermissions) {
  const user = users.find((current) => current.id === userId)
  if (!user) return null

  users = users.map((current) =>
    current.id === userId ? { ...current, permissions: modulePermissions } : current,
  )
  return { ...user, permissions: modulePermissions }
}
