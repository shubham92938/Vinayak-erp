/**
 * Shared date-range presets for tables and reports.
 * Dates are local calendar dates serialized as YYYY-MM-DD.
 */

export const DATE_RANGE_PRESETS = [
  { value: 'all', label: 'All dates' },
  { value: 'today', label: 'Today' },
  { value: 'last-7-days', label: 'Last 7 days' },
  { value: 'last-30-days', label: 'Last 30 days' },
  { value: 'this-month', label: 'This month' },
  { value: 'last-month', label: 'Last month' },
  { value: 'this-quarter', label: 'This quarter' },
  { value: 'custom', label: 'Custom range' },
]

export const EMPTY_DATE_RANGE = {
  preset: 'all',
  start: '',
  end: '',
}

export function startOfDay(value = new Date()) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate())
}

export function toISODate(value) {
  const date = value instanceof Date ? value : new Date(value)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function addDays(value, amount) {
  const date = startOfDay(value)
  date.setDate(date.getDate() + amount)
  return date
}

export function resolvePresetRange(preset, referenceDate = new Date()) {
  const today = startOfDay(referenceDate)

  switch (preset) {
    case 'today':
      return { start: toISODate(today), end: toISODate(today) }
    case 'last-7-days':
      return {
        start: toISODate(addDays(today, -6)),
        end: toISODate(today),
      }
    case 'last-30-days':
      return {
        start: toISODate(addDays(today, -29)),
        end: toISODate(today),
      }
    case 'this-month':
      return {
        start: toISODate(new Date(today.getFullYear(), today.getMonth(), 1)),
        end: toISODate(today),
      }
    case 'last-month': {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const end = new Date(today.getFullYear(), today.getMonth(), 0)
      return { start: toISODate(start), end: toISODate(end) }
    }
    case 'this-quarter': {
      const quarterStart = Math.floor(today.getMonth() / 3) * 3
      return {
        start: toISODate(new Date(today.getFullYear(), quarterStart, 1)),
        end: toISODate(today),
      }
    }
    case 'all':
    case 'custom':
    default:
      return { start: '', end: '' }
  }
}

export function isWithinDateRange(dateValue, range = EMPTY_DATE_RANGE) {
  if (!range?.start && !range?.end) return true

  const value = String(dateValue ?? '').slice(0, 10)

  if (!value) return false
  if (range.start && value < range.start) return false
  if (range.end && value > range.end) return false

  return true
}

export function isDateRangeActive(range = EMPTY_DATE_RANGE) {
  return (
    Boolean(range?.start) ||
    Boolean(range?.end) ||
    (Boolean(range?.preset) && range.preset !== 'all')
  )
}
