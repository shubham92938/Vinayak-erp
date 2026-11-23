const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

export function formatPreviewCurrency(value) {
  return currencyFormatter.format(Number(value) || 0)
}

export function formatPreviewDate(value) {
  if (!value) return '\u2014'

  const [year, month, day] = String(value)
    .slice(0, 10)
    .split('-')
    .map(Number)

  if (!year || !month || !day) return value

  return dateFormatter.format(new Date(year, month - 1, day))
}
