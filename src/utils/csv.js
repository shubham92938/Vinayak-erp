/**
 * Reusable CSV export helpers.
 *
 * The utilities in this file are intentionally framework-free so they can be
 * used by any module, tested independently, and reused for bulk actions.
 */

const DEFAULT_EOL = '\r\n'
const FORMULA_PREFIX = /^[=+\-@\t\r]/

/**
 * Escape a single CSV cell.
 *
 * - Quotes, commas and line breaks are wrapped in double quotes.
 * - Embedded quotes are doubled.
 * - Values that could be interpreted as spreadsheet formulas are prefixed
 *   with an apostrophe to prevent CSV injection.
 */
export function escapeCsvValue(value, { protectFormulas = true } = {}) {
  if (value === null || value === undefined) return ''

  let stringValue = String(value)

  if (protectFormulas && FORMULA_PREFIX.test(stringValue)) {
    stringValue = `'${stringValue}`
  }

  if (/[",\r\n]/.test(stringValue)) {
    return `"${stringValue.replaceAll('"', '""')}"`
  }

  return stringValue
}

function resolveCell(row, column) {
  if (typeof column?.value === 'function') return column.value(row)
  if (typeof column?.accessor === 'function') return column.accessor(row)
  if (column?.accessor !== undefined) return row?.[column.accessor]
  if (column?.key !== undefined) return row?.[column.key]
  return ''
}

/**
 * Build a CSV string from columns and records.
 *
 * columns: [{ key, label, value?, accessor? }]
 * - `key` maps to a record property.
 * - `accessor` accepts a property name or a function.
 * - `value` accepts a function and takes precedence.
 */
export function buildCsv({
  columns,
  rows,
  includeHeader = true,
  eol = DEFAULT_EOL,
} = {}) {
  if (!Array.isArray(columns) || columns.length === 0) {
    throw new Error('buildCsv requires at least one column')
  }

  const safeRows = Array.isArray(rows) ? rows : []
  const lines = []

  if (includeHeader) {
    lines.push(
      columns
        .map((column) =>
          escapeCsvValue(column.label ?? column.key ?? ''),
        )
        .join(','),
    )
  }

  for (const row of safeRows) {
    lines.push(
      columns
        .map((column) => escapeCsvValue(resolveCell(row, column)))
        .join(','),
    )
  }

  return lines.join(eol)
}

function toDateStamp(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function sanitizeFilename(filename) {
  const safeName = String(filename || 'export')
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .replace(/\.csv$/i, '')

  return `${safeName || 'export'}.csv`
}

/**
 * Create a readable, download-safe filename. A date stamp is included by
 * default; pass includeDate: false when the caller already supplies a period.
 */
export function buildExportFilename(
  base,
  { date = new Date(), suffix, includeDate = true } = {},
) {
  const cleanBase = String(base || 'export').replace(/\.csv$/i, '')
  const parts = [cleanBase]

  if (suffix) parts.push(suffix)
  if (includeDate) parts.push(toDateStamp(date))

  return sanitizeFilename(parts.join('_'))
}

/**
 * Download a CSV in the browser.
 *
 * Empty datasets are skipped by default. Pass empty: 'headers' to download a
 * headers-only file instead.
 */
export function downloadCsv({
  filename = 'export',
  columns,
  rows,
  includeHeader = true,
  includeBom = true,
  empty = 'skip',
} = {}) {
  const safeRows = Array.isArray(rows) ? rows : []
  const resolvedFilename = sanitizeFilename(filename)

  if (safeRows.length === 0 && empty !== 'headers') {
    return {
      exported: false,
      count: 0,
      filename: resolvedFilename,
      csv: '',
    }
  }

  const csv = buildCsv({ columns, rows: safeRows, includeHeader })
  const content = includeBom ? `\uFEFF${csv}` : csv
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = resolvedFilename
  link.style.display = 'none'
  document.body.append(link)
  link.click()
  link.remove()

  // Give the browser time to start reading the blob before releasing it.
  window.setTimeout(() => URL.revokeObjectURL(url), 1500)

  return {
    exported: true,
    count: safeRows.length,
    filename: resolvedFilename,
    csv: content,
  }
}
