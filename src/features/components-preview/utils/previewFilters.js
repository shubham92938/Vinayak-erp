import {
  EMPTY_DATE_RANGE,
  isDateRangeActive,
  isWithinDateRange,
} from '../../../components/filters/datePresets'
import { PREVIEW_STATUS_META } from '../data/previewData'

export function createPreviewFilters() {
  return {
    search: '',
    firmId: 'all',
    category: 'all',
    status: 'all',
    dateRange: { ...EMPTY_DATE_RANGE },
  }
}

export function countActivePreviewFilters(filters = createPreviewFilters()) {
  return [
    Boolean(filters.search?.trim()),
    filters.firmId !== 'all',
    filters.category !== 'all',
    filters.status !== 'all',
    isDateRangeActive(filters.dateRange),
  ].filter(Boolean).length
}

export function matchesPreviewFilters(record, filters) {
  if (filters.firmId !== 'all' && record.firmId !== filters.firmId) {
    return false
  }

  if (
    filters.category !== 'all' &&
    record.category !== filters.category
  ) {
    return false
  }

  if (filters.status !== 'all' && record.status !== filters.status) {
    return false
  }

  return isWithinDateRange(record.date, filters.dateRange)
}

export function matchesPreviewSearch(record, query) {
  const normalizedQuery = String(query ?? '')
    .trim()
    .toLocaleLowerCase()

  if (!normalizedQuery) return true

  return [
    record.id,
    record.party,
    record.partyTypeLabel,
    record.firmName,
    record.firmLocation,
    record.category,
    PREVIEW_STATUS_META[record.status]?.label,
    record.amount,
    record.notes,
  ]
    .filter(Boolean)
    .join(' ')
    .toLocaleLowerCase()
    .includes(normalizedQuery)
}

export function filterPreviewRecords(records, filters) {
  return records.filter(
    (record) =>
      matchesPreviewFilters(record, filters) &&
      matchesPreviewSearch(record, filters.search),
  )
}
