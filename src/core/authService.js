import {
  changeUserPassword,
  createUser,
  findUserByCredentials,
  getCurrentAuthenticatedUser,
  getUserById,
  recordLogin,
  saveUser,
  setCurrentUserId,
} from '../features/users/services/userService'

const SESSION_KEY = 'vinayak-erp-session'

function canUseStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage)
}

export function getSessionUser() {
  if (!canUseStorage()) return null

  try {
    const userId = window.localStorage.getItem(SESSION_KEY)
    if (!userId) return null
    const user = getUserById(userId)
    if (!user || user.status === 'inactive') {
      window.localStorage.removeItem(SESSION_KEY)
      return null
    }
    setCurrentUserId(user.id)
    return user
  } catch {
    return null
  }
}

export function authenticate(email, password) {
  const user = findUserByCredentials(email, password)
  if (!user || user.status === 'inactive') {
    throw new Error('Invalid login ID or password')
  }

  const updated = recordLogin(user.id) ?? user
  if (canUseStorage()) window.localStorage.setItem(SESSION_KEY, user.id)
  return updated
}

export function register({ name, email, password }) {
  const user = createUser({
    name,
    email,
    password,
    role: 'super_admin',
    firmId: null,
    status: 'active',
  })
  const authenticatedUser = recordLogin(user.id) ?? user
  if (canUseStorage()) window.localStorage.setItem(SESSION_KEY, user.id)
  return authenticatedUser
}

export function updateProfile(userId, profile) {
  const updated = saveUser(userId, {
    name: profile.name,
    email: profile.email,
  })
  if (!updated) throw new Error('Unable to find your account')
  return updated
}

export function updatePassword(userId, currentPassword, nextPassword) {
  return changeUserPassword(userId, currentPassword, nextPassword)
}

export function logout() {
  setCurrentUserId(null)
  if (canUseStorage()) window.localStorage.removeItem(SESSION_KEY)
}

export function getAuthenticatedUser() {
  return getCurrentAuthenticatedUser() ?? getSessionUser()
}

export const DEMO_PASSWORD = 'demo123'
