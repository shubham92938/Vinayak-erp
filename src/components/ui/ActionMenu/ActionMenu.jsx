import { MoreHorizontal } from 'lucide-react'
import Dropdown, {
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
  DropdownSeparator,
  DropdownTrigger,
} from '../Dropdown/Dropdown'
import './ActionMenu.css'

/**
 * Compact menu used for row-level or panel-level actions.
 *
 * items: [{ id, label, icon, onSelect, danger, disabled }, { type: 'separator' },
 *         { type: 'label', label }]
 */
function ActionMenu({
  items = [],
  label = 'Actions',
  triggerLabel,
  align = 'end',
  size = 'sm',
  variant = 'ghost',
  icon,
  className = '',
  menuClassName = '',
}) {
  const visibleItems = Array.isArray(items)
    ? items.filter((item) => item && (item.type || item.label))
    : []

  if (visibleItems.length === 0) return null

  return (
    <Dropdown
      align={align}
      menuLabel={label}
      portal
      className={['ui-action-menu', className].filter(Boolean).join(' ')}
    >
      <DropdownTrigger
        variant={variant}
        size={size}
        iconOnly
        leadingIcon={icon ?? <MoreHorizontal size={16} />}
        aria-label={triggerLabel || label}
        title={triggerLabel || label}
      />

      <DropdownMenu className={menuClassName}>
        {visibleItems.map((item, index) => {
          const key = item.id ?? `${item.type ?? 'item'}-${index}`

          if (item.type === 'separator') {
            return <DropdownSeparator key={key} />
          }

          if (item.type === 'label') {
            return <DropdownLabel key={key}>{item.label}</DropdownLabel>
          }

          return (
            <DropdownItem
              key={key}
              icon={item.icon}
              danger={item.danger}
              disabled={item.disabled}
              onSelect={item.onSelect}
            >
              {item.label}
            </DropdownItem>
          )
        })}
      </DropdownMenu>
    </Dropdown>
  )
}

export default ActionMenu
