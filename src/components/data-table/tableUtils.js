export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base',
})

const NUMERIC_STRING = /^-?\d+(?:\.\d+)?$/

export function getColumnValue(row, column) {
  if (!column) return undefined
  if (typeof column.accessor === 'function') return column.accessor(row)
  if (column.accessor !== undefined) return row?.[column.accessor]
  if (column.id !== undefined) return row?.[column.id]
  return undefined
}

function getSortValue(row, column) {
  if (typeof column.sortValue === 'function') return column.sortValue(row)
  if (column.sortValue !== undefined) return row?.[column.sortValue]
  return getColumnValue(row, column)
}

export function compareSortValues(first, second) {
  if (first === null || first === undefined) {
    return second === null || second === undefined ? 0 : 1
  }

  if (second === null || second === undefined) return -1

  if (typeof first === 'number' && typeof second === 'number') {
    return first - second
  }

  if (first instanceof Date && second instanceof Date) {
    return first.getTime() - second.getTime()
  }

  const firstText = String(first)
  const secondText = String(second)

  if (NUMERIC_STRING.test(firstText) && NUMERIC_STRING.test(secondText)) {
    return Number(firstText) - Number(secondText)
  }

  return collator.compare(firstText, secondText)
}

export function sortRows(rows, sort, columns) {
  if (!sort?.columnId || !sort.direction) return rows

  const column = columns.find((item) => item.id === sort.columnId)

  if (!column || column.sortable === false) return rows

  const factor = sort.direction === 'desc' ? -1 : 1

  return rows
    .map((row, index) => ({ row, index }))
    .sort((first, second) => {
      const result =
        typeof column.sortFn === 'function'
          ? column.sortFn(first.row, second.row)
          : compareSortValues(
              getSortValue(first.row, column),
              getSortValue(second.row, column),
            )

      return result === 0 ? first.index - second.index : result * factor
    })
    .map((entry) => entry.row)
}

export function getRowSearchValues(row, columns, searchFields) {
  if (typeof searchFields === 'function') {
    const values = searchFields(row)
    return Array.isArray(values) ? values : [values]
  }

  if (typeof searchFields === 'string') {
    return [row?.[searchFields]]
  }

  if (Array.isArray(searchFields)) {
    return searchFields.map((field) =>
      typeof field === 'function' ? field(row) : row?.[field],
    )
  }

  return (columns || [])
    .filter((column) => column.searchable !== false)
    .map((column) => getColumnValue(row, column))
}

export function rowMatchesSearch(row, query, columns, searchFields) {
  const normalizedQuery = String(query ?? '')
    .trim()
    .toLocaleLowerCase()

  if (!normalizedQuery) return true

  return getRowSearchValues(row, columns, searchFields).some((value) =>
    String(value ?? '')
      .toLocaleLowerCase()
      .includes(normalizedQuery),
  )
}

export function clampPage(page, totalPages) {
  const numericPage = Number(page)
  const safePage = Number.isFinite(numericPage) ? Math.round(numericPage) : 1
  return Math.min(Math.max(safePage, 1), Math.max(totalPages, 1))
}
