import {
  PREVIEW_PARTY_TYPE_LABELS,
  PREVIEW_STATUS_META,
} from '../data/previewData'

export const PREVIEW_CSV_COLUMNS = [
  { key: 'id', label: 'Record ID' },
  { key: 'date', label: 'Date' },
  { key: 'party', label: 'Party' },
  {
    key: 'partyType',
    label: 'Party type',
    value: (record) =>
      PREVIEW_PARTY_TYPE_LABELS[record.partyType] ?? record.partyType,
  },
  { key: 'firmName', label: 'Firm' },
  { key: 'category', label: 'Category' },
  {
    key: 'status',
    label: 'Status',
    value: (record) =>
      PREVIEW_STATUS_META[record.status]?.label ?? record.status,
  },
  { key: 'amount', label: 'Amount (INR)' },
  { key: 'notes', label: 'Notes' },
]
