import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import BrandLockup from '../../brand/BrandLockup'
import { useFirmContext } from '../../../context/hooks'
import SidebarNav from './SidebarNav'
import SidebarTooltip from './SidebarTooltip'
import './Sidebar.css'

export default function Sidebar({
  collapsed = false,
  mobileOpen = false,
  isMobile = false,
  onNavigate,
  onToggleCollapse,
  onExpandSidebar,
}) {
  const [tooltip, setTooltip] = useState(null)
  const { currentFirm } = useFirmContext()
  const isCollapsed = collapsed && !isMobile
  const isHidden = isMobile && !mobileOpen

  const classes = [
    'app-sidebar',
    isCollapsed && 'app-sidebar--collapsed',
    isMobile && 'app-sidebar--mobile',
    mobileOpen && 'app-sidebar--mobile-open',
  ]
    .filter(Boolean)
    .join(' ')

  const showTooltip = (label, element) => {
    if (!isCollapsed) return
    const rect = element.getBoundingClientRect()
    setTooltip({ label, top: rect.top + rect.height / 2, left: rect.right + 10 })
  }

  const hideTooltip = () => setTooltip(null)
  const handleNavigate = () => {
    hideTooltip()
    onNavigate?.()
  }
  const handleCollapse = () => {
    hideTooltip()
    onToggleCollapse?.()
  }

  return (
    <aside
      id="app-sidebar"
      className={classes}
      aria-label="Primary navigation"
      aria-hidden={isHidden || undefined}
      inert={isHidden || undefined}
    >
      <div className="app-sidebar__header">
        <Link
          to="/home"
          className="app-sidebar__brand"
          onClick={handleNavigate}
          aria-label="Vinayak ERP dashboard"
          title={isCollapsed ? 'Vinayak ERP' : undefined}
        >
          <BrandLockup compact size="sm" />
        </Link>
      </div>

      <SidebarNav
        collapsed={isCollapsed}
        onNavigate={handleNavigate}
        onExpandSidebar={onExpandSidebar}
        onShowTooltip={showTooltip}
        onHideTooltip={hideTooltip}
      />

      {!isMobile && (
        <div className="app-sidebar__footer">
          {!isCollapsed && currentFirm && (
            <div className="app-sidebar__workspace-note">
              <span className="app-sidebar__workspace-note-icon" aria-hidden="true">i</span>
              <span>
                <strong>FY 2025–26</strong>
                <small>{currentFirm.city ?? currentFirm.location ?? 'Current firm'}</small>
              </span>
            </div>
          )}
          <button
            type="button"
            className="app-sidebar__collapse"
            onClick={handleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <span className="app-sidebar__collapse-icon" aria-hidden="true">
              {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            </span>
            {!isCollapsed && <span>Collapse sidebar</span>}
          </button>
        </div>
      )}

      {isCollapsed && tooltip && (
        <SidebarTooltip label={tooltip.label} top={tooltip.top} left={tooltip.left} />
      )}
    </aside>
  )
}
