export const TRANSACTION_TYPES = {
  sale: { label: 'Sale', shortLabel: 'Sale' },
  purchase: { label: 'Purchase', shortLabel: 'Purchase' },
  'payment-in': { label: 'Payment In', shortLabel: 'Payment In' },
  'payment-out': { label: 'Payment Out', shortLabel: 'Payment Out' },
  expense: { label: 'Expense', shortLabel: 'Expense' },
}

export const TRANSACTION_TYPE_OPTIONS = [
  { value: 'all', label: 'All types' },
  ...Object.entries(TRANSACTION_TYPES).map(([value, { label }]) => ({
    value,
    label,
  })),
]

export const PAYMENT_STATUSES = {
  paid: { label: 'Paid', variant: 'success' },
  partial: { label: 'Partially Paid', variant: 'warning' },
  pending: { label: 'Pending', variant: 'neutral' },
  overdue: { label: 'Overdue', variant: 'danger' },
}

export const PAYMENT_STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  ...Object.entries(PAYMENT_STATUSES).map(([value, { label }]) => ({
    value,
    label,
  })),
]

export const ORDER_STATUSES = {
  pending: { label: 'Pending', variant: 'warning' },
  confirmed: { label: 'Confirmed', variant: 'info' },
  processing: { label: 'Processing', variant: 'neutral' },
  completed: { label: 'Completed', variant: 'success' },
}

export const INVENTORY_STATUSES = {
  out: { label: 'Out of Stock', variant: 'danger' },
  low: { label: 'Low Stock', variant: 'warning' },
  healthy: { label: 'Healthy', variant: 'success' },
}

export const INVENTORY_STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'out', label: 'Out of Stock' },
  { value: 'low', label: 'Low Stock' },
  { value: 'healthy', label: 'Healthy' },
]

export const CHART_COLORS = {
  primary: 'var(--chart-primary)',
  previous: 'var(--chart-previous)',
  revenue: 'var(--chart-revenue)',
  expense: 'var(--chart-expense)',
  collected: 'var(--chart-collected)',
  pending: 'var(--chart-pending)',
  accent: 'var(--chart-accent)',
  mutedBar: 'var(--chart-muted)',
  grid: 'var(--chart-grid)',
  axis: 'var(--chart-axis)',
}

export const CHART_AXIS_TICK = {
  fill: 'var(--chart-axis)',
  fontSize: 11,
}

export const CHART_GRID_STROKE = 'var(--chart-grid)'
