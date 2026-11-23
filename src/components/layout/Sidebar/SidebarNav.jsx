import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { NAV_SECTIONS } from '../../../config/navigation'
import SidebarGroup from './SidebarGroup'
import SidebarLink from './SidebarLink'

export default function SidebarNav({
  collapsed,
  onNavigate,
  onExpandSidebar,
  onShowTooltip,
  onHideTooltip,
}) {
  const { pathname } = useLocation()
  const [inventoryOpen, setInventoryOpen] = useState(() =>
    pathname.startsWith('/inventory'),
  )

  const handleGroupToggle = () => {
    onHideTooltip?.()

    if (collapsed) {
      onExpandSidebar?.()
      setInventoryOpen(true)
      return
    }

    setInventoryOpen((current) => !current)
  }

  return (
    <nav
      className="app-sidebar__nav"
      aria-label="Modules"
      onScroll={onHideTooltip}
    >
      {NAV_SECTIONS.map((section) => (
        <div className="app-sidebar__section" key={section.id}>
          {!collapsed && (
            <p className="app-sidebar__section-label">{section.label}</p>
          )}

          <ul className="app-sidebar__list">
            {section.items.map((item) =>
              item.children ? (
                <SidebarGroup
                  key={item.id}
                  group={item}
                  collapsed={collapsed}
                  open={inventoryOpen}
                  onToggle={handleGroupToggle}
                  onNavigate={onNavigate}
                  onShowTooltip={onShowTooltip}
                  onHideTooltip={onHideTooltip}
                />
              ) : (
                <SidebarLink
                  key={item.id}
                  item={item}
                  collapsed={collapsed}
                  onNavigate={onNavigate}
                  onShowTooltip={onShowTooltip}
                  onHideTooltip={onHideTooltip}
                />
              ),
            )}
          </ul>
        </div>
      ))}
    </nav>
  )
}
