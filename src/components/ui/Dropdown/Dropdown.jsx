import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import Button from '../Button/Button'
import './Dropdown.css'

const DropdownContext = createContext(null)

function useDropdownContext() {
  const context = useContext(DropdownContext)

  if (!context) {
    throw new Error('Dropdown components must be used within a Dropdown')
  }

  return context
}

function Dropdown({
  children,
  align = 'end',
  menuLabel = 'Actions',
  className = '',
  portal = false,
}) {
  const [open, setOpen] = useState(false)
  const [initialFocus, setInitialFocus] = useState('first')
  const wrapperRef = useRef(null)
  const triggerRef = useRef(null)
  const menuId = useId()

  const close = useCallback((returnFocus = false) => {
    setOpen(false)

    // Focus the trigger synchronously so dialogs opened from a menu item can
    // capture it as their return target before the menu unmounts.
    if (returnFocus) {
      triggerRef.current?.focus()
    }
  }, [])

  const openMenu = useCallback((focusPosition = 'first') => {
    setInitialFocus(focusPosition)
    setOpen(true)
  }, [])

  const toggle = useCallback(() => {
    if (open) {
      setOpen(false)
      return
    }

    setInitialFocus('first')
    setOpen(true)
  }, [open])

  const registerTrigger = useCallback((node) => {
    triggerRef.current = node
  }, [])

  useEffect(() => {
    if (!open) return undefined

    const handlePointerDown = (event) => {
      const portalMenu = document.getElementById(menuId)

      if (
        !wrapperRef.current?.contains(event.target) &&
        !portalMenu?.contains(event.target)
      ) {
        setOpen(false)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        close(true)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, close, menuId])

  const context = {
    open,
    close,
    openMenu,
    toggle,
    registerTrigger,
    triggerRef,
    initialFocus,
    menuId,
    align,
    menuLabel,
    portal,
  }

  return (
    <div
      ref={wrapperRef}
      className={['ui-dropdown', className].filter(Boolean).join(' ')}
    >
      <DropdownContext.Provider value={context}>
        {children}
      </DropdownContext.Provider>
    </div>
  )
}

export function DropdownTrigger({
  children,
  variant = 'secondary',
  size = 'md',
  leadingIcon,
  trailingIcon,
  className = '',
  onClick,
  onKeyDown,
  ...props
}) {
  const { open, toggle, openMenu, close, registerTrigger, menuId } =
    useDropdownContext()

  return (
    <Button
      ref={registerTrigger}
      variant={variant}
      size={size}
      leadingIcon={leadingIcon}
      trailingIcon={trailingIcon}
      className={className}
      aria-haspopup="menu"
      aria-expanded={open}
      aria-controls={open ? menuId : undefined}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) toggle()
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event)
        if (event.defaultPrevented) return

        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault()

          if (!open) {
            openMenu(event.key === 'ArrowUp' ? 'last' : 'first')
          }
        } else if (event.key === 'Escape' && open) {
          event.preventDefault()
          close(true)
        }
      }}
      {...props}
    >
      {children}
    </Button>
  )
}

export function DropdownMenu({ children, className = '' }) {
  const {
    open,
    close,
    initialFocus,
    menuId,
    align,
    menuLabel,
    portal,
    triggerRef,
  } = useDropdownContext()
  const menuRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    const frame = window.requestAnimationFrame(() => {
      const items = menuRef.current?.querySelectorAll(
        '[role="menuitem"]:not([disabled])',
      )

      if (!items?.length) return

      const target = initialFocus === 'last' ? items[items.length - 1] : items[0]
      target.focus()
    })

    return () => window.cancelAnimationFrame(frame)
  }, [open, initialFocus])

  useLayoutEffect(() => {
    if (!open || !portal) return undefined

    const menu = menuRef.current
    const trigger = triggerRef.current

    if (!menu || !trigger) return undefined

    const positionMenu = () => {
      const triggerRect = trigger.getBoundingClientRect()
      const menuRect = menu.getBoundingClientRect()
      const gap = 4
      const padding = 8

      let top = triggerRect.bottom + gap

      if (top + menuRect.height > window.innerHeight - padding) {
        top = triggerRect.top - menuRect.height - gap
      }

      top = Math.max(
        padding,
        Math.min(
          top,
          Math.max(padding, window.innerHeight - menuRect.height - padding),
        ),
      )

      let left =
        align === 'start'
          ? triggerRect.left
          : triggerRect.right - menuRect.width

      left = Math.max(
        padding,
        Math.min(
          left,
          Math.max(padding, window.innerWidth - menuRect.width - padding),
        ),
      )

      menu.style.top = `${top}px`
      menu.style.left = `${left}px`
      menu.style.visibility = 'visible'
    }

    menu.style.visibility = 'hidden'
    positionMenu()

    window.addEventListener('resize', positionMenu)
    window.addEventListener('scroll', positionMenu, true)

    return () => {
      window.removeEventListener('resize', positionMenu)
      window.removeEventListener('scroll', positionMenu, true)
    }
  }, [open, portal, align, triggerRef])

  const handleKeyDown = (event) => {
    const items = Array.from(
      menuRef.current?.querySelectorAll(
        '[role="menuitem"]:not([disabled])',
      ) ?? [],
    )

    if (items.length === 0) return

    const currentIndex = items.indexOf(document.activeElement)

    if (event.key === 'Tab') {
      event.preventDefault()
      close(true)
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      items[(currentIndex + 1) % items.length]?.focus()
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      items[(currentIndex - 1 + items.length) % items.length]?.focus()
    } else if (event.key === 'Home') {
      event.preventDefault()
      items[0]?.focus()
    } else if (event.key === 'End') {
      event.preventDefault()
      items[items.length - 1]?.focus()
    }
  }

  if (!open) return null

  const menu = (
    <div
      ref={menuRef}
      id={menuId}
      className={[
        'ui-dropdown__menu',
        `ui-dropdown__menu--${align}`,
        portal && 'ui-dropdown__menu--portal',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={
        portal
          ? { position: 'fixed', top: 0, left: 0, visibility: 'hidden' }
          : undefined
      }
      role="menu"
      aria-label={menuLabel}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  )

  return portal ? createPortal(menu, document.body) : menu
}

export function DropdownItem({
  children,
  icon,
  shortcut,
  danger = false,
  disabled = false,
  onSelect,
  className = '',
  ...props
}) {
  const { close } = useDropdownContext()

  return (
    <button
      type="button"
      role="menuitem"
      className={[
        'ui-dropdown__item',
        danger && 'ui-dropdown__item--danger',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      disabled={disabled}
      onClick={(event) => {
        onSelect?.(event)
        if (!event.defaultPrevented) {
          close(true)
        }
      }}
      {...props}
    >
      {icon && (
        <span className="ui-dropdown__item-icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="ui-dropdown__item-label">{children}</span>
      {shortcut && <span className="ui-dropdown__shortcut">{shortcut}</span>}
    </button>
  )
}

export function DropdownSeparator() {
  return <div className="ui-dropdown__separator" role="separator" />
}

export function DropdownLabel({ children }) {
  return <div className="ui-dropdown__label">{children}</div>
}

export default Dropdown
