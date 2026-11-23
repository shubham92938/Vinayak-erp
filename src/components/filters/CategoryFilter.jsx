import SelectFilter from './SelectFilter'

function CategoryFilter({
  value = 'all',
  onChange,
  options = [],
  label = 'Category',
  allLabel = 'All categories',
  className = '',
}) {
  const normalizedOptions = options.map((option) =>
    typeof option === 'string' ? { value: option, label: option } : option,
  )

  return (
    <SelectFilter
      label={label}
      value={value}
      onChange={onChange}
      options={normalizedOptions}
      allLabel={allLabel}
      className={['category-filter', className].filter(Boolean).join(' ')}
    />
  )
}

export default CategoryFilter
