import SelectFilter from './SelectFilter'
import { SAMPLE_FIRMS } from '../../config/firms'

function FirmFilter({
  value = 'all',
  onChange,
  firms = SAMPLE_FIRMS,
  label = 'Firm',
  allLabel = 'All firms',
  formatLabel,
  className = '',
}) {
  const options = firms.map((firm) => ({
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
