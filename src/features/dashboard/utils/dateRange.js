/**
 * Date helpers for the dashboard.
 * All dates are handled as local calendar dates and serialized as YYYY-MM-DD
 * to avoid timezone shifts between the browser and future API responses.
 */

export const DATE_PRESETS = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last-7', label: 'Last 7 days' },
  { value: 'last-30', label: 'Last 30 days' },
  { value: 'this-month', label: 'This month' },
  { value: 'last-month', label: 'Last month' },
  { value: 'fy', label: 'This financial year' },
  { value: 'custom', label: 'Custom range' },
]

export const DEFAULT_DATE_PRESET = 'last-30'

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

export function fromISODate(value) {
  if (value instanceof Date) return startOfDay(value)
  if (!value) return startOfDay()

  const [year, month, day] = String(value).slice(0, 10).split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function addDays(value, amount) {
  const date = value instanceof Date ? startOfDay(value) : fromISODate(value)
  date.setDate(date.getDate() + amount)
  return date
}

export function addMonths(value, amount) {
  const date = value instanceof Date ? startOfDay(value) : fromISODate(value)
  return new Date(date.getFullYear(), date.getMonth() + amount, 1)
}

export function startOfMonth(value = new Date()) {
  const date = value instanceof Date ? value : fromISODate(value)
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function endOfMonth(value = new Date()) {
  const date = value instanceof Date ? value : fromISODate(value)
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

export function getFinancialYearStart(value = new Date()) {
  const date = value instanceof Date ? value : fromISODate(value)
  return date.getMonth() >= 3 ? date.getFullYear() : date.getFullYear() - 1
}

export function getFinancialYearOptions(referenceDate = new Date(), count = 3) {
  const currentStart = getFinancialYearStart(referenceDate)
  const currentISO = toISODate(startOfDay(referenceDate))

  return Array.from({ length: count }, (_, index) => {
    const year = currentStart - index
    const start = `${year}-04-01`
    const end = year === currentStart ? currentISO : `${year + 1}-03-31`

    return {
      value: String(year),
      label: `FY ${year}–${String(year + 1).slice(-2)}`,
      start,
      end,
    }
  })
}

export function getFinancialYearRange(financialYear, referenceDate = new Date()) {
  const currentStart = getFinancialYearStart(referenceDate)
  const startYear = Number(financialYear) || currentStart
  const todayISO = toISODate(startOfDay(referenceDate))
  const start = `${startYear}-04-01`
  const calendarEnd = `${startYear + 1}-03-31`

  return {
    start,
    end: startYear === currentStart ? todayISO : calendarEnd,
  }
}

export function diffInDays(start, end) {
  const startDate = fromISODate(start)
  const endDate = fromISODate(end)
  return Math.round((endDate - startDate) / 86_400_000)
}

export function isWithin(dateISO, startISO, endISO) {
  return dateISO >= startISO && dateISO <= endISO
}

export function resolveDateRange(
  preset,
  {
    financialYear,
    customStart,
    customEnd,
    referenceDate = new Date(),
  } = {},
) {
  const today = startOfDay(referenceDate)
  const todayISO = toISODate(today)
  const monthStart = toISODate(startOfMonth(today))
  const previousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)

  switch (preset) {
    case 'today':
      return { start: todayISO, end: todayISO }
    case 'yesterday': {
      const yesterday = toISODate(addDays(today, -1))
      return { start: yesterday, end: yesterday }
    }
    case 'last-7':
      return { start: toISODate(addDays(today, -6)), end: todayISO }
    case 'this-month':
      return { start: monthStart, end: todayISO }
    case 'last-month':
      return {
        start: toISODate(startOfMonth(previousMonth)),
        end: toISODate(endOfMonth(previousMonth)),
      }
    case 'fy': {
      const range = getFinancialYearRange(financialYear, today)
      return { start: range.start, end: range.end }
    }
    case 'custom': {
      const start = customStart || toISODate(addDays(today, -29))
      const end = customEnd || todayISO
      return start <= end ? { start, end } : { start: end, end: start }
    }
    case 'last-30':
    default:
      return { start: toISODate(addDays(today, -29)), end: todayISO }
  }
}

export function getPreviousRange(start, end) {
  const dayCount = diffInDays(start, end) + 1
  const previousEnd = toISODate(addDays(start, -1))
  const previousStart = toISODate(addDays(start, -dayCount))

  return { start: previousStart, end: previousEnd }
}

export function formatDateLabel(isoDate, options = {}) {
  const date = fromISODate(isoDate)

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  }).format(date)
}

export function formatShortDateLabel(isoDate) {
  return formatDateLabel(isoDate, { year: undefined })
}

export function formatRangeLabel(start, end) {
  if (!start || !end) return ''

  const startDate = fromISODate(start)
  const endDate = fromISODate(end)

  if (start === end) return formatDateLabel(start)

  if (
    startDate.getFullYear() === endDate.getFullYear() &&
    startDate.getMonth() === endDate.getMonth()
  ) {
    return `${startDate.getDate()}–${formatDateLabel(end)}`
  }

  return `${formatShortDateLabel(start)} – ${formatDateLabel(end)}`
}

export function getBucketGranularity(start, end) {
  return diffInDays(start, end) + 1 > 62 ? 'month' : 'day'
}

export function buildBuckets(start, end, granularity = 'day') {
  if (granularity === 'month') {
    const buckets = []
    const finalDate = fromISODate(end)
    let cursor = startOfMonth(start)
    let index = 0

    while (cursor <= finalDate) {
      const monthEnd = endOfMonth(cursor)
      const bucketEnd = monthEnd > finalDate ? finalDate : monthEnd

      buckets.push({
        key: toISODate(cursor),
        start: toISODate(cursor),
        end: toISODate(bucketEnd),
        label: new Intl.DateTimeFormat('en-IN', {
          month: 'short',
          year: '2-digit',
        }).format(cursor),
        fullLabel: new Intl.DateTimeFormat('en-IN', {
          month: 'long',
          year: 'numeric',
        }).format(cursor),
        index,
      })

      cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)
      index += 1
    }

    return buckets
  }

  const buckets = []
  const finalDate = fromISODate(end)
  let cursor = fromISODate(start)
  let index = 0

  while (cursor <= finalDate) {
    const iso = toISODate(cursor)

    buckets.push({
      key: iso,
      start: iso,
      end: iso,
      label: new Intl.DateTimeFormat('en-IN', {
        day: 'numeric',
        month: 'short',
      }).format(cursor),
      fullLabel: new Intl.DateTimeFormat('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(cursor),
      index,
    })

    cursor = addDays(cursor, 1)
    index += 1
  }

  return buckets
}

export function formatDateTimeLabel(value) {
  const date = value instanceof Date ? value : new Date(value)

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}
