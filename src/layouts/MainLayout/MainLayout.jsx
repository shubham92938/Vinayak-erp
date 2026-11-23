import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../../components/layout/Sidebar/Sidebar'
import Topbar from '../../components/layout/Topbar/Topbar'
import useMediaQuery from '../../hooks/useMediaQuery'
import './MainLayout.css'

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [openDrawerKey, setOpenDrawerKey] = useState(null)
  const mainRef = useRef(null)
  const isMobile = useMediaQuery('(max-width: 768px)')
  const location = useLocation()
  const previousPathname = useRef(location.pathname)

  const drawerKey = `${location.key}-${isMobile}`
  const mobileOpen = isMobile && openDrawerKey === drawerKey

  useEffect(() => {
    if (previousPathname.current === location.pathname) return

    previousPathname.current = location.pathname
    window.scrollTo(0, 0)
    mainRef.current?.focus({ preventScroll: true })
  }, [location.pathname])

  useEffect(() => {
    if (!isMobile || !mobileOpen) return undefined

    const originalOverflow = document.body.style.overflow
    const originalPaddingRight = document.body.style.paddingRight
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth

    document.body.style.overflow = 'hidden'

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }

    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') return

      event.preventDefault()
      setOpenDrawerKey(null)
      document.querySelector('.app-sidebar-toggle')?.focus()
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = originalOverflow
      document.body.style.paddingRight = originalPaddingRight
    }
  }, [isMobile, mobileOpen])

  const closeMobile = () => setOpenDrawerKey(null)

  const handleToggleSidebar = () => {
    if (isMobile) {
      setOpenDrawerKey(drawerKey)
      return
    }

    setCollapsed((current) => !current)
  }

  return (
    <div
      className={[
        'app-shell',
        collapsed && !isMobile && 'app-shell--collapsed',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        isMobile={isMobile}
        onNavigate={closeMobile}
        onToggleCollapse={() => setCollapsed((current) => !current)}
        onExpandSidebar={() => setCollapsed(false)}
      />

      {isMobile && mobileOpen && (
        <button
          type="button"
          className="app-backdrop"
          aria-label="Close navigation"
          onClick={closeMobile}
        />
      )}

      <div className="app-main">
        <Topbar
          collapsed={collapsed}
          isMobile={isMobile}
          onToggleSidebar={handleToggleSidebar}
        />

        <main
          ref={mainRef}
          id="main-content"
          className="app-content"
          tabIndex={-1}
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
