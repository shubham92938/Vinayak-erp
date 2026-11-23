export function formatCategoryDate(value) {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '—'
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parsed)
}

export const CATEGORY_CSV_COLUMNS = [
  { key: 'id', label: 'Category ID' },
  { key: 'name', label: 'Name' },
  { key: 'code', label: 'Code' },
  { key: 'description', label: 'Description' },
  { key: 'firmId', label: 'Firm' },
  { key: 'status', label: 'Status' },
  { key: 'createdAt', label: 'Created Date' },
]
