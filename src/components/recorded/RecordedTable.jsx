import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from 'lucide-react'
import './recordedTable.css'

const DEFAULT_PAGE_SIZES = [5, 10, 15, 25]

function getExpandedPageNumbers(totalPages, currentPage, windowSize) {
  if (totalPages <= windowSize + 2) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  if (currentPage <= windowSize) {
    return [
      ...Array.from({ length: windowSize }, (_, index) => index + 1),
      'ellipsis-end',
      totalPages - 1,
      totalPages,
    ]
  }

  if (currentPage > totalPages - windowSize) {
    return [
      1,
      'ellipsis-start',
      ...Array.from({ length: windowSize }, (_, index) => totalPages - windowSize + 1 + index),
    ]
  }

  const radius = Math.floor((windowSize - 1) / 2)
  return [
    1,
    'ellipsis-start',
    ...Array.from({ length: windowSize - 1 }, (_, index) => currentPage - radius + index),
    'ellipsis-end',
    totalPages,
  ]
}

/**
 * The main website uses compact, server-table-like screens rather than the
 * dashboard data grid used by the original recreation. This small table keeps
 * that interaction model consistent across the recorded screens while still
 * being accessible and keyboard friendly.
 */
export default function RecordedTable({
  rows = [],
  columns = [],
  getRowId = (row, index) => row?.id ?? index,
  pageSizeOptions = DEFAULT_PAGE_SIZES,
  initialPageSize = 10,
  paginationWindow = 5,
  search = '',
  onSearchChange,
  searchPlaceholder = 'Search',
  searchLabel = 'Search records',
  filters,
  actions,
  filterRow,
  emptyMessage = 'No records found.',
  ariaLabel = 'Records',
  minWidth = 760,
  className = '',
  onRowClick,
}) {
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [page, setPage] = useState(1)

  const filteredRows = useMemo(() => {
    const query = String(search ?? '').trim().toLowerCase()
    return rows.filter((row) => {
      if (query) {
        const searchableText = Object.entries(row ?? {})
          .filter(([key, value]) => key !== 'image' && typeof value !== 'object')
          .map(([, value]) => String(value ?? ''))
          .join(' ')
          .toLowerCase()
        if (!searchableText.includes(query)) return false
      }
      return typeof filterRow === 'function' ? filterRow(row) : true
    })
  }, [filterRow, rows, search])

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const start = filteredRows.length === 0 ? 0 : (safePage - 1) * pageSize
  const visibleRows = filteredRows.slice(start, start + pageSize)
  const rangeEnd = Math.min(start + pageSize, filteredRows.length)

  const goToPage = (nextPage) => {
    setPage(Math.max(1, Math.min(totalPages, nextPage)))
  }

  return (
    <section className={['recorded-table', className].filter(Boolean).join(' ')}>
      <div className="recorded-table__toolbar">
        <label className="recorded-table__entries">
          <span>Show</span>
          <select
            value={pageSize}
            onChange={(event) => setPageSize(Number(event.target.value))}
            aria-label="Rows per page"
          >
            {pageSizeOptions.map((size) => <option key={size} value={size}>{size}</option>)}
          </select>
          <span>entries</span>
        </label>

        <div className="recorded-table__filters">
          {filters}
        </div>

        <label className="recorded-table__search">
          <span>Search:</span>
          <span className="recorded-table__search-input">
            <Search size={13} aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(event) => onSearchChange?.(event.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchLabel}
            />
          </span>
        </label>
      </div>

      <div className="recorded-table__scroll" role="region" aria-label={ariaLabel} tabIndex={0}>
        <table className="recorded-table__table" style={{ '--recorded-table-min-width': `${minWidth}px` }}>
          <caption className="visually-hidden">{ariaLabel}</caption>
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={column.align ? `is-${column.align}` : ''}
                  style={{ width: column.width, minWidth: column.minWidth }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="recorded-table__empty">{emptyMessage}</td>
              </tr>
            ) : visibleRows.map((row, rowIndex) => (
              <tr
                key={getRowId(row, start + rowIndex)}
                className={onRowClick ? 'is-clickable' : ''}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={column.align ? `is-${column.align}` : ''}
                    data-label={column.label}
                  >
                    {column.render ? column.render(row, start + rowIndex) : row[column.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="recorded-table__footer">
        <p>
          Showing <strong>{filteredRows.length === 0 ? 0 : start + 1}</strong> to{' '}
          <strong>{rangeEnd}</strong> of <strong>{filteredRows.length}</strong> entries
        </p>
        <div className="recorded-table__pagination" aria-label="Pagination">
          <button type="button" onClick={() => goToPage(1)} disabled={safePage === 1} aria-label="First page"><ChevronsLeft size={14} /></button>
          <button type="button" onClick={() => goToPage(safePage - 1)} disabled={safePage === 1} aria-label="Previous page"><ChevronLeft size={14} /></button>
          {(paginationWindow > 5
            ? getExpandedPageNumbers(totalPages, safePage, paginationWindow)
            : Array.from({ length: Math.min(totalPages, 5) }, (_, index) => index + 1)
          ).map((pageNumber) => {
            if (typeof pageNumber !== 'number') return <span key={pageNumber}>…</span>
            return (
              <button
                type="button"
                key={pageNumber}
                className={safePage === pageNumber ? 'is-active' : ''}
                onClick={() => goToPage(pageNumber)}
                aria-current={safePage === pageNumber ? 'page' : undefined}
              >
                {pageNumber}
              </button>
            )
          })}
          {paginationWindow <= 5 && totalPages > 5 && <span>…</span>}
          <button type="button" onClick={() => goToPage(safePage + 1)} disabled={safePage === totalPages} aria-label="Next page"><ChevronRight size={14} /></button>
          <button type="button" onClick={() => goToPage(totalPages)} disabled={safePage === totalPages} aria-label="Last page"><ChevronsRight size={14} /></button>
        </div>
      </div>
      {actions}
    </section>
  )
}
