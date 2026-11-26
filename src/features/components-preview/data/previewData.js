import { SAMPLE_FIRMS } from '../../../config/firms'

export const PREVIEW_DATASET_LABEL = 'Imported records preview'

export const PREVIEW_STATUS_META = {
  paid: { label: 'Paid', variant: 'success' },
  pending: { label: 'Pending', variant: 'warning' },
  overdue: { label: 'Overdue', variant: 'danger' },
  draft: { label: 'Draft', variant: 'neutral' },
}

export const PREVIEW_STATUS_OPTIONS = Object.entries(
  PREVIEW_STATUS_META,
).map(([value, meta]) => ({ value, label: meta.label }))

export const PREVIEW_PARTY_TYPE_LABELS = {
  customer: 'Customer',
  supplier: 'Supplier',
  vendor: 'Vendor',
}

export const PREVIEW_PARTY_TYPE_OPTIONS = Object.entries(
  PREVIEW_PARTY_TYPE_LABELS,
).map(([value, label]) => ({ value, label }))

// No category master was supplied for the generic preview page.
export const PREVIEW_CATEGORIES = []

export const PREVIEW_CATEGORY_OPTIONS = PREVIEW_CATEGORIES.map(
  (category) => ({ value: category, label: category }),
)

// No preview records are seeded. The supplied PDFs do not contain a
// generic component-preview dataset.
const RECORD_SEEDS = []

function toDateInputValue(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function createPreviewRecords(referenceDate = new Date()) {
  const today = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate(),
  )

  return RECORD_SEEDS.map((seed) => {
    const date = new Date(today)
    date.setDate(date.getDate() - seed.daysAgo)
    const firm =
      SAMPLE_FIRMS[seed.firmIndex % SAMPLE_FIRMS.length]
    const status = PREVIEW_STATUS_META[seed.status]

    return {
      id: `DEMO-${seed.number}`,
      date: toDateInputValue(date),
      party: seed.party,
      partyType: seed.partyType,
      partyTypeLabel: PREVIEW_PARTY_TYPE_LABELS[seed.partyType],
      category: seed.category,
      firmId: firm.id,
      firmName: firm.name,
      firmLocation: firm.location,
      status: seed.status,
      statusLabel: status?.label ?? seed.status,
      amount: seed.amount,
      notes: seed.notes,
    }
  })
}

export function getNextPreviewId(records) {
  const highest = records.reduce((current, record) => {
    const match = /^DEMO-(\d+)$/.exec(record.id)
    return match ? Math.max(current, Number(match[1])) : current
  }, 1000)

  return `DEMO-${highest + 1}`
}
