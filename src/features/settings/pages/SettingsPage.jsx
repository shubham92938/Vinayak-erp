import { useState } from 'react'
import { Button, Card, CardBody, Select, useToast } from '../../../components/ui'
import { FormActions, FormField, FormGrid, FormInput, FormSection } from '../../../components/forms'
import { mockFinancialSettings } from '../../../core/store'
import { useFirmContext } from '../../../context/hooks'
import '../styles/settings.css'

const SETTINGS_TABS = ['General', 'Firm', 'Financial', 'Inventory', 'Document', 'Profile']

export default function SettingsPage() {
  const [section, setSection] = useState('General')

  return (
    <div className="settings-page">
      <header className="settings-header">
        <div className="settings-header__text">
          <p className="settings-header__eyebrow"><span aria-hidden="true">#</span> Settings</p>
          <h1 className="settings-header__title">Settings</h1>
          <p className="settings-header__description">Configure this ERP — firm, financials, inventory, documents and your profile.</p>
        </div>
      </header>

      <div className="settings-section-tabs">
        {SETTINGS_TABS.map((name) => (
          <button
            key={name}
            type="button"
            className={['settings-section-tab', section === name && 'settings-section-tab--active'].filter(Boolean).join(' ')}
            onClick={() => setSection(name)}
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
  businessName: 'Vinayak Associates',
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
              <FormInput type="url" placeholder="https://vinayakassociates.in" value={form.website} onChange={(event) => setForm((current) => ({ ...current, website: event.target.value }))} />
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

  return (
    <SettingsCard title="Profile" subtitle="Edit your account details">
      <form className="settings-form" onSubmit={(event) => { event.preventDefault(); toast.success('Profile saved.') }} noValidate>
        <FormSection>
          <FormGrid>
            <FormField label="Full Name">
              <FormInput defaultValue="Vinayak Associates Admin" aria-label="Full name" />
            </FormField>
            <FormField label="Role">
              <FormInput defaultValue="Super Admin" aria-label="Role" readOnly />
            </FormField>
          </FormGrid>
          <FormField label="Email">
            <FormInput type="email" defaultValue="admin@vinayakassociates.in" aria-label="Email" />
          </FormField>
          <FormActions>
            <Button type="submit" variant="primary">Save Profile</Button>
          </FormActions>
        </FormSection>
      </form>
    </SettingsCard>
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
