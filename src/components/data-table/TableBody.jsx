import Button from '../ui/Button/Button'
import TableEmptyState from './TableEmptyState'
import TableSkeleton from './TableSkeleton'
import { getColumnValue } from './tableUtils'

function TableBody({
  rows = [],
  columns = [],
  getRowId,
  getRowLabel,
  selectable = false,
  selectedIds,
  onToggleRow,
  loading = false,
  error,
  onRetry,
  errorTitle,
  filtered = false,
  emptyTitle,
  emptyDescription,
  emptyAction,
  skeletonRowCount = 6,
  getRowClassName,
}) {
  const columnCount = columns.length + (selectable ? 1 : 0)

  if (loading) {
    return (
      <TableSkeleton
        rows={skeletonRowCount}
        columns={columns}
        selectable={selectable}
      />
    )
  }

  if (error) {
    return (
      <tbody>
        <tr>
          <td colSpan={columnCount} className="data-table__state-cell">
            <TableEmptyState
              variant="error"
              title={errorTitle}
              description={
                typeof error === 'string' ? error : undefined
              }
              action={
                onRetry ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={onRetry}
                  >
                    Try again
                  </Button>
                ) : null
              }
            />
          </td>
        </tr>
      </tbody>
    )
  }

  if (rows.length === 0) {
    return (
      <tbody>
        <tr>
          <td colSpan={columnCount} className="data-table__state-cell">
            <TableEmptyState
              filtered={filtered}
              title={emptyTitle}
              description={emptyDescription}
              action={emptyAction}
            />
          </td>
        </tr>
      </tbody>
    )
  }

  return (
    <tbody>
      {rows.map((row, rowIndex) => {
        const rowId = getRowId(row)
        const isSelected = selectedIds?.has(rowId) ?? false

        return (
          <tr
            key={rowId ?? rowIndex}
            className={[
              'data-table__row',
              isSelected && 'data-table__row--selected',
              getRowClassName?.(row),
            ]
              .filter(Boolean)
              .join(' ')}
            aria-selected={selectable ? isSelected : undefined}
          >
            {selectable && (
              <td className="data-table__cell data-table__cell--select">
                <input
                  type="checkbox"
                  className="data-table__checkbox"
                  checked={isSelected}
                  onChange={() => onToggleRow?.(rowId)}
                  aria-label={`Select ${
                    getRowLabel ? getRowLabel(row) : 'row'
                  }`}
                />
              </td>
            )}

            {columns.map((column) => {
              const value = getColumnValue(row, column)
              const isEmpty =
                value === null || value === undefined || value === ''

              return (
                <td
                  key={column.id}
                  className={[
                    'data-table__cell',
                    column.align === 'right' &&
                      'data-table__cell--align-right',
                    column.align === 'center' &&
                      'data-table__cell--align-center',
                    column.className,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {column.cell
                    ? column.cell(row, rowIndex)
                    : isEmpty
                      ? column.emptyValue ?? '\u2014'
                      : value}
                </td>
              )
            })}
          </tr>
        )
      })}
    </tbody>
  )
}

export default TableBody
