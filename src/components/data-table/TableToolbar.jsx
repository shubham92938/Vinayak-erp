import Button from '../ui/Button/Button'
import SearchInput from '../filters/SearchInput'

function TableToolbar({
  searchable = true,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  searchLabel,
  filters,
  actions,
  selectable = false,
  selectedCount = 0,
  selectedRows = [],
  bulkActions,
  onClearSelection,
}) {
  const hasSearch = searchable
  const hasActions = Boolean(actions)
  const showSelection = selectable && selectedCount > 0
  const bulkContent =
    typeof bulkActions === 'function'
      ? bulkActions(selectedRows)
      : bulkActions

  if (!hasSearch && !filters && !hasActions && !showSelection) {
    return null
  }

  return (
    <>
      <div className="data-table__toolbar">
        <div className="data-table__toolbar-main">
          {hasSearch && (
            <SearchInput
              value={searchValue}
              onChange={onSearchChange}
              placeholder={searchPlaceholder}
              label={searchLabel}
              containerClassName="data-table__search"
            />
          )}

          {filters && (
            <div className="data-table__toolbar-filters">
              {filters}
            </div>
          )}
        </div>

        {hasActions && (
          <div className="data-table__toolbar-actions">
            {actions}
          </div>
        )}
      </div>

      {showSelection && (
        <div className="data-table__selection" role="status">
          <span className="data-table__selection-count">
            <strong>{selectedCount}</strong> selected
          </span>

          <div className="data-table__selection-actions">
            {bulkContent}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
            >
              Clear selection
            </Button>
          </div>
        </div>
      )}
    </>
  )
}

export default TableToolbar
