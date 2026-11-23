import { ChevronDown } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import SidebarLink from './SidebarLink'

export default function SidebarGroup({
  group,
  collapsed,
  open,
  onToggle,
  onNavigate,
  onShowTooltip,
  onHideTooltip,
}) {
  const { pathname } = useLocation()
  const Icon = group.icon
  const hasActiveChild = group.children.some((child) => child.to === pathname)
  const isExpanded = !collapsed && open

  const showGroupTooltip = (event) => {
    if (collapsed) {
      onShowTooltip?.(group.label, event.currentTarget)
    }
  }

  return (
    <li className="app-sidebar__list-item">
      <button
        type="button"
        className={[
          'app-sidebar__link',
          'app-sidebar__group-trigger',
          hasActiveChild && 'is-active',
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={() => {
          onHideTooltip?.()
          onToggle?.()
        }}
        onMouseEnter={showGroupTooltip}
        onMouseLeave={onHideTooltip}
        onFocus={showGroupTooltip}
        onBlur={onHideTooltip}
        aria-label={group.label}
        aria-expanded={collapsed ? undefined : open}
        aria-controls={!collapsed ? `sidebar-group-${group.id}` : undefined}
      >
        {Icon && (
          <span className="app-sidebar__link-icon" aria-hidden="true">
            <Icon size={17} strokeWidth={1.8} />
          </span>
        )}

        {!collapsed && (
          <>
            <span className="app-sidebar__link-label">{group.label}</span>
            <ChevronDown
              className={[
                'app-sidebar__group-chevron',
                open && 'is-open',
              ]
                .filter(Boolean)
                .join(' ')}
              size={14}
              aria-hidden="true"
            />
          </>
        )}
      </button>

      {isExpanded && (
        <ul className="app-sidebar__sublist" id={`sidebar-group-${group.id}`}>
          {group.children.map((child) => (
            <SidebarLink
              key={child.id}
              item={child}
              compact
              onNavigate={onNavigate}
              onShowTooltip={onShowTooltip}
              onHideTooltip={onHideTooltip}
            />
          ))}
        </ul>
      )}
    </li>
  )
}
