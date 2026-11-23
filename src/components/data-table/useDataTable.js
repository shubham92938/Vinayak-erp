import { useCallback, useMemo, useState } from 'react'
import {
  PAGE_SIZE_OPTIONS,
  clampPage,
  rowMatchesSearch,
  sortRows,
} from './tableUtils'

const defaultGetRowId = (row) => row?.id

/**
 * Pure table state: filtering, search, sorting, pagination and selection.
 * Presentation is intentionally kept in the sibling Table* components.
 */
export default function useDataTable({
  data = [],
  columns = [],
  getRowId: getRowIdProp,
  search: controlledSearch,
  onSearchChange,
  initialSearch = '',
  searchFields,
  filter,
  filterKey = '',
  initialSort = null,
  initialPageSize = 10,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  selectable = false,
  initialSelectedIds,
} = {}) {
  const safePageSizes = pageSizeOptions.length
    ? pageSizeOptions
    : PAGE_SIZE_OPTIONS
  const [internalSearch, setInternalSearch] = useState(initialSearch)
  const [sort, setSort] = useState(initialSort)
  const [pageSize, setPageSizeState] = useState(() =>
    safePageSizes.includes(initialPageSize)
      ? initialPageSize
      : safePageSizes[0],
  )
  const [pageRequest, setPageRequest] = useState({ page: 1, key: null })
  const [selectedIds, setSelectedIds] = useState(
    () => new Set(initialSelectedIds ?? []),
  )

  const getRowId = useCallback(
    (row) => (getRowIdProp ?? defaultGetRowId)(row),
    [getRowIdProp],
  )

  const isSearchControlled = controlledSearch !== undefined
  const searchValue = isSearchControlled ? controlledSearch : internalSearch
  const normalizedSearch = String(searchValue ?? '').trim()

  const filteredRows = useMemo(() => {
    const source = Array.isArray(data) ? data : []

    return source.filter((row) => {
      if (typeof filter === 'function' && !filter(row)) return false
      return rowMatchesSearch(row, normalizedSearch, columns, searchFields)
    })
  }, [data, filter, normalizedSearch, columns, searchFields])

  const sortedRows = useMemo(
    () => sortRows(filteredRows, sort, columns),
    [filteredRows, sort, columns],
  )

  const totalCount = Array.isArray(data) ? data.length : 0
  const filteredCount = filteredRows.length
  const pageKey = [
    filterKey,
    normalizedSearch,
    pageSize,
    sort?.columnId ?? '',
    sort?.direction ?? '',
  ].join('|')

  const totalPages = Math.max(1, Math.ceil(filteredCount / pageSize))
  const requestedPage =
    pageRequest.key === pageKey ? pageRequest.page : 1
  const page = clampPage(requestedPage, totalPages)
  const rangeStart = filteredCount === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = Math.min(page * pageSize, filteredCount)

  const pageRows = useMemo(
    () => sortedRows.slice((page - 1) * pageSize, page * pageSize),
    [sortedRows, page, pageSize],
  )

  const resetPage = useCallback(() => {
    setPageRequest({ page: 1, key: null })
  }, [])

  const goToPage = useCallback(
    (nextPage) => {
      setPageRequest({
        page: clampPage(nextPage, totalPages),
        key: pageKey,
      })
    },
    [totalPages, pageKey],
  )

  const setSearch = useCallback(
    (value) => {
      resetPage()

      if (isSearchControlled) {
        onSearchChange?.(value)
      } else {
        setInternalSearch(value)
      }
    },
    [isSearchControlled, onSearchChange, resetPage],
  )

  const setPageSize = useCallback(
    (value) => {
      const numericValue = Number(value)

      if (!safePageSizes.includes(numericValue)) return

      setPageSizeState(numericValue)
      resetPage()
    },
    [safePageSizes, resetPage],
  )

  const toggleSort = useCallback(
    (columnId) => {
      const column = columns.find((item) => item.id === columnId)

      if (!column || column.sortable === false) return

      setSort((current) => {
        if (!current || current.columnId !== columnId) {
          return { columnId, direction: 'asc' }
        }

        if (current.direction === 'asc') {
          return { columnId, direction: 'desc' }
        }

        return null
      })
      resetPage()
    },
    [columns, resetPage],
  )

  const clearSort = useCallback(() => {
    setSort(null)
    resetPage()
  }, [resetPage])

  const toggleRow = useCallback((rowId) => {
    setSelectedIds((current) => {
      const next = new Set(current)

      if (next.has(rowId)) {
        next.delete(rowId)
      } else {
        next.add(rowId)
      }

      return next
    })
  }, [])

  const togglePageSelection = useCallback(() => {
    const pageIds = pageRows.map((row) => getRowId(row))

    setSelectedIds((current) => {
      const next = new Set(current)
      const allSelected =
        pageIds.length > 0 && pageIds.every((id) => current.has(id))

      pageIds.forEach((id) => {
        if (allSelected) {
          next.delete(id)
        } else {
          next.add(id)
        }
      })

      return next
    })
  }, [pageRows, getRowId])

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const selectedRows = useMemo(
    () => filteredRows.filter((row) => selectedIds.has(getRowId(row))),
    [filteredRows, selectedIds, getRowId],
  )

  const allPageSelected =
    selectable &&
    pageRows.length > 0 &&
    pageRows.every((row) => selectedIds.has(getRowId(row)))
  const somePageSelected =
    selectable &&
    !allPageSelected &&
    pageRows.some((row) => selectedIds.has(getRowId(row)))

  return {
    rows: pageRows,
    filteredRows,
    sortedRows,
    totalCount,
    filteredCount,
    searchValue,
    setSearch,
    sort,
    toggleSort,
    clearSort,
    page,
    totalPages,
    pageSize,
    pageSizeOptions: safePageSizes,
    setPage: goToPage,
    setPageSize,
    nextPage: () => goToPage(page + 1),
    previousPage: () => goToPage(page - 1),
    firstPage: () => goToPage(1),
    lastPage: () => goToPage(totalPages),
    rangeStart,
    rangeEnd,
    getRowId,
    selectable,
    selectedIds,
    selectedRows,
    selectedCount: selectedRows.length,
    toggleRow,
    togglePageSelection,
    allPageSelected,
    somePageSelected,
    clearSelection,
  }
}
