import { z } from 'zod'
import { SAMPLE_FIRMS } from '../../../config/firms'

export const recordFormSchema = z.object({
  party: z
    .string()
    .trim()
    .min(2, 'Enter a party name with at least 2 characters')
    .max(80, 'Party name cannot exceed 80 characters'),
  partyType: z.enum(['customer', 'supplier', 'vendor']),
  date: z.string().min(1, 'Choose a record date'),
  firmId: z.string().min(1, 'Choose a firm'),
  category: z.string().min(1, 'Choose a category'),
  status: z.enum(['paid', 'pending', 'overdue', 'draft']),
  amount: z
    .string()
    .trim()
    .min(1, 'Enter an amount')
    .refine(
      (value) =>
        Number.isFinite(Number(value)) && Number(value) > 0,
      'Enter an amount greater than zero',
    ),
  notes: z
    .string()
    .max(240, 'Notes cannot exceed 240 characters')
    .optional(),
})

function toDateInputValue(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getRecordFormDefaults(record, referenceDate = new Date()) {
  if (record) {
    return {
      party: record.party,
      partyType: record.partyType,
      date: record.date,
      firmId: record.firmId,
      category: record.category,
      status: record.status,
      amount: String(record.amount),
      notes: record.notes ?? '',
    }
  }

  return {
    party: '',
    partyType: 'customer',
    date: toDateInputValue(referenceDate),
    firmId: SAMPLE_FIRMS[0].id,
    category: '',
    status: 'pending',
    amount: '',
    notes: '',
  }
}
