import { buildCsv, downloadCsv } from '../../../utils/csv'
import {
  PAYMENT_STATUSES,
  TRANSACTION_TYPES,
} from './dashboardConfig'

const TRANSACTION_CSV_COLUMNS = [
  { key: 'id', label: 'Transaction ID' },
  { key: 'date', label: 'Date' },
  {
    key: 'type',
    label: 'Type',
    value: (transaction) =>
      TRANSACTION_TYPES[transaction.type]?.label ?? transaction.type,
  },
  { key: 'party', label: 'Customer / Supplier' },
  { key: 'firmName', label: 'Firm' },
  { key: 'amount', label: 'Amount (INR)' },
  {
    key: 'status',
    label: 'Payment Status',
    value: (transaction) =>
      PAYMENT_STATUSES[transaction.status]?.label ?? transaction.status,
  },
]

export function buildTransactionsCsv(transactions) {
  return buildCsv({
    columns: TRANSACTION_CSV_COLUMNS,
    rows: transactions,
  })
}

export function downloadTransactionsCsv(
  transactions,
  { startDate, endDate } = {},
) {
  const period =
    startDate && endDate ? `${startDate}_to_${endDate}` : 'dashboard'
  const result = downloadCsv({
    filename: `vinayak-transactions_${period}.csv`,
    columns: TRANSACTION_CSV_COLUMNS,
    rows: transactions,
  })

  return {
    exported: result.exported,
    count: result.count,
    filename: result.filename,
  }
}
