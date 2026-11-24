import { Building2, Check, ChevronDown, Home } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Dropdown,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
  DropdownSeparator,
  DropdownTrigger,
} from '../../ui'
import { useFirmContext } from '../../../context/hooks'
import './FirmSwitcher.css'

export default function FirmSwitcher() {
  const navigate = useNavigate()
  const { firmId: routeFirmId } = useParams()
  const { accessibleFirms, currentFirm, selectFirm } = useFirmContext()
  const activeFirm =
    currentFirm ?? accessibleFirms.find((firm) => firm.id === routeFirmId) ?? accessibleFirms[0]

  if (!activeFirm) return null

  const selectFirmForWorkspace = (firm) => {
    if (firm.id === activeFirm.id) return
    selectFirm(firm.id)
    navigate(`/firms/${firm.id}/workspace`)
  }

  return (
    <Dropdown align="end" menuLabel="Switch firm" className="firm-switcher">
      <DropdownTrigger
        variant="ghost"
        className="firm-switcher__trigger"
        aria-label={`Switch firm, current ${activeFirm.name}`}
        leadingIcon={<span className="firm-switcher__badge" aria-hidden="true">{activeFirm.initials}</span>}
        trailingIcon={<ChevronDown size={14} />}
      >
        <span className="firm-switcher__label">
          <span className="firm-switcher__name">{activeFirm.name}</span>
          <span className="firm-switcher__entity">{activeFirm.businessType ?? activeFirm.entity}</span>
        </span>
      </DropdownTrigger>

      <DropdownMenu className="firm-switcher__menu">
        <DropdownLabel>Accessible firms</DropdownLabel>
        {accessibleFirms.map((firm) => (
          <DropdownItem key={firm.id} onSelect={() => selectFirmForWorkspace(firm)}>
            <span className="firm-switcher__option">
              <span className="firm-switcher__option-text">
                <span className="firm-switcher__option-name">{firm.name}</span>
                <span className="firm-switcher__option-meta">{firm.businessType ?? firm.entity} · {firm.city ?? firm.location}</span>
              </span>
              {firm.id === activeFirm.id && <Check className="firm-switcher__check" size={15} aria-hidden="true" />}
            </span>
          </DropdownItem>
        ))}
        <DropdownSeparator />
        <DropdownItem icon={<Home size={15} />} onSelect={() => navigate('/home')}>My Firms home</DropdownItem>
        <DropdownItem icon={<Building2 size={15} />} onSelect={() => navigate(`/firms/${activeFirm.id}/profile`)}>My Firm details</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  )
}
