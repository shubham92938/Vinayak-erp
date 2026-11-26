import { useEffect, useMemo, useState } from 'react'
import { BriefcaseBusiness, CheckCircle2, Clock3, Eye, LockKeyhole, LogOut, MapPin, Plus, Search, UserRound } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import BrandLockup from '../components/brand/BrandLockup'
import ThemeToggle from '../components/theme/ThemeToggle'
import { Button, Input, useToast } from '../components/ui'
import { getFirmId } from '../config/firms'
import { canCreateFirm } from '../core/accessControl'
import { createFirmWithAdmin } from '../core/firmStore'
import { useAuth, useFirmContext } from '../context/hooks'
import FirmForm from './FirmForm'
import './HomePage.css'

function FirmCard({ firm, onOpen, onViewDetails }) {
  const isInactive = firm.status === 'inactive'
  const statusLabel = isInactive ? 'Inactive' : 'Active'

  return (
    <article className={['firm-card', isInactive && 'firm-card--inactive'].filter(Boolean).join(' ')}>
      <div className="firm-card__banner">
        <div className="firm-card__identity">
          <span className="firm-card__icon" aria-hidden="true">{firm.initials}</span>
          <div className="firm-card__identity-copy">
            <h2 className="firm-card__name">{firm.name}</h2>
            <p><MapPin size={12} aria-hidden="true" />{firm.city || firm.location || '—'}, {firm.state || 'Madhya Pradesh'}</p>
          </div>
        </div>
        <span className={['firm-card__status', isInactive && 'firm-card__status--inactive'].filter(Boolean).join('')}>
          <span aria-hidden="true" />{statusLabel}
        </span>
      </div>

      <dl className="firm-card__details">
        <div>
          <dt><BriefcaseBusiness size={14} aria-hidden="true" /> Business Type</dt>
          <dd>{firm.businessType || firm.entity || 'Trading'}</dd>
        </div>
        <div>
          <dt><UserRound size={14} aria-hidden="true" /> Contact Person</dt>
          <dd>{firm.contactPerson || '—'}</dd>
        </div>
        <div>
          <dt><Clock3 size={14} aria-hidden="true" /> Last Activity</dt>
          <dd>{firm.lastActivity || (isInactive ? 'No recent activity' : 'Available now')}</dd>
        </div>
      </dl>

      <div className="firm-card__actions">
        <Button
          size="sm"
          leadingIcon={isInactive ? <LockKeyhole size={14} /> : <BriefcaseBusiness size={14} />}
          disabled={isInactive}
          onClick={() => onOpen(firm)}
        >
          {isInactive ? 'Workspace locked' : 'Open Workspace'}
        </Button>
        <Button
          size="sm"
          variant="secondary"
          leadingIcon={<Eye size={14} />}
          onClick={() => onViewDetails(firm)}
        >
          View Details
        </Button>
      </div>
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
    selectFirm(firmId)
    navigate(`/firms/${firmId}/workspace`)
  }

  const handleViewDetails = (firm) => {
    const firmId = getFirmId(firm)
    if (firmId) navigate(`/firms/${firmId}/profile`)
  }

  return (
    <div className="firm-home">
      <header className="firm-home__topbar">
        <Link to="/home" className="firm-home__brand" aria-label="Vinayak ERP home">
          <BrandLockup compact size="sm" />
        </Link>
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
            <p className="firm-home__eyebrow"><BriefcaseBusiness size={15} aria-hidden="true" /> Workspace selection</p>
            <h1>Your Workspaces</h1>
            <p className="firm-home__description">Manage and access your business firms.</p>
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
            placeholder="Search firms..."
            aria-label="Search firms"
            leadingIcon={<Search size={16} />}
            containerClassName="firm-home__search"
          />
          <span className="firm-home__count"><CheckCircle2 size={14} aria-hidden="true" /> Total Firms: {accessibleFirms.length}</span>
        </div>

        {visibleFirms.length > 0 ? (
          <div className="firm-card-grid">
            {visibleFirms.map((firm) => (
              <FirmCard
                key={getFirmId(firm)}
                firm={firm}
                onOpen={handleOpenFirm}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        ) : (
          <section className="firm-home__empty" aria-live="polite">
            <span className="firm-home__empty-icon"><BriefcaseBusiness size={22} aria-hidden="true" /></span>
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
