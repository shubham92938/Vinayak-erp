import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import Button from '../ui/Button/Button'

function TablePagination({
  page,
  totalPages,
  pageSize,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
  totalCount,
  filteredCount,
  rangeStart,
  rangeEnd,
  loading = false,
  itemLabel = 'records',
}) {
  const isFiltered = filteredCount !== totalCount
  const rangeLabel =
    filteredCount === 0 ? '0' : `${rangeStart}\u2013${rangeEnd}`

  return (
    <div className="data-table__pagination">
      <div className="data-table__pagination-summary">
        Showing <strong>{rangeLabel}</strong> of{' '}
        {isFiltered ? (
          <>
            <strong>{filteredCount}</strong> filtered {itemLabel}{' '}
            <span className="data-table__pagination-total">
              ({totalCount} total)
            </span>
          </>
        ) : (
          <>
            <strong>{totalCount}</strong> {itemLabel}
          </>
        )}
      </div>

      <div className="data-table__pagination-controls">
        <label className="data-table__page-size">
          <span>Rows per page</span>
          <select
            value={pageSize}
            onChange={(event) =>
              onPageSizeChange?.(Number(event.target.value))
            }
            disabled={loading}
            aria-label="Rows per page"
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <div className="data-table__pager">
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            leadingIcon={<ChevronsLeft size={15} />}
            onClick={() => onPageChange?.(1)}
            disabled={loading || page <= 1}
            aria-label="First page"
            title="First page"
          />
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            leadingIcon={<ChevronLeft size={15} />}
            onClick={() => onPageChange?.(page - 1)}
            disabled={loading || page <= 1}
            aria-label="Previous page"
            title="Previous page"
          />
          <span
            className="data-table__page-indicator"
            aria-live="polite"
          >
            Page <strong>{page}</strong> of {totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            leadingIcon={<ChevronRight size={15} />}
            onClick={() => onPageChange?.(page + 1)}
            disabled={loading || page >= totalPages}
            aria-label="Next page"
            title="Next page"
          />
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            leadingIcon={<ChevronsRight size={15} />}
            onClick={() => onPageChange?.(totalPages)}
            disabled={loading || page >= totalPages}
            aria-label="Last page"
            title="Last page"
          />
        </div>
      </div>
    </div>
  )
}

export default TablePagination
