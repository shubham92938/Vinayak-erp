import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Building2, LogOut, MapPin, Plus, Search, ShieldCheck } from 'lucide-react'
import BrandLockup from '../components/brand/BrandLockup'
import ThemeToggle from '../components/theme/ThemeToggle'
import { Button, Input, useToast } from '../components/ui'
import { getFirmId } from '../config/firms'
import { canCreateFirm } from '../core/accessControl'
import { createFirmWithAdmin } from '../core/firmStore'
import { useAuth, useFirmContext } from '../context/hooks'
import FirmForm from './FirmForm'
import './HomePage.css'

function FirmCard({ firm, onOpen }) {
  const isInactive = firm.status === 'inactive'

  const handleKeyDown = (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    if (!isInactive) onOpen(firm)
  }

  return (
    <article
      className={['firm-card', isInactive && 'firm-card--inactive'].filter(Boolean).join(' ')}
      role="button"
      tabIndex={isInactive ? -1 : 0}
      aria-disabled={isInactive || undefined}
      aria-label={`${firm.name}, ${firm.businessType}, ${firm.city}`}
      onClick={() => !isInactive && onOpen(firm)}
      onKeyDown={handleKeyDown}
    >
      <div className="firm-card__topline">
        <div className="firm-card__icon" aria-hidden="true">{firm.initials}</div>
        {isInactive && <span className="firm-card__status">Inactive</span>}
      </div>
      <h2 className="firm-card__name">{firm.name}</h2>
      <dl className="firm-card__details">
        <div>
          <dt>Associated</dt>
          <dd>{firm.contactPerson || '—'}</dd>
        </div>
        <div>
          <dt>Business Type</dt>
          <dd>{firm.businessType || firm.entity || '—'}</dd>
        </div>
        <div>
          <dt>City</dt>
          <dd><MapPin size={11} aria-hidden="true" />{firm.city || firm.location || '—'}</dd>
        </div>
      </dl>
      <span className="firm-card__more">...view more (6)</span>
      <span className="firm-card__open">Open workspace <span aria-hidden="true">→</span></span>
    </article>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const { currentUser, logout } = useAuth()
  const { accessibleFirms, selectFirm } = useFirmContext()
  const [search, setSearch] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)

  useEffect(() => {
    if (!location.state?.accessDenied) return
    toast.error('Access denied', { description: location.state.message })
    navigate('/home', { replace: true, state: null })
  }, [location.state, navigate, toast])

  const visibleFirms = useMemo(() => {
    const query = search.trim().toLowerCase()
    const orderedFirms = [...accessibleFirms].sort((first, second) =>
      String(first.name ?? '').localeCompare(String(second.name ?? '')),
    )
    if (!query) return orderedFirms
    return orderedFirms.filter((firm) =>
      [firm.name, firm.businessType, firm.city, firm.state, getFirmId(firm)]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query),
    )
  }, [accessibleFirms, search])

  const handleOpenFirm = (firm) => {
    const firmId = getFirmId(firm)
    if (!firmId) return
    // Home owns selection so every workspace entry has an explicit context.
    selectFirm(firmId)
    navigate(`/firms/${firmId}/workspace`)
  }

  return (
    <div className="firm-home">
      <header className="firm-home__topbar">
        <a href="/home" className="firm-home__brand" aria-label="Vinayak ERP home">
          <BrandLockup compact size="sm" />
        </a>
        <div className="firm-home__userbar">
          <ThemeToggle />
          <span className="firm-home__user">
            <span className="firm-home__user-avatar">{currentUser?.name?.slice(0, 2).toUpperCase() ?? 'U'}</span>
            <span>
              <strong>{currentUser?.name}</strong>
              <small>{currentUser?.role === 'super_admin' ? 'Super Admin' : currentUser?.role?.replaceAll('_', ' ')}</small>
            </span>
          </span>
          <Button variant="ghost" size="sm" leadingIcon={<LogOut size={15} />} onClick={logout}>Logout</Button>
        </div>
      </header>

      <main className="firm-home__main">
        <div className="firm-home__heading-row">
          <div>
            <p className="firm-home__eyebrow"><Building2 size={14} aria-hidden="true" /> Workspace selection</p>
            <h1>My Firms</h1>
            <p className="firm-home__description">
              Choose a firm to open its ERP workspace. Your firm access and permissions determine what you can see.
            </p>
          </div>
          {canCreateFirm(currentUser) && (
            <Button leadingIcon={<Plus size={16} />} onClick={() => setShowCreateForm(true)}>
              Create New Firm
            </Button>
          )}
        </div>

        <div className="firm-home__toolbar">
          <Input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search firms"
            aria-label="Search firms"
            leadingIcon={<Search size={16} />}
            containerClassName="firm-home__search"
          />
          <span className="firm-home__count"><ShieldCheck size={14} aria-hidden="true" /> {accessibleFirms.length} accessible {accessibleFirms.length === 1 ? 'firm' : 'firms'}</span>
        </div>

        {visibleFirms.length > 0 ? (
          <div className="firm-card-grid">
            {visibleFirms.map((firm) => (
              <FirmCard key={getFirmId(firm)} firm={firm} onOpen={handleOpenFirm} />
            ))}
          </div>
        ) : (
          <section className="firm-home__empty" aria-live="polite">
            <span className="firm-home__empty-icon"><Building2 size={22} aria-hidden="true" /></span>
            <h2>{accessibleFirms.length === 0 ? 'No firms are available' : 'No firms found'}</h2>
            <p>{accessibleFirms.length === 0 ? 'A Super Admin can create a firm and assign access to you.' : 'Try a different search term.'}</p>
            {canCreateFirm(currentUser) && accessibleFirms.length === 0 && (
              <Button size="sm" leadingIcon={<Plus size={15} />} onClick={() => setShowCreateForm(true)}>Create New Firm</Button>
            )}
          </section>
        )}
      </main>

      {showCreateForm && (
        <FirmForm
          mode="create"
          onClose={() => setShowCreateForm(false)}
          onSubmit={(firmData, adminData) => createFirmWithAdmin(firmData, adminData)}
        />
      )}
    </div>
  )
}
