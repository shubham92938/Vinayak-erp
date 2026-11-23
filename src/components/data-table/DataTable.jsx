import { useMemo } from 'react'
import ActionMenu from '../ui/ActionMenu/ActionMenu'
import Button from '../ui/Button/Button'
import TableBody from './TableBody'
import TableHeader from './TableHeader'
import TablePagination from './TablePagination'
import TableToolbar from './TableToolbar'
import useDataTable from './useDataTable'
import './dataTable.css'

const defaultGetRowLabel = (row) => row?.id ?? row?.name ?? 'row'

/**
 * Reusable data table.
 *
 * columns: [{
 *   id, header, accessor, cell(row, index), sortable, sortValue, sortFn,
 *   align: 'left' | 'center' | 'right', width, minWidth, searchable, className
 * }]
 */
function DataTable({
  data = [],
  columns = [],
  getRowId,
  getRowLabel = defaultGetRowLabel,
  title,
  description,
  actions,
  toolbarActions,
  filters,
  filtersActive = false,
  onClearFilters,
  searchable = true,
  search,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  searchLabel = 'Search records',
  searchFields,
  filter,
  filterKey,
  selectable = false,
  initialSelectedIds,
  rowActions,
  actionsLabel = 'Actions',
  bulkActions,
  initialSort,
  initialPageSize = 10,
  pageSizeOptions,
  showPagination = true,
  loading = false,
  error,
  onRetry,
  errorTitle,
  emptyTitle,
  emptyDescription,
  emptyAction,
  skeletonRowCount = 6,
  stickyHeader = true,
  minWidth = 860,
  maxHeight,
  ariaLabel = 'Records',
  caption,
  className = '',
  getRowClassName,
}) {
  const tableColumns = useMemo(() => {
    const baseColumns = columns.filter(Boolean)

    if (!rowActions) return baseColumns

    return [
      ...baseColumns,
      {
        id: '__actions',
        header: actionsLabel,
        align: 'right',
        width: '56px',
        sortable: false,
        searchable: false,
        cell: (row) => {
          const items =
            typeof rowActions === 'function'
              ? rowActions(row)
              : rowActions

          return (
            <ActionMenu
              items={items}
              label={actionsLabel}
              triggerLabel={`${actionsLabel} for ${getRowLabel(row)}`}
            />
          )
        },
      },
    ]
  }, [columns, rowActions, actionsLabel, getRowLabel])

  const table = useDataTable({
    data,
    columns: tableColumns,
    getRowId,
    search,
    onSearchChange,
    searchFields,
    filter,
    filterKey,
    initialSort,
    initialPageSize,
    pageSizeOptions,
    selectable,
    initialSelectedIds,
  })

  const isFiltered =
    filtersActive || Boolean(table.searchValue.trim())
  const normalizedError = error
    ? error instanceof Error
      ? error.message
      : String(error)
    : null

  const handleClearFilters = () => {
    if (table.searchValue) table.setSearch('')
    onClearFilters?.()
  }

  const resolvedEmptyAction =
    emptyAction ??
    (isFiltered && (onClearFilters || table.searchValue) ? (
      <Button
        variant="secondary"
        size="sm"
        onClick={handleClearFilters}
      >
        Clear filters
      </Button>
    ) : null)

  const scrollStyle = maxHeight
    ? {
        maxHeight:
          typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
      }
    : undefined

  const tableStyle = {
    '--data-table-min-width':
      typeof minWidth === 'number' ? `${minWidth}px` : minWidth,
  }

  const hasHeader = Boolean(title || description || actions)

  return (
    <div className={['data-table', className].filter(Boolean).join(' ')}>
      {hasHeader && (
        <div className="data-table__header">
          <div className="data-table__header-text">
            {title && <h2 className="data-table__title">{title}</h2>}
            {description && (
              <p className="data-table__description">{description}</p>
            )}
          </div>

          {actions && (
            <div className="data-table__header-actions">{actions}</div>
          )}
        </div>
      )}

      <TableToolbar
        searchable={searchable}
        searchValue={table.searchValue}
        onSearchChange={table.setSearch}
        searchPlaceholder={searchPlaceholder}
        searchLabel={searchLabel}
        filters={filters}
        actions={toolbarActions}
        selectable={selectable}
        selectedCount={table.selectedCount}
        selectedRows={table.selectedRows}
        bulkActions={bulkActions}
        onClearSelection={table.clearSelection}
      />

      <div
        className={[
          'data-table__scroll',
          stickyHeader && 'data-table__scroll--sticky',
        ]
          .filter(Boolean)
          .join(' ')}
        style={scrollStyle}
        role="region"
        aria-label={ariaLabel}
        tabIndex={0}
      >
        <table
          className="data-table__table"
          style={tableStyle}
          aria-busy={loading || undefined}
        >
          <caption className="visually-hidden">
            {caption || title || ariaLabel}
          </caption>

          <colgroup>
            {selectable && (
              <col className="data-table__col data-table__col--select" />
            )}
            {tableColumns.map((column) => (
              <col
                key={column.id}
                className="data-table__col"
                style={{
                  width: column.width,
                  minWidth: column.minWidth,
                }}
              />
            ))}
          </colgroup>

          <TableHeader
            columns={tableColumns}
            sort={table.sort}
            onSort={table.toggleSort}
            selectable={selectable}
            allSelected={table.allPageSelected}
            someSelected={table.somePageSelected}
            onToggleAll={table.togglePageSelection}
          />

          <TableBody
            rows={table.rows}
            columns={tableColumns}
            getRowId={table.getRowId}
            getRowLabel={getRowLabel}
            selectable={selectable}
            selectedIds={table.selectedIds}
            onToggleRow={table.toggleRow}
            loading={loading}
            error={normalizedError}
            onRetry={onRetry}
            errorTitle={errorTitle}
            filtered={isFiltered}
            emptyTitle={emptyTitle}
            emptyDescription={emptyDescription}
            emptyAction={resolvedEmptyAction}
            skeletonRowCount={skeletonRowCount}
            getRowClassName={getRowClassName}
          />
        </table>
      </div>

      {showPagination && (
        <TablePagination
          page={table.page}
          totalPages={table.totalPages}
          pageSize={table.pageSize}
          pageSizeOptions={table.pageSizeOptions}
          onPageChange={table.setPage}
          onPageSizeChange={table.setPageSize}
          totalCount={table.totalCount}
          filteredCount={table.filteredCount}
          rangeStart={table.rangeStart}
          rangeEnd={table.rangeEnd}
          loading={loading}
        />
      )}
    </div>
  )
}

export default DataTable
