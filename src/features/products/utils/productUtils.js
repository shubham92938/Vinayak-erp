import { getFirmLabel, getInitials } from '../../users/utils/userUtils'

export { getFirmLabel }

export const PRODUCT_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

export const STOCK_STATUSES = [
  { value: 'all', label: 'All stock' },
  { value: 'in-stock', label: 'In Stock' },
  { value: 'low-stock', label: 'Low Stock' },
  { value: 'out-of-stock', label: 'Out of Stock' },
  { value: 'untracked', label: 'Untracked' },
]

export const UNITS = [
  { value: 'pcs', label: 'pcs' },
  { value: 'pieces', label: 'pieces' },
  { value: 'units', label: 'units' },
  { value: 'pairs', label: 'pairs' },
  { value: 'ml', label: 'ml' },
  { value: 'l', label: 'l' },
  { value: 'liters', label: 'liters' },
  { value: 'kg', label: 'kg' },
  { value: 'g', label: 'g' },
  { value: 'boxes', label: 'boxes' },
  { value: 'cartons', label: 'cartons' },
  { value: 'packs', label: 'packs' },
  { value: 'rolls', label: 'rolls' },
  { value: 'meters', label: 'meters' },
  { value: 'nos', label: 'nos' },
  { value: 'sets', label: 'sets' },
  { value: 'caps', label: 'caps' },
]

const AVATAR_COLORS = [
  '#2563eb', '#0ea5e9', '#059669', '#d97706', '#dc2626',
  '#7c3aed', '#0d9488', '#db2777', '#4f46e5',
]

/**
 * Placeholder avatar for products without an image.
 * A tiny inline SVG data URL — no network requests, no server upload.
 */
export function productImageUrl(name) {
  const initials = getInitials(name).slice(0, 2).toUpperCase() || 'P'
  const color = AVATAR_COLORS[initials.charCodeAt(0) % AVATAR_COLORS.length]
  const light = `${color}18`
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">' +
    `<rect width="160" height="160" rx="24" fill="${light}"/>` +
    '<circle cx="80" cy="58" r="22" fill="' + color + '"/>' +
    `<path d="M52 104c8-15 24-25 32-25s16.4 10.6 24 25" fill="none" stroke="${color}" stroke-width="9" stroke-linecap="round"/>` +
    `<text x="80" y="124" text-anchor="middle" font-family="system-ui, sans-serif" font-size="16" font-weight="600" fill="${color}">${initials}</text>` +
    '</svg>'

  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

export function getStockStatus(product) {
  if (!product) return 'untracked'

  if (product.stockTracking === false) return 'untracked'
  if ((product.quantity ?? 0) <= 0) return 'out-of-stock'
  if ((product.quantity ?? 0) <= (product.minStock ?? 0)) return 'low-stock'
  return 'in-stock'
}

export function getStockStatusLabel(status) {
  const match = STOCK_STATUSES.find((entry) => entry.value === status)
  return match?.label ?? status ?? 'Untracked'
}

export function formatPrice(value) {
  if (value === null || value === undefined) return '—'
  return `₹${Number(value).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
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

export function getProductDate(product) {
  return product?.updatedAt ?? product?.createdAt
}

function getSearchHaystack(product, categoriesById, firmsById) {
  const category = categoriesById?.[product.categoryId]
  const firm = firmsById?.[product.firmId]
  return [
    product.name,
    product.code,
    category?.name,
    category?.code,
    firm?.name,
    firm?.location,
    product.unit,
  ]
    .filter(Boolean)
    .map((value) => String(value).toLocaleLowerCase())
    .join(' ')
}

export function filterProducts(
  products,
  filters = {},
  { categoriesById = {}, firmsById = {} } = {},
) {
  const { search, firmId, categoryId, status, stockStatus, fromDate, toDate } =
    filters
  const query = String(search ?? '').trim().toLocaleLowerCase()

  return products.filter((product) => {
    if (query) {
      const haystack = getSearchHaystack(product, categoriesById, firmsById)
      if (!haystack.includes(query)) return false
    }

    if (firmId && firmId !== 'all' && product.firmId !== firmId) return false
    if (categoryId && categoryId !== 'all' && product.categoryId !== categoryId) {
      return false
    }
    if (status && status !== 'all' && product.status !== status) return false
    if (stockStatus && stockStatus !== 'all' && getStockStatus(product) !== stockStatus) {
      return false
    }

    const start = String(fromDate ?? '').slice(0, 10)
    const end = String(toDate ?? '').slice(0, 10)
    if (start || end) {
      const productDate = String(getProductDate(product) ?? '').slice(0, 10)
      if (start && productDate < start) return false
      if (end && productDate > end) return false
    }

    return true
  })
}

export function productCodeExists(products, firmId, code, excludeId = undefined) {
  const normalized = String(code ?? '').trim().toLocaleLowerCase()
  return products.some(
    (product) =>
      product.id !== excludeId &&
      product.firmId === firmId &&
      String(product.code ?? '').trim().toLocaleLowerCase() === normalized,
  )
}

export function getKpis(products) {
  return products.reduce(
    (acc, product) => {
      acc.total += 1
      if (product.status === 'active') acc.active += 1
      else acc.inactive += 1
      if (getStockStatus(product) === 'low-stock') acc.lowStock += 1
      acc.totalQuantity += Number(product.quantity ?? 0)
      return acc
    },
    { total: 0, active: 0, inactive: 0, lowStock: 0, totalQuantity: 0 },
  )
}

export const PRODUCT_CSV_COLUMNS = [
  { key: 'id', label: 'Product ID' },
  { key: 'name', label: 'Name' },
  { key: 'code', label: 'Code' },
  { key: 'categoryId', label: 'Category' },
  { key: 'firmId', label: 'Firm' },
  { key: 'unit', label: 'Unit' },
  { key: 'quantity', label: 'Quantity' },
  { key: 'buyingPrice', label: 'Buying Price' },
  { key: 'sellingPrice', label: 'Selling Price' },
  { key: 'status', label: 'Status' },
  { key: 'createdAt', label: 'Created Date' },
]
