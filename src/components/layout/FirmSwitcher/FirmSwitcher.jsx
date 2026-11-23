import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Check, ChevronDown, Info } from 'lucide-react'
import {
  Dropdown,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
  DropdownSeparator,
  DropdownTrigger,
  useToast,
} from '../../ui'
import { DEFAULT_FIRM_ID, SAMPLE_FIRMS } from '../../../config/firms'
import './FirmSwitcher.css'

export default function FirmSwitcher() {
  const navigate = useNavigate()
  const { info } = useToast()
  const [activeFirmId, setActiveFirmId] = useState(DEFAULT_FIRM_ID)
  const activeFirm =
    SAMPLE_FIRMS.find((firm) => firm.id === activeFirmId) ?? SAMPLE_FIRMS[0]

  const selectFirm = (firm) => {
    if (firm.id === activeFirmId) return

    setActiveFirmId(firm.id)
    info('Firm switched', {
      description: `${firm.name} is now the active firm in this preview.`,
    })
  }

  return (
    <Dropdown
      align="end"
      menuLabel="Switch firm"
      className="firm-switcher"
    >
      <DropdownTrigger
        variant="ghost"
        className="firm-switcher__trigger"
        aria-label={`Switch firm, current ${activeFirm.name}`}
        leadingIcon={
          <span className="firm-switcher__badge" aria-hidden="true">
            {activeFirm.initials}
          </span>
        }
        trailingIcon={<ChevronDown size={14} />}
      >
        <span className="firm-switcher__label">
          <span className="firm-switcher__name">{activeFirm.name}</span>
          <span className="firm-switcher__entity">{activeFirm.entity}</span>
        </span>
      </DropdownTrigger>

      <DropdownMenu className="firm-switcher__menu">
        <DropdownLabel>Active firm</DropdownLabel>

        {SAMPLE_FIRMS.map((firm) => (
          <DropdownItem
            key={firm.id}
            onSelect={() => selectFirm(firm)}
          >
            <span className="firm-switcher__option">
              <span className="firm-switcher__option-text">
                <span className="firm-switcher__option-name">{firm.name}</span>
                <span className="firm-switcher__option-meta">
                  {firm.entity} · {firm.location}
                </span>
              </span>
              {firm.id === activeFirmId && (
                <Check
                  className="firm-switcher__check"
                  size={15}
                  aria-hidden="true"
                />
              )}
            </span>
          </DropdownItem>
        ))}

        <DropdownSeparator />

        <DropdownItem
          icon={<Building2 size={15} />}
          onSelect={() => navigate('/firms')}
        >
          Manage firms
        </DropdownItem>

        <p className="firm-switcher__note">
          <Info size={13} aria-hidden="true" />
          <span>Sample firms for frontend preview only.</span>
        </p>
      </DropdownMenu>
    </Dropdown>
  )
}
