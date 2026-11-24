import { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { NAV_SECTIONS } from '../../../config/navigation'
import { useAuth } from '../../../context/hooks'
import { hasModulePermission } from '../../../core/accessControl'
import SidebarGroup from './SidebarGroup'
import SidebarLink from './SidebarLink'

function getModuleId(item) {
  if (item.id === 'firms') return 'Firms'
  if (item.id === 'users-permissions') return 'Users & Permissions'
  return item.label
}

export default function SidebarNav({
  collapsed,
  onNavigate,
  onExpandSidebar,
  onShowTooltip,
  onHideTooltip,
}) {
  const { pathname } = useLocation()
  const { currentUser } = useAuth()
  const [inventoryOpen, setInventoryOpen] = useState(() =>
    pathname.includes('/inventory'),
  )

  const visibleSections = useMemo(() => NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items
      .map((item) => {
        if (!item.children) return item
        const children = item.children.filter(() =>
          hasModulePermission(currentUser, getModuleId(item), 'view'),
        )
        return { ...item, children }
      })
      .filter((item) =>
        item.children
          ? item.children.length > 0
          : hasModulePermission(currentUser, getModuleId(item), 'view'),
      ),
  })).filter((section) => section.items.length > 0), [currentUser])

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
      {visibleSections.map((section) => (
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
