import { useContext } from 'react'
import { AppContext } from './context'

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useAppContext must be used within AppProvider')
  return context
}

export function useAuth() {
  const { currentUser, isAuthenticated, login, logout } = useAppContext()
  return { currentUser, isAuthenticated, login, logout }
}

export function useFirmContext() {
  const {
    firms,
    accessibleFirms,
    currentFirm,
    currentFirmId,
    selectFirm,
    firmVersion,
  } = useAppContext()
  return {
    firms,
    accessibleFirms,
    currentFirm,
    currentFirmId,
    selectFirm,
    firmVersion,
  }
}
