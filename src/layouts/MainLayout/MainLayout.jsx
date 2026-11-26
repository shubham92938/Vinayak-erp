import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../../components/layout/Sidebar/Sidebar'
import Topbar from '../../components/layout/Topbar/Topbar'
import useMediaQuery from '../../hooks/useMediaQuery'
import './MainLayout.css'

export default function MainLayout() {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileOpen((open) => !open)
      return
    }
    setCollapsed((value) => !value)
  }

  const closeMobileSidebar = () => setMobileOpen(false)

  return (
    <div className={['app-shell', collapsed && !isMobile && 'app-shell--sidebar-collapsed'].filter(Boolean).join(' ')}>
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        isMobile={isMobile}
        onNavigate={closeMobileSidebar}
        onToggleCollapse={() => setCollapsed((value) => !value)}
        onExpandSidebar={() => setCollapsed(false)}
      />

      {isMobile && mobileOpen && (
        <button
          type="button"
          className="app-shell__backdrop"
          aria-label="Close navigation"
          onClick={closeMobileSidebar}
        />
      )}

      <div className="app-shell__main">
        <Topbar
          collapsed={collapsed}
          isMobile={isMobile}
          onToggleSidebar={toggleSidebar}
        />
        <main id="main-content" className="app-shell__content" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
