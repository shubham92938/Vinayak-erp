import SelectFilter from './SelectFilter'
import { useFirmContext } from '../../context/hooks'

function FirmFilter({
  value = 'all',
  onChange,
  firms,
  label = 'Firm',
  allLabel = 'All firms',
  formatLabel,
  className = '',
}) {
  const { accessibleFirms } = useFirmContext()
  const optionsFirms = firms ?? accessibleFirms
  const options = optionsFirms.map((firm) => ({
    value: firm.id,
    label: formatLabel
      ? formatLabel(firm)
      : firm.location
        ? `${firm.name} \u00b7 ${firm.location}`
        : firm.name,
  }))

  return (
    <SelectFilter
      label={label}
      value={value}
      onChange={onChange}
      options={options}
      allLabel={allLabel}
      className={['firm-filter', className].filter(Boolean).join(' ')}
    />
  )
}

export default FirmFilter
