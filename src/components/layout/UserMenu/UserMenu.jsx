import { ChevronDown, LogOut, Settings, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSeparator,
  DropdownTrigger,
} from '../../ui'
import { useAuth } from '../../../context/hooks'
import { getInitials } from '../../../features/users/utils/userUtils'
import './UserMenu.css'

function roleLabel(role) {
  return String(role ?? 'user')
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export default function UserMenu() {
  const navigate = useNavigate()
  const { currentUser, logout } = useAuth()
  const name = currentUser?.name ?? 'User'
  const initials = getInitials(name)

  return (
    <Dropdown align="end" menuLabel="User menu" className="user-menu">
      <DropdownTrigger
        variant="ghost"
        className="user-menu__trigger"
        aria-label={`Open user menu for ${name}`}
        leadingIcon={<span className="user-menu__avatar" aria-hidden="true">{initials}</span>}
        trailingIcon={<ChevronDown size={14} />}
      >
        <span className="user-menu__meta">
          <span className="user-menu__name">{name}</span>
          <span className="user-menu__role">{roleLabel(currentUser?.role)}</span>
        </span>
      </DropdownTrigger>

      <DropdownMenu className="user-menu__menu">
        <div className="user-menu__summary">
          <span className="user-menu__avatar user-menu__avatar--lg" aria-hidden="true">{initials}</span>
          <div className="user-menu__summary-text">
            <p className="user-menu__summary-name">{name}</p>
            <p className="user-menu__summary-email">{currentUser?.email}</p>
          </div>
        </div>
        <DropdownSeparator />
        <DropdownItem icon={<UserRound size={15} />} onSelect={() => navigate('/profile')}>My Profile</DropdownItem>
        <DropdownItem icon={<Settings size={15} />} onSelect={() => navigate('/settings/account')}>Account Settings</DropdownItem>
        <DropdownSeparator />
        <DropdownItem danger icon={<LogOut size={15} />} onSelect={logout}>Logout</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  )
}
