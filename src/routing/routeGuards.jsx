import { useEffect } from 'react'
import { Navigate, Outlet, useLocation, useParams } from 'react-router-dom'
import { canAccessFirm, canViewFirmDetails, hasModulePermission } from '../core/accessControl'
import { getFirmById } from '../core/firmStore'
import { useAuth, useFirmContext } from '../context/hooks'
import MainLayout from '../layouts/MainLayout/MainLayout'

export function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children ?? <Outlet />
}

function deniedState(location, firmId) {
  return {
    accessDenied: true,
    message: firmId
      ? 'You do not have permission to access that firm.'
      : 'Choose a firm before opening the workspace.',
    from: location.pathname,
  }
}

export function WorkspaceRoute() {
  const { currentUser } = useAuth()
  const { firmId } = useParams()
  const { currentFirmId, selectFirm } = useFirmContext()
  const location = useLocation()
  const firm = getFirmById(firmId)
  const isAllowed = Boolean(currentUser && firm && firm.status !== 'inactive' && canAccessFirm(currentUser, firmId))

  useEffect(() => {
    if (isAllowed && currentFirmId !== firmId) selectFirm(firmId)
  }, [currentFirmId, firmId, isAllowed, selectFirm])

  if (!currentUser) return <Navigate to="/login" replace />
  if (!isAllowed) {
    return <Navigate to="/home" replace state={deniedState(location, firmId)} />
  }
  if (currentFirmId !== firmId) {
    return <div className="route-loading" role="status">Opening workspace…</div>
  }

  return <MainLayout />
}

export function FirmProfileRoute() {
  const { currentUser } = useAuth()
  const { firmId } = useParams()
  const { currentFirmId, selectFirm } = useFirmContext()
  const location = useLocation()
  const firm = getFirmById(firmId)
  const isAllowed = Boolean(currentUser && firm && canViewFirmDetails(currentUser, firmId))

  useEffect(() => {
    if (isAllowed && currentFirmId !== firmId) selectFirm(firmId)
  }, [currentFirmId, firmId, isAllowed, selectFirm])

  if (!currentUser) return <Navigate to="/login" replace />
  if (!isAllowed) {
    return <Navigate to="/home" replace state={deniedState(location, firmId)} />
  }
  if (currentFirmId !== firmId) {
    return <div className="route-loading" role="status">Opening firm profile…</div>
  }

  return <MainLayout />
}

export function LegacyWorkspaceRoute() {
  const { currentUser } = useAuth()
  const { currentFirmId, accessibleFirms, selectFirm } = useFirmContext()
  const location = useLocation()
  const fallbackFirm = accessibleFirms[0] ?? null

  useEffect(() => {
    if (currentUser && !currentFirmId && fallbackFirm) {
      selectFirm(fallbackFirm.id)
    }
  }, [currentFirmId, currentUser, fallbackFirm, selectFirm])

  if (!currentUser) return <Navigate to="/login" replace />
  if (!currentFirmId && fallbackFirm) {
    return <div className="route-loading" role="status">Opening {fallbackFirm.name} workspace…</div>
  }
  if (!currentFirmId || !canAccessFirm(currentUser, currentFirmId)) {
    return <Navigate to="/home" replace state={deniedState(location, currentFirmId)} />
  }

  return <MainLayout />
}

export function ModuleGuard({ moduleId, children }) {
  const { currentUser } = useAuth()
  const location = useLocation()

  if (!hasModulePermission(currentUser, moduleId, 'view')) {
    return (
      <Navigate
        to="/home"
        replace
        state={{
          accessDenied: true,
          message: `You do not have view permission for ${moduleId}.`,
          from: location.pathname,
        }}
      />
    )
  }

  return children
}
