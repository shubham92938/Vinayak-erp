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

export function formatRecordedCategoryDate(value) {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '—'
  const day = String(parsed.getDate()).padStart(2, '0')
  const month = String(parsed.getMonth() + 1).padStart(2, '0')
  return `${day}-${month}-${parsed.getFullYear()}`
}

export function getCategorySlug(categoryOrName) {
  const name = typeof categoryOrName === 'string'
    ? categoryOrName
    : categoryOrName?.slug ?? categoryOrName?.name
  return String(name ?? '')
    .trim()
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
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
