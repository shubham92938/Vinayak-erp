import Select from '../ui/Select/Select'
import './filters.css'

/**
 * Internal shared implementation for the single-select filter components.
 */
function SelectFilter({
  label,
  value,
  onChange,
  options = [],
  allLabel,
  allValue = 'all',
  ariaLabel,
  className = '',
}) {
  const selectOptions = [
    ...(allLabel ? [{ value: allValue, label: allLabel }] : []),
    ...options,
  ]

  return (
    <Select
      label={label}
      size="sm"
      options={selectOptions}
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
      placeholder=""
      containerClassName={['filter-select', className]
        .filter(Boolean)
        .join(' ')}
      aria-label={ariaLabel || label}
    />
  )
}

export default SelectFilter
