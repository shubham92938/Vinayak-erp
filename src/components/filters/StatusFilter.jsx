import SelectFilter from './SelectFilter'

function StatusFilter({
  value = 'all',
  onChange,
  options = [],
  label = 'Status',
  allLabel = 'All statuses',
  className = '',
}) {
  return (
    <SelectFilter
      label={label}
      value={value}
      onChange={onChange}
      options={options}
      allLabel={allLabel}
      className={['status-filter', className].filter(Boolean).join(' ')}
    />
  )
}

export default StatusFilter
