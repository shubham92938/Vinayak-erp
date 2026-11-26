import { useState } from 'react'
import { Menu, PanelLeftClose, PanelLeftOpen, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button, Input } from '../../ui'
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs'
import FirmSwitcher from '../FirmSwitcher/FirmSwitcher'
import NotificationButton from '../NotificationButton/NotificationButton'
import ThemeToggle from '../../theme/ThemeToggle'
import UserMenu from '../UserMenu/UserMenu'
import './Topbar.css'

export default function Topbar({ collapsed, isMobile, onToggleSidebar }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const ToggleIcon = isMobile
    ? Menu
    : collapsed
      ? PanelLeftOpen
      : PanelLeftClose

  const toggleLabel = isMobile
    ? 'Open navigation'
    : collapsed
      ? 'Expand sidebar'
      : 'Collapse sidebar'

  const handleSearch = (event) => {
    event.preventDefault()
    const value = query.trim()
    navigate(value ? `/search?q=${encodeURIComponent(value)}` : '/search')
  }

  return (
    <header className="app-topbar">
      <div className="app-topbar__start">
        <Button
          variant="ghost"
          iconOnly
          className="app-sidebar-toggle"
          onClick={onToggleSidebar}
          aria-label={toggleLabel}
          title={toggleLabel}
        >
          <ToggleIcon size={18} strokeWidth={1.9} aria-hidden="true" />
        </Button>
        <FirmSwitcher />
        <div className="app-topbar__breadcrumbs">
          <Breadcrumbs />
        </div>
      </div>

      <div className="app-topbar__end">
        <form className="topbar-search" role="search" onSubmit={handleSearch}>
          <Input
            size="sm"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search anything..."
            aria-label="Search workspace"
            leadingIcon={<Search size={16} />}
            containerClassName="topbar-search__field"
          />
        </form>

        <Button
          variant="ghost"
          iconOnly
          className="topbar-search__mobile"
          onClick={() => navigate('/search')}
          aria-label="Search workspace"
          title="Search workspace"
        >
          <Search size={18} strokeWidth={1.8} aria-hidden="true" />
        </Button>

        <NotificationButton />
        <ThemeToggle className="topbar-theme-toggle" />
        <UserMenu />
      </div>
    </header>
  )
}
