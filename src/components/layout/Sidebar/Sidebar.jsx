import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
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

    setTooltip({
      label,
      top: rect.top + rect.height / 2,
      left: rect.right + 10,
    })
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
          to="/dashboard"
          className="app-sidebar__brand"
          onClick={handleNavigate}
          aria-label="Vinayak ERP dashboard"
          title={isCollapsed ? 'Vinayak ERP' : undefined}
        >
          <span className="app-sidebar__brand-mark" aria-hidden="true">
            V
          </span>
          {!isCollapsed && (
            <span className="app-sidebar__brand-name">
              Vinayak <span>ERP</span>
            </span>
          )}
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
          <button
            type="button"
            className="app-sidebar__collapse"
            onClick={handleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <span className="app-sidebar__collapse-icon" aria-hidden="true">
              {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            </span>
            {!collapsed && <span>Collapse sidebar</span>}
          </button>
        </div>
      )}

      {isCollapsed && tooltip && (
        <SidebarTooltip
          label={tooltip.label}
          top={tooltip.top}
          left={tooltip.left}
        />
      )}
    </aside>
  )
}
