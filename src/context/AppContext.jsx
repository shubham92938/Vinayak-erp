import { useCallback, useEffect, useMemo, useState } from 'react'
import * as authService from '../core/authService'
import { getFirms, subscribeToFirms } from '../core/firmStore'
import { getAccessibleFirms } from '../core/accessControl'
import { setActiveFirmId } from '../core/firmContextStore'
import { AppContext } from './context'
import {
  getCurrentAuthenticatedUser,
  subscribeToUsers,
} from '../features/users/services/userService'

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => authService.getSessionUser())
  const [currentFirmId, setCurrentFirmId] = useState(null)
  const [firms, setFirms] = useState(() => getFirms())
  const [firmVersion, setFirmVersion] = useState(0)
  const [userVersion, setUserVersion] = useState(0)

  useEffect(
    () =>
      subscribeToFirms(() => {
        setFirms(getFirms())
        setFirmVersion((value) => value + 1)
      }),
    [],
  )

  useEffect(
    () =>
      subscribeToUsers(() => {
        const latest = getCurrentAuthenticatedUser()
        setUserVersion((value) => value + 1)
        if (!latest || latest.status === 'inactive') {
          authService.logout()
          setCurrentUser(null)
          setCurrentFirmId(null)
          setActiveFirmId(null)
          return
        }
        setCurrentUser((previous) =>
          JSON.stringify(previous) === JSON.stringify(latest) ? previous : latest,
        )
      }),
    [],
  )

  const accessibleFirms = useMemo(
    () => getAccessibleFirms(currentUser, firms),
    [currentUser, firms],
  )
  const currentFirm = useMemo(
    () => firms.find((firm) => firm.id === currentFirmId) ?? null,
    [currentFirmId, firms],
  )

  useEffect(() => {
    if (!currentFirmId || accessibleFirms.some((firm) => firm.id === currentFirmId)) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentFirmId(null)
    setActiveFirmId(null)
  }, [accessibleFirms, currentFirmId])

  const login = useCallback((email, password) => {
    const user = authService.authenticate(email, password)
    setCurrentUser(user)
    setCurrentFirmId(null)
    setActiveFirmId(null)
    return user
  }, [])

  const register = useCallback((registration) => {
    const user = authService.register(registration)
    setCurrentUser(user)
    setCurrentFirmId(null)
    setActiveFirmId(null)
    return user
  }, [])

  const updateProfile = useCallback((profile) => {
    if (!currentUser?.id) throw new Error('You are not signed in')
    const updated = authService.updateProfile(currentUser.id, profile)
    setCurrentUser(updated)
    return updated
  }, [currentUser])

  const updatePassword = useCallback((currentPassword, nextPassword) => {
    if (!currentUser?.id) throw new Error('You are not signed in')
    return authService.updatePassword(currentUser.id, currentPassword, nextPassword)
  }, [currentUser])

  const logout = useCallback(() => {
    authService.logout()
    setCurrentUser(null)
    setCurrentFirmId(null)
    setActiveFirmId(null)
  }, [])

  const selectFirm = useCallback((firmId) => {
    const nextFirmId = firmId ?? null
    if (nextFirmId && !accessibleFirms.some((firm) => firm.id === nextFirmId)) {
      return false
    }
    setCurrentFirmId(nextFirmId)
    setActiveFirmId(nextFirmId)
    return true
  }, [accessibleFirms])

  const value = useMemo(
    () => ({
      currentUser,
      isAuthenticated: Boolean(currentUser),
      login,
      register,
      updateProfile,
      updatePassword,
      logout,
      firms,
      accessibleFirms,
      currentFirm,
      currentFirmId,
      selectFirm,
      firmVersion,
      userVersion,
    }),
    [
      currentUser,
      firms,
      accessibleFirms,
      currentFirm,
      currentFirmId,
      login,
      register,
      updateProfile,
      updatePassword,
      logout,
      selectFirm,
      firmVersion,
      userVersion,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
