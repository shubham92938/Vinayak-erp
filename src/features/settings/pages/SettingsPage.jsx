import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button, Card, CardBody, Select, useToast } from '../../../components/ui'
import { FormActions, FormField, FormGrid, FormInput, FormSection } from '../../../components/forms'
import { mockFinancialSettings } from '../../../core/store'
import { useAuth, useFirmContext } from '../../../context/hooks'
import '../styles/settings.css'

const SETTINGS_TABS = ['General', 'Firm', 'Financial', 'Inventory', 'Document', 'Profile']

const SECTION_PATHS = {
  General: '/settings/general',
  Firm: '/settings/firm',
  Financial: '/settings/financial',
  Inventory: '/settings/inventory',
  Document: '/settings/document',
  Profile: '/profile',
}

function sectionFromPath(pathname) {
  if (pathname === '/profile' || pathname === '/settings/account' || pathname === '/settings/profile') return 'Profile'
  const match = Object.entries(SECTION_PATHS).find(([, path]) => pathname === path || pathname.endsWith(path))
  return match?.[0] ?? 'General'
}

function getSectionPath(name, pathname) {
  const workspacePrefix = pathname.match(/^\/firms\/[^/]+\/workspace/)?.[0]
  if (workspacePrefix && name !== 'Profile') return `${workspacePrefix}${SECTION_PATHS[name]}`
  return SECTION_PATHS[name]
}

export default function SettingsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const section = useMemo(() => sectionFromPath(location.pathname), [location.pathname])

  return (
    <div className="settings-page">
      <header className="settings-header">
        <div className="settings-header__text">
          <p className="settings-header__eyebrow"><span aria-hidden="true">#</span> Settings</p>
          <h1 className="settings-header__title">{section === 'Profile' ? (location.pathname === '/settings/account' ? 'Account Settings' : 'My Profile') : 'Settings'}</h1>
          <p className="settings-header__description">{section === 'Profile' ? 'Manage your personal details and account security.' : 'Configure this ERP — firm, financials, inventory, documents and your profile.'}</p>
        </div>
      </header>

      <div className="settings-section-tabs">
        {SETTINGS_TABS.map((name) => (
          <button
            key={name}
            type="button"
            className={['settings-section-tab', section === name && 'settings-section-tab--active'].filter(Boolean).join(' ')}
            onClick={() => navigate(getSectionPath(name, location.pathname))}
          >
            {name}
          </button>
        ))}
      </div>

      {section === 'General' && <GeneralSection />}
      {section === 'Firm' && <FirmSection />}
      {section === 'Financial' && <FinancialSection />}
      {section === 'Inventory' && <InventorySection />}
      {section === 'Document' && <DocumentSection />}
      {section === 'Profile' && <ProfileSection />}
    </div>
  )
}

const GENERAL_FORM = {
  businessName: '',
  website: '',
  defaultLanguage: 'English',
  dateFormat: 'dd/MM/yyyy',
  timeZone: 'Asia/Kolkata',
}

function GeneralSection() {
  const toast = useToast()
  const { currentFirm } = useFirmContext()
  const [form, setForm] = useState(() => ({
    ...GENERAL_FORM,
    businessName: currentFirm?.name ?? GENERAL_FORM.businessName,
  }))

  const handleSave = () => {
    toast.success('Settings saved.')
  }

  return (
    <SettingsCard title="General Settings" subtitle="Business details and basic configuration">
      <form className="settings-form" onSubmit={(event) => { event.preventDefault(); handleSave() }} noValidate>
        <FormSection>
          <FormGrid>
            <FormField label="Business Name">
              <FormInput value={form.businessName} onChange={(event) => setForm((current) => ({ ...current, businessName: event.target.value }))} />
            </FormField>
            <FormField label="Website">
              <FormInput type="url" placeholder="https://your-business.example" value={form.website} onChange={(event) => setForm((current) => ({ ...current, website: event.target.value }))} />
            </FormField>
            <FormField label="Language">
              <Select value="en-IN" onChange={(event) => setForm((current) => ({ ...current, defaultLanguage: event.target.value }))} options={[{ value: 'en-IN', label: 'English (India)' }, { value: 'hi-IN', label: 'Hindi' }]} />
            </FormField>
            <FormField label="Date Format">
              <Select value={form.dateFormat} onChange={(event) => setForm((current) => ({ ...current, dateFormat: event.target.value }))} options={[{ value: 'dd/MM/yyyy', label: 'dd/MM/yyyy' }, { value: 'MM/dd/yyyy', label: 'MM/dd/yyyy' }, { value: 'yyyy-MM-dd', label: 'yyyy-MM-dd' }]} />
            </FormField>
            <FormField label="Time Zone">
              <FormInput value={form.timeZone} onChange={(event) => setForm((current) => ({ ...current, timeZone: event.target.value }))} placeholder="Asia/Kolkata" />
            </FormField>
          </FormGrid>
          <FormActions>
            <Button type="submit" variant="primary">Save General Settings</Button>
          </FormActions>
        </FormSection>
      </form>
    </SettingsCard>
  )
}

function FirmSection() {
  const toast = useToast()
  const { accessibleFirms, currentFirmId, selectFirm } = useFirmContext()
  const [selectedFirmId, setSelectedFirmId] = useState(currentFirmId ?? accessibleFirms[0]?.id ?? '')
  const [note, setNote] = useState('')

  const firms = accessibleFirms
  const selected = firms.find((firm) => firm.id === selectedFirmId) ?? firms[0]

  return (
    <SettingsCard title="Firm Settings" subtitle="Select the firm you are operating from">
      <FormField label="Active Firm" hint="All operations are scoped to the selected firm.">
        <Select
          value={selected?.id ?? ''}
          onChange={(event) => setSelectedFirmId(event.target.value)}
          options={firms.map((firm) => ({ value: firm.id, label: firm.name }))}
        />
      </FormField>
      <div className="settings-firm-card">
        <h3>{selected?.name ?? 'No firm selected'}</h3>
        <p className="settings-firm-description">{selected?.businessType ?? selected?.entity ?? '—'}</p>
        <p><strong>Type:</strong> {selected?.businessType ?? selected?.entity ?? '—'}</p>
        <p><strong>Location:</strong> {selected?.city ?? selected?.location ?? '—'}</p>
      </div>
      <FormField label="Notes">
        <FormInput value={note} onChange={(event) => setNote(event.target.value)} placeholder="Switch firms when auditing or switching books" />
      </FormField>
      <FormActions>
        <Button
          type="button"
          variant="primary"
          disabled={!selected}
          onClick={() => {
            if (!selected) return
            selectFirm(selected.id)
            toast.success(`Now using ${selected.name}`)
          }}
        >
          Switch to Selected Firm
        </Button>
      </FormActions>
    </SettingsCard>
  )
}

function FinancialSection() {
  const toast = useToast()
  const [financial, setFinancial] = useState(mockFinancialSettings)

  const handleSave = () => toast.success('Financial settings saved.')

  return (
    <SettingsCard title="Financial Settings" subtitle="Currencies, tax rates, payment modes">
      <form className="settings-form" onSubmit={(event) => { event.preventDefault(); handleSave() }} noValidate>
        <FormSection>
          <FormGrid>
            <FormField label="Currency">
              <Select value={financial.currency} onChange={(event) => setFinancial((current) => ({ ...current, currency: event.target.value }))} options={[{ value: 'INR', label: 'Indian Rupee (₹)' }, { value: 'USD', label: 'US Dollar ($)' }]} />
            </FormField>
            <FormField label="Currency Symbol">
              <FormInput value={financial.currencySymbol} onChange={(event) => setFinancial((current) => ({ ...current, currencySymbol: event.target.value }))} />
            </FormField>
            <FormField label="Date Format">
              <Select value={financial.dateFormat} onChange={(event) => setFinancial((current) => ({ ...current, dateFormat: event.target.value }))} options={[{ value: 'dd/MM/yyyy', label: 'dd/MM/yyyy' }, { value: 'MM/dd/yyyy', label: 'MM/dd/yyyy' }]} />
            </FormField>
            <FormField label="Financial Year">
              <FormInput value={financial.financialYear} onChange={(event) => setFinancial((current) => ({ ...current, financialYear: event.target.value }))} />
            </FormField>
          </FormGrid>
          <FormField label="GST Rate">
            <FormInput type="number" value={financial.taxRates.gst} onChange={(event) => setFinancial((current) => ({ ...current, taxRates: { ...current.taxRates, gst: Number(event.target.value) } }))} placeholder="18" />
          </FormField>
          <FormActions>
            <Button type="submit" variant="primary">Save Financial Settings</Button>
          </FormActions>
        </FormSection>
      </form>
    </SettingsCard>
  )
}

function InventorySection() {
  const toast = useToast()

  return (
    <SettingsCard title="Inventory Settings" subtitle="Stock thresholds and reorder alerts">
      <form className="settings-form" onSubmit={(event) => { event.preventDefault(); toast.success('Inventory settings saved.') }} noValidate>
        <FormSection>
          <FormField label="Low Stock Minimum (units)" hint="Products below this level trigger notifications.">
            <FormInput type="number" defaultValue="5" aria-label="Low stock minimum" />
          </FormField>
          <FormField label="Auto-Expire Stock">
            <Select value="Enabled" onChange={() => {}} options={[{ value: 'Enabled', label: 'Enabled' }, { value: 'Disabled', label: 'Disabled' }]} />
          </FormField>
          <FormActions>
            <Button type="submit" variant="primary">Save Inventory Settings</Button>
          </FormActions>
        </FormSection>
      </form>
    </SettingsCard>
  )
}

function DocumentSection() {
  const toast = useToast()

  return (
    <SettingsCard title="Document Settings" subtitle="Invoice, quotation and purchase order numbering">
      <form className="settings-form" onSubmit={(event) => { event.preventDefault(); toast.success('Document settings saved.') }} noValidate>
        <FormSection>
          <FormGrid>
            <FormField label="Invoice Prefix">
              <FormInput defaultValue="INV" aria-label="Invoice prefix" />
            </FormField>
            <FormField label="Quotation Prefix">
              <FormInput defaultValue="QUOT" aria-label="Quotation prefix" />
            </FormField>
            <FormField label="Sales Order Prefix">
              <FormInput defaultValue="SO" aria-label="Sales order prefix" />
            </FormField>
            <FormField label="Purchase Order Prefix">
              <FormInput defaultValue="PO" aria-label="Purchase order prefix" />
            </FormField>
          </FormGrid>
          <FormActions>
            <Button type="submit" variant="primary">Save Document Settings</Button>
          </FormActions>
        </FormSection>
      </form>
    </SettingsCard>
  )
}

function ProfileSection() {
  const toast = useToast()
  const location = useLocation()
  const { currentUser, updateProfile, updatePassword } = useAuth()
  const isAccountSettings = location.pathname === '/settings/account'
  const [form, setForm] = useState(() => ({
    name: currentUser?.name ?? '',
    email: currentUser?.email ?? '',
  }))
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' })

  const handleSave = () => {
    const name = form.name.trim()
    const email = form.email.trim().toLowerCase()
    if (name.length < 2) {
      toast.error('Enter your full name.')
      return
    }
    if (!email || !email.includes('@')) {
      toast.error('Enter a valid email address.')
      return
    }
    try {
      updateProfile({ name, email })
      toast.success('Profile saved.')
    } catch (error) {
      toast.error(error?.message ?? 'Unable to save your profile.')
    }
  }

  const handlePasswordChange = () => {
    if (passwordForm.next !== passwordForm.confirm) {
      toast.error('New passwords do not match.')
      return
    }
    try {
      updatePassword(passwordForm.current, passwordForm.next)
      setPasswordForm({ current: '', next: '', confirm: '' })
      toast.success('Password updated.')
    } catch (error) {
      toast.error(error?.message ?? 'Unable to update your password.')
    }
  }

  return (
    <>
      <SettingsCard title={isAccountSettings ? 'Account Settings' : 'My Profile'} subtitle={isAccountSettings ? 'Manage your sign-in details and account security' : 'Keep your account details up to date'}>
        <form className="settings-form" onSubmit={(event) => { event.preventDefault(); handleSave() }} noValidate>
          <FormSection>
            <div className="settings-profile-summary">
              <div className="settings-profile-avatar" aria-hidden="true">{(form.name || 'U').slice(0, 1).toUpperCase()}</div>
              <div>
                <strong>{form.name || 'Your profile'}</strong>
                <span>{currentUser?.role ?? 'Workspace user'}</span>
              </div>
            </div>
            <FormGrid>
              <FormField label="Full Name">
                <FormInput value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} aria-label="Full name" autoComplete="name" />
              </FormField>
              <FormField label="Role">
                <FormInput value={currentUser?.role ?? ''} aria-label="Role" readOnly />
              </FormField>
            </FormGrid>
            <FormField label="Email">
              <FormInput type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} aria-label="Email" autoComplete="email" />
            </FormField>
            <FormActions>
              <Button type="submit" variant="primary">Save Profile</Button>
            </FormActions>
          </FormSection>
        </form>
      </SettingsCard>
      {isAccountSettings && (
        <SettingsCard title="Password & Security" subtitle="Use a strong password to protect your workspace account">
          <form className="settings-form" onSubmit={(event) => { event.preventDefault(); handlePasswordChange() }} noValidate>
            <FormGrid>
              <FormField label="Current Password">
                <FormInput type="password" value={passwordForm.current} onChange={(event) => setPasswordForm((current) => ({ ...current, current: event.target.value }))} autoComplete="current-password" />
              </FormField>
              <FormField label="New Password" hint="At least 6 characters">
                <FormInput type="password" value={passwordForm.next} onChange={(event) => setPasswordForm((current) => ({ ...current, next: event.target.value }))} autoComplete="new-password" />
              </FormField>
              <FormField label="Confirm New Password">
                <FormInput type="password" value={passwordForm.confirm} onChange={(event) => setPasswordForm((current) => ({ ...current, confirm: event.target.value }))} autoComplete="new-password" />
              </FormField>
            </FormGrid>
            <FormActions>
              <Button type="submit" variant="secondary">Update Password</Button>
            </FormActions>
          </form>
        </SettingsCard>
      )}
    </>
  )
}

function SettingsCard({ title, subtitle, children }) {
  return (
    <Card className="settings-card">
      <CardBody>
        <div className="settings-card__header">
          <div>
            <h3 className="settings-card__title">{title}</h3>
            {subtitle && <p className="settings-card__subtitle">{subtitle}</p>}
          </div>
        </div>
        {children}
      </CardBody>
    </Card>
  )
}
