import { X } from 'lucide-react'
import Button from '../ui/Button/Button'
import './filters.css'

function ClearFiltersButton({
  onClear,
  disabled = false,
  activeCount = 0,
  label = 'Clear filters',
  className = '',
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      leadingIcon={<X size={14} />}
      onClick={onClear}
      disabled={disabled}
      className={['clear-filters-button', className]
        .filter(Boolean)
        .join(' ')}
      aria-label={
        activeCount > 0
          ? `${label} (${activeCount} active)`
          : label
      }
    >
      {label}
      {activeCount > 0 && (
        <span className="clear-filters-button__count">{activeCount}</span>
      )}
    </Button>
  )
}

export default ClearFiltersButton
