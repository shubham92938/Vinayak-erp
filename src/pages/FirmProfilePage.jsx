import { useState } from 'react'
import { ArrowLeft, Building2, CheckCircle2, Edit3, FileText, MapPin, Phone, Mail } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { Badge, Button, Card, CardBody, useToast } from '../components/ui'
import { getFirmById, updateFirm } from '../core/firmStore'
import { canEditFirm } from '../core/accessControl'
import { useAuth, useFirmContext } from '../context/hooks'
import FirmForm from './FirmForm'
import './FirmProfilePage.css'

function Detail({ label, value, icon: Icon }) {
  return (
    <div className="firm-profile__detail">
      <dt>{Icon && <Icon size={14} aria-hidden="true" />}{label}</dt>
      <dd>{value || '—'}</dd>
    </div>
  )
}

export default function FirmProfilePage() {
  const navigate = useNavigate()
  const { firmId } = useParams()
  const { currentUser } = useAuth()
  useFirmContext()
  const toast = useToast()
  const [showEdit, setShowEdit] = useState(false)
  const firm = getFirmById(firmId)
  const canEdit = canEditFirm(currentUser, firmId)

  if (!firm) return null

  const handleSave = (firmData) => {
    // FirmForm validates and normalizes before this centralized update. All
    // cards, profile views and existing label helpers read this same record.
    const updated = updateFirm(firmId, firmData)
    if (!updated) throw new Error('Firm could not be found')
    toast.success('Firm details updated')
  }

  return (
    <div className="firm-profile-page">
      <header className="firm-profile__header">
        <div>
          <button type="button" className="firm-profile__back" onClick={() => navigate('/home')}>
            <ArrowLeft size={15} aria-hidden="true" /> Back to My Firms
          </button>
          <p className="firm-profile__eyebrow"><Building2 size={14} aria-hidden="true" /> My Firm</p>
          <div className="firm-profile__title-row">
            <div className="firm-profile__title-icon" aria-hidden="true">{firm.initials}</div>
            <div>
              <h1>{firm.name}</h1>
              <p>{firm.firmId ?? firm.id} · {firm.businessType ?? firm.entity}</p>
            </div>
          </div>
        </div>
        {canEdit && (
          <Button leadingIcon={<Edit3 size={15} />} onClick={() => setShowEdit(true)}>Edit Firm Details</Button>
        )}
      </header>

      <Card className="firm-profile__card">
        <CardBody>
          <div className="firm-profile__card-heading">
            <div>
              <h2>Firm information</h2>
              <p>Centralized details for this firm and its workspace.</p>
            </div>
            <Badge variant={firm.status === 'active' ? 'success' : 'warning'} dot>
              {firm.status === 'active' ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <dl className="firm-profile__grid">
            <Detail label="Firm Name" value={firm.name} />
            <Detail label="Firm ID" value={firm.firmId ?? firm.id} />
            <Detail label="Business Type" value={firm.businessType ?? firm.entity} />
            <Detail label="Contact Person" value={firm.contactPerson} />
            <Detail label="Phone" value={firm.phone} icon={Phone} />
            <Detail label="Email" value={firm.email} icon={Mail} />
            <Detail label="Address" value={firm.address} icon={MapPin} />
            <Detail label="City" value={firm.city ?? firm.location} />
            <Detail label="State" value={firm.state} />
            <Detail label="PIN Code" value={firm.pinCode} />
            <Detail label="GST Number" value={firm.gstNumber ?? firm.gst} icon={FileText} />
            <Detail label="PAN Number" value={firm.panNumber ?? firm.pan} icon={FileText} />
            <Detail label="Firm Status" value={firm.status === 'active' ? 'Active' : 'Inactive'} icon={CheckCircle2} />
          </dl>
        </CardBody>
      </Card>

      {showEdit && (
        <FirmForm
          mode="edit"
          firm={firm}
          onClose={() => setShowEdit(false)}
          onSubmit={handleSave}
        />
      )}
    </div>
  )
}
