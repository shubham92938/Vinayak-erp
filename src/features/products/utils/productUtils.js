import { getFirmLabel } from '../../users/utils/userUtils'

export { getFirmLabel }

export function formatMoney(amount) {
  return `₹${Number(amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`
}

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
  { value: 'm', label: 'm' },
  { value: 'meters', label: 'meters' },
  { value: 'nos', label: 'nos' },
  { value: 'sets', label: 'sets' },
  { value: 'caps', label: 'caps' },
]

/**
 * Placeholder for products without an uploaded image.
 * A tiny inline SVG data URL keeps the recorded "NO PHOTO" state local and
 * avoids a network request or an invented catalogue image.
 */
export function productImageUrl() {
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240" viewBox="0 0 320 240">' +
    '<rect width="320" height="240" fill="#f0f4f1"/>' +
    '<path d="M101 128V99c0-10 8-18 18-18h27l12-14h24l12 14h27c10 0 18 8 18 18v29" fill="none" stroke="#778581" stroke-width="7" stroke-linejoin="round"/>' +
    '<circle cx="170" cy="113" r="28" fill="none" stroke="#778581" stroke-width="7"/>' +
    '<circle cx="209" cy="91" r="5" fill="#778581"/>' +
    '<text x="170" y="171" text-anchor="middle" font-family="system-ui, sans-serif" font-size="25" font-weight="700" fill="#263b38">NO PHOTO</text>' +
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
