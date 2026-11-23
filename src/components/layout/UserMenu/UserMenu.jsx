import { useNavigate } from 'react-router-dom'
import {
  ChevronDown,
  LogOut,
  Settings,
  UserRound,
} from 'lucide-react'
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSeparator,
  DropdownTrigger,
  useToast,
} from '../../ui'
import './UserMenu.css'

const CURRENT_USER = {
  name: 'Aarav Mehta',
  role: 'Administrator',
  email: 'aarav@vinayak.co',
  initials: 'AM',
}

export default function UserMenu() {
  const navigate = useNavigate()
  const { info } = useToast()

  const handleLogout = () => {
    info('Logout is not connected yet', {
      description:
        'Authentication arrives in a later step. This preview keeps you signed in.',
    })
  }

  return (
    <Dropdown align="end" menuLabel="User menu" className="user-menu">
      <DropdownTrigger
        variant="ghost"
        className="user-menu__trigger"
        aria-label={`Open user menu for ${CURRENT_USER.name}`}
        leadingIcon={
          <span className="user-menu__avatar" aria-hidden="true">
            {CURRENT_USER.initials}
          </span>
        }
        trailingIcon={<ChevronDown size={14} />}
      >
        <span className="user-menu__meta">
          <span className="user-menu__name">{CURRENT_USER.name}</span>
          <span className="user-menu__role">{CURRENT_USER.role}</span>
        </span>
      </DropdownTrigger>

      <DropdownMenu className="user-menu__menu">
        <div className="user-menu__summary">
          <span className="user-menu__avatar user-menu__avatar--lg" aria-hidden="true">
            {CURRENT_USER.initials}
          </span>
          <div className="user-menu__summary-text">
            <p className="user-menu__summary-name">{CURRENT_USER.name}</p>
            <p className="user-menu__summary-email">{CURRENT_USER.email}</p>
          </div>
        </div>

        <DropdownSeparator />

        <DropdownItem
          icon={<UserRound size={15} />}
          onSelect={() => navigate('/profile')}
        >
          My Profile
        </DropdownItem>
        <DropdownItem
          icon={<Settings size={15} />}
          onSelect={() => navigate('/settings/account')}
        >
          Account Settings
        </DropdownItem>

        <DropdownSeparator />

        <DropdownItem
          danger
          icon={<LogOut size={15} />}
          onSelect={handleLogout}
        >
          Logout
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  )
}
