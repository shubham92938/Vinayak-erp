import { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { NAV_SECTIONS, getWorkspaceRoutePath } from '../../../config/navigation'
import { useAuth, useFirmContext } from '../../../context/hooks'
import { hasModulePermission } from '../../../core/accessControl'
import SidebarGroup from './SidebarGroup'
import SidebarLink from './SidebarLink'

function getModuleId(item) {
  if (item.module) return item.module
  if (item.id === 'firms') return 'Firms'
  if (item.id === 'users-permissions') return 'Users & Permissions'
  return item.label
}

function getActiveGroupIds(pathname, currentFirmId) {
  return NAV_SECTIONS.flatMap((section) => section.items)
    .filter((item) => item.children?.some((child) => {
      const workspacePath = getWorkspaceRoutePath(currentFirmId, child.to)
      return pathname === workspacePath || pathname === child.to || pathname.startsWith(`${workspacePath}/`) || pathname.startsWith(`${child.to}/`)
    }))
    .map((item) => item.id)
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
  const { currentFirmId } = useFirmContext()
  const [openGroups, setOpenGroups] = useState(() => new Set())
  const activeGroups = getActiveGroupIds(pathname, currentFirmId)
  const visibleOpenGroups = new Set([...openGroups, ...activeGroups])

  const visibleSections = useMemo(() => NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items
      .map((item) => {
        if (!item.children) return item
        const children = item.children.filter((child) =>
          hasModulePermission(currentUser, getModuleId(child), 'view'),
        )
        return { ...item, children }
      })
      .filter((item) => (
        item.children
          ? item.children.length > 0
          : hasModulePermission(currentUser, getModuleId(item), 'view')
      )),
  })).filter((section) => section.items.length > 0), [currentUser])

  const handleGroupToggle = (groupId) => {
    onHideTooltip?.()

    if (collapsed) {
      onExpandSidebar?.()
      setOpenGroups((current) => new Set([...current, groupId]))
      return
    }

    setOpenGroups((current) => {
      const next = new Set(current)
      if (next.has(groupId)) next.delete(groupId)
      else next.add(groupId)
      return next
    })
  }

  return (
    <nav className="app-sidebar__nav" aria-label="Modules" onScroll={onHideTooltip}>
      {visibleSections.map((section) => (
        <div className="app-sidebar__section" key={section.id}>
          {!collapsed && <p className="app-sidebar__section-label">{section.label}</p>}
          <ul className="app-sidebar__list">
            {section.items.map((item) => (
              item.children ? (
                <SidebarGroup
                  key={item.id}
                  group={item}
                  collapsed={collapsed}
                  open={visibleOpenGroups.has(item.id)}
                  onToggle={() => handleGroupToggle(item.id)}
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
              )
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}
