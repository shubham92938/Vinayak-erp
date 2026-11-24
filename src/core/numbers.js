/**
 * Decimal-safe math helpers for financial figures.
 * Amounts are stored as integer Minor Units (paise) to avoid float errors.
 */

export function roundMoney(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function decimalMul(a, b) {
  return Math.round((a + Number.EPSILON) * b * 100) / 100
}

export function decimalAdd(a, b) {
  return roundMoney(a + b)
}

export function decimalSub(a, b) {
  return roundMoney(a - b)
}

export function calcTax(subtotal, taxPct) {
  if (!taxPct || !subtotal) return 0
  return roundMoney((subtotal * taxPct) / 100)
}

export function calcTotal(subtotal, discount, taxPct) {
  const net = decimalSub(subtotal, discount)
  return roundMoney(net + calcTax(net, taxPct))
}

export function formatMoney(amount) {
  return `₹${Number(amount || 0).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  })}`
}

export function formatDate(value) {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '—'
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parsed)
}

let sequence = 1

export function nextId(prefix) {
  sequence += 1
  return `${prefix}-${sequence.toString(36)}${Math.floor(Math.random() * 1000).toString(36)}`
}

export function nextNumber(prefix) {
  const millis = Date.now().toString(36).slice(-6).toUpperCase()
  const rand = Math.floor(Math.random() * 900) + 100
  return `${prefix}/${millis}/${String(sequence++).padStart(2, '0')}${rand}`
}
