import { createPortal } from 'react-dom'

export default function SidebarTooltip({ label, top, left }) {
  return createPortal(
    <div
      className="app-sidebar-tooltip"
      role="tooltip"
      style={{ top, left }}
    >
      {label}
    </div>,
    document.body,
  )
}
