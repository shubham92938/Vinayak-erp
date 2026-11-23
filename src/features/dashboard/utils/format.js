const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

const compactNumberFormatter = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 2,
})

const numberFormatter = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 0,
})

export function formatCurrency(value) {
  const amount = Number(value) || 0
  return inrFormatter.format(amount)
}

export function formatCompactCurrency(value) {
  const amount = Number(value) || 0
  const sign = amount < 0 ? '−' : ''
  const absolute = Math.abs(amount)

  if (absolute >= 10_000_000) {
    return `${sign}₹${compactNumberFormatter.format(absolute / 10_000_000)} Cr`
  }

  if (absolute >= 100_000) {
    return `${sign}₹${compactNumberFormatter.format(absolute / 100_000)} L`
  }

  return `${sign}₹${numberFormatter.format(absolute)}`
}

export function formatNumber(value) {
  return numberFormatter.format(Number(value) || 0)
}

export function formatPercent(value, digits = 1) {
  const amount = Number(value) || 0
  return `${amount.toFixed(digits)}%`
}

export function formatSignedPercent(value, digits = 1) {
  const amount = Number(value) || 0
  const sign = amount > 0 ? '+' : amount < 0 ? '−' : ''
  return `${sign}${Math.abs(amount).toFixed(digits)}%`
}

export function formatInitials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}
