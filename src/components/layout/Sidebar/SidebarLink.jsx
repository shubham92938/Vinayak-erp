import { NavLink } from 'react-router-dom'

export default function SidebarLink({
  item,
  collapsed = false,
  compact = false,
  onNavigate,
  onShowTooltip,
  onHideTooltip,
}) {
  const Icon = item.icon

  const showLinkTooltip = (event) => {
    if (collapsed) {
      onShowTooltip?.(item.label, event.currentTarget)
    }
  }

  return (
    <li className="app-sidebar__list-item">
      <NavLink
        to={item.to}
        end
        onClick={() => {
          onHideTooltip?.()
          onNavigate?.()
        }}
        onMouseEnter={showLinkTooltip}
        onMouseLeave={onHideTooltip}
        onFocus={showLinkTooltip}
        onBlur={onHideTooltip}
        aria-label={item.label}
        className={({ isActive }) =>
          [
            'app-sidebar__link',
            compact && 'app-sidebar__link--compact',
            isActive && 'is-active',
          ]
            .filter(Boolean)
            .join(' ')
        }
      >
        {compact ? (
          <span className="app-sidebar__bullet" aria-hidden="true" />
        ) : (
          Icon && (
            <span className="app-sidebar__link-icon" aria-hidden="true">
              <Icon size={17} strokeWidth={1.8} />
            </span>
          )
        )}

        {!collapsed && (
          <span className="app-sidebar__link-label">{item.label}</span>
        )}
      </NavLink>
    </li>
  )
}
