import ClearFiltersButton from './ClearFiltersButton'
import './filters.css'

function FilterBar({
  children,
  onClear,
  activeCount = 0,
  clearLabel,
  actions,
  ariaLabel = 'Table filters',
  className = '',
}) {
  const hasActions = Boolean(actions) || typeof onClear === 'function'

  return (
    <div
      className={['filter-bar', className].filter(Boolean).join(' ')}
      role="group"
      aria-label={ariaLabel}
    >
      <div className="filter-bar__fields">{children}</div>

      {hasActions && (
        <div className="filter-bar__actions">
          {actions}
          {typeof onClear === 'function' && (
            <ClearFiltersButton
              onClear={onClear}
              activeCount={activeCount}
              disabled={activeCount === 0}
              label={clearLabel}
            />
          )}
        </div>
      )}
    </div>
  )
}

export default FilterBar
