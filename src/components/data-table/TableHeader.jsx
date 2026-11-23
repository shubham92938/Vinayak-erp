import { useEffect, useRef } from 'react'
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react'

function getSortLabel(column) {
  if (column.sortLabel) return column.sortLabel
  if (typeof column.header === 'string') return column.header
  return column.id
}

function TableHeader({
  columns,
  sort,
  onSort,
  selectable = false,
  allSelected = false,
  someSelected = false,
  onToggleAll,
}) {
  const selectAllRef = useRef(null)

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate =
        someSelected && !allSelected
    }
  }, [someSelected, allSelected])

  return (
    <thead>
      <tr>
        {selectable && (
          <th
            scope="col"
            className="data-table__cell data-table__cell--select"
          >
            <input
              ref={selectAllRef}
              type="checkbox"
              className="data-table__checkbox"
              checked={allSelected}
              onChange={onToggleAll}
              aria-label="Select all rows on this page"
            />
          </th>
        )}

        {columns.map((column) => {
          const sortable = column.sortable !== false
          const isSorted = sort?.columnId === column.id
          const ariaSort = isSorted
            ? sort.direction === 'asc'
              ? 'ascending'
              : 'descending'
            : undefined
          const SortIcon = !isSorted
            ? ChevronsUpDown
            : sort.direction === 'asc'
              ? ArrowUp
              : ArrowDown

          return (
            <th
              key={column.id}
              scope="col"
              className={[
                'data-table__cell',
                column.align === 'right' &&
                  'data-table__cell--align-right',
                column.align === 'center' &&
                  'data-table__cell--align-center',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-sort={ariaSort}
            >
              {sortable ? (
                <button
                  type="button"
                  className={[
                    'data-table__sort',
                    isSorted && 'data-table__sort--active',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => onSort?.(column.id)}
                  aria-label={
                    isSorted
                      ? `Sort by ${getSortLabel(column)}, currently ${
                          sort.direction === 'asc'
                            ? 'ascending'
                            : 'descending'
                        }`
                      : `Sort by ${getSortLabel(column)}`
                  }
                >
                  <span>{column.header ?? column.id}</span>
                  <SortIcon
                    size={12}
                    className="data-table__sort-icon"
                    aria-hidden="true"
                  />
                </button>
              ) : (
                <span className="data-table__heading">
                  {column.header ?? column.id}
                </span>
              )}
            </th>
          )
        })}
      </tr>
    </thead>
  )
}

export default TableHeader
