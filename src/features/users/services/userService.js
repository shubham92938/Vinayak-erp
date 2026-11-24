import { USER_DEMO_DATA } from '../data/userDemoData'
import { getDefaultAccessPolicy } from '../data/rolePermissions'

let users = USER_DEMO_DATA.map((user) => ({
  ...user,
  permissions: Object.fromEntries(
    Object.entries(user.permissions ?? {}).map(([moduleId, permissions]) => [
      moduleId,
      { ...permissions },
    ]),
  ),
  firmPermissions: { ...(user.firmPermissions ?? {}) },
  dataPermissions: Object.fromEntries(
    Object.entries(user.dataPermissions ?? {}).map(([moduleId, permissions]) => [
      moduleId,
      { ...permissions },
    ]),
  ),
}))

let currentUserId = null
const listeners = new Set()

export const DEFAULT_USER_ID = 'user-01'

function notify() {
  listeners.forEach((listener) => listener())
}

function cloneUser(user, includePassword = false) {
  if (!user) return null
  const clone = {
    ...user,
    permissions: Object.fromEntries(
      Object.entries(user.permissions ?? {}).map(([moduleId, permissions]) => [
        moduleId,
        { ...permissions },
      ]),
    ),
    firmPermissions: { ...(user.firmPermissions ?? {}) },
    dataPermissions: Object.fromEntries(
      Object.entries(user.dataPermissions ?? {}).map(([moduleId, permissions]) => [
        moduleId,
        { ...permissions },
      ]),
    ),
    firmAccessIds: [...(user.firmAccessIds ?? [])],
  }
  if (!includePassword) delete clone.password
  return clone
}

export function subscribeToUsers(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export const getUsers = () => users.map((user) => cloneUser(user))

export const getUserById = (userId) => cloneUser(users.find((user) => user.id === userId))

export const getUserByEmail = (email) => {
  const normalized = String(email ?? '').trim().toLowerCase()
  return cloneUser(users.find((user) => user.email?.toLowerCase() === normalized))
}

export function findUserByCredentials(email, password) {
  const normalized = String(email ?? '').trim().toLowerCase()
  const user = users.find(
    (entry) =>
      entry.email?.toLowerCase() === normalized &&
      entry.password === password,
  )
  return user ? cloneUser(user) : null
}

export function setCurrentUserId(userId) {
  currentUserId = userId ?? null
}

export function getCurrentAuthenticatedUser() {
  return getUserById(currentUserId)
}

export function saveUser(userId, userData) {
  const index = users.findIndex((user) => user.id === userId)
  if (index === -1) return null

  const previous = users[index]
  const defaults = getDefaultAccessPolicy(userData.role ?? previous.role)
  const updated = {
    ...previous,
    ...userData,
    id: userId,
    permissions: userData.permissions ?? previous.permissions ?? defaults.modules,
    firmPermissions:
      userData.firmPermissions ?? previous.firmPermissions ?? defaults.firmPermissions,
    dataPermissions:
      userData.dataPermissions ?? previous.dataPermissions ?? defaults.dataPermissions,
    password: userData.password ?? previous.password ?? 'demo123',
  }
  users[index] = updated
  notify()
  return cloneUser(updated)
}

export function createUser(userData) {
  const email = String(userData.email ?? '').trim().toLowerCase()
  if (!email) throw new Error('User email is required')
  if (users.some((user) => user.email?.toLowerCase() === email)) {
    throw new Error('User login ID is already in use')
  }

  const role = userData.role ?? 'viewer'
  const defaults = getDefaultAccessPolicy(role)
  const user = {
    id: userData.id ?? `user-${Date.now()}`,
    name: userData.name?.trim() ?? '',
    email,
    phone: userData.phone ?? '',
    profileImage: userData.profileImage ?? null,
    firmId: userData.firmId ?? null,
    role,
    status: userData.status ?? 'active',
    password: userData.password ?? 'demo123',
    permissions: userData.permissions ?? defaults.modules,
    firmPermissions: userData.firmPermissions ?? defaults.firmPermissions,
    dataPermissions: userData.dataPermissions ?? defaults.dataPermissions,
    firmAccessIds: userData.firmAccessIds ?? [],
    createdAt: userData.createdAt ?? new Date().toISOString(),
    lastLogin: userData.lastLogin ?? null,
  }
  users = [user, ...users]
  notify()
  return cloneUser(user)
}

export function deleteUser(userId) {
  users = users.filter((user) => user.id !== userId)
  if (currentUserId === userId) currentUserId = null
  notify()
  return userId
}

export function toggleUserStatus(userId) {
  const user = users.find((current) => current.id === userId)
  if (!user) return null

  const status = user.status === 'active' ? 'inactive' : 'active'
  users = users.map((current) =>
    current.id === userId ? { ...current, status } : current,
  )
  notify()
  return cloneUser({ ...user, status })
}

export function saveRolePermissions(userId, modulePermissions, accessPolicy = {}) {
  const user = users.find((current) => current.id === userId)
  if (!user) return null

  const next = {
    permissions: modulePermissions ?? user.permissions,
    firmPermissions: accessPolicy.firmPermissions ?? user.firmPermissions,
    dataPermissions: accessPolicy.dataPermissions ?? user.dataPermissions,
    firmAccessIds: accessPolicy.firmAccessIds ?? user.firmAccessIds ?? [],
  }
  users = users.map((current) =>
    current.id === userId ? { ...current, ...next } : current,
  )
  notify()
  return cloneUser({ ...user, ...next })
}

export function recordLogin(userId) {
  const index = users.findIndex((user) => user.id === userId)
  if (index === -1) return null
  users[index] = { ...users[index], lastLogin: new Date().toISOString() }
  currentUserId = userId
  notify()
  return cloneUser(users[index])
}
