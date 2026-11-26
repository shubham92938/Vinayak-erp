import { getActiveFirmId } from '../../../core/firmContextStore'
import { CATEGORY_DEMO_DATA } from '../data/categoryDemoData'
import { getAllProducts, getProducts } from '../../products/services/productService'
import { getFirmLabel } from '../../users/utils/userUtils'
import { searchMatches } from '../../../utils/search'

export const CATEGORY_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

export function filterCategories(categories, filters = {}) {
  const { search, firmId, status } = filters
  const query = String(search ?? '').trim().toLocaleLowerCase()

  return categories.filter((category) => {
    if (query) {
      const haystack = [
        category.name,
        category.code,
        category.description,
        getFirmLabel(category.firmId),
      ]
      if (!searchMatches(query, haystack)) return false
    }

    if (firmId && firmId !== 'all' && category.firmId !== firmId) return false
    if (status && status !== 'all' && category.status !== status) return false
    return true
  })
}

let categories = CATEGORY_DEMO_DATA.map((category) => ({ ...category }))

export const getAllCategories = () => categories.map((category) => ({ ...category }))

export const getCategories = () => {
  const activeFirmId = getActiveFirmId()
  return getAllCategories().filter((category) => !activeFirmId || category.firmId === activeFirmId)
}

export const getCategoryById = (categoryId) => {
  const activeFirmId = getActiveFirmId()
  const category = categories.find((entry) =>
    entry.id === categoryId && (!activeFirmId || entry.firmId === activeFirmId),
  )
  return category ? { ...category } : null
}

export const getAllCategoriesWithProductCounts = () => {
  const products = getAllProducts()

  return categories.map((category) => {
    const productCount = products.filter(
      (product) => product.categoryId === category.id,
    ).length
    return { ...category, productCount }
  })
}

export const getCategoriesWithProductCounts = () => {
  const products = getProducts()
  const activeFirmId = getActiveFirmId()

  return categories
    .filter((category) => !activeFirmId || category.firmId === activeFirmId)
    .map((category) => {
      const productCount = products.filter(
        (product) => product.categoryId === category.id,
      ).length
      return { ...category, productCount }
    })
}

function categoryCodeExists(categoryId, firmId, code, excludeId = undefined) {
  const normalized = String(code ?? '').trim().toLocaleLowerCase()
  return categories.some(
    (entry) =>
      entry.id !== excludeId &&
      entry.firmId === firmId &&
      String(entry.code ?? '').trim().toLocaleLowerCase() === normalized,
  )
}

function categoryNameExists(categoryId, firmId, name, excludeId = undefined) {
  const normalized = String(name ?? '').trim().toLocaleLowerCase()
  return categories.some(
    (entry) =>
      entry.id !== excludeId &&
      entry.firmId === firmId &&
      String(entry.name ?? '').trim().toLocaleLowerCase() === normalized,
  )
}

function uniqueCodeForFirm(firmId, baseCode) {
  const base = String(baseCode ?? 'CAT').toUpperCase().slice(0, 12)
  const seen = new Set(
    categories
      .filter((entry) => entry.firmId === firmId)
      .map((entry) => String(entry.code ?? '').toLocaleLowerCase()),
  )

  let candidate = base
  let suffix = 1
  while (seen.has(candidate.toLocaleLowerCase())) {
    candidate = `${base}-${suffix}`
    suffix += 1
  }

  return candidate
}

export function validateCategory({ firmId, name, code, excludeId = undefined }) {
  const errors = {}

  if (!name?.trim()) {
    errors.name = 'Category name is required'
  } else if (categoryNameExists(excludeId, firmId, name, excludeId)) {
    errors.name = 'This category name is already used in this firm'
  }

  if (!code?.trim()) {
    errors.code = 'Category code is required'
  } else if (categoryCodeExists(excludeId, firmId, code, excludeId)) {
    errors.code = 'This category code is already used in this firm'
  }

  return errors
}

export function createCategory(categoryData) {
  const category = {
    id: `cat-${categories.length + 100}`,
    code: uniqueCodeForFirm(categoryData.firmId, categoryData.code),
    status: 'active',
    createdAt: new Date().toISOString(),
    ...categoryData,
  }
  categories = [category, ...categories]
  return { ...category }
}

export function updateCategory(categoryId, categoryData) {
  const index = categories.findIndex((entry) => entry.id === categoryId)
  if (index === -1) return null

  const updated = {
    ...categories[index],
    ...categoryData,
    firmId: categories[index].firmId,
  }
  categories[index] = updated
  return { ...updated }
}

export function toggleCategoryStatus(categoryId) {
  const category = categories.find((entry) => entry.id === categoryId)
  if (!category) return null

  const status = category.status === 'active' ? 'inactive' : 'active'
  categories = categories.map((entry) =>
    entry.id === categoryId ? { ...entry, status } : entry,
  )
  return { ...category, status }
}

/**
 * Deleting a linked category is refused:
 * returns { deleted: false, products: [...] } when products reference it.
 */
export function deleteCategory(categoryId) {
  const products = getProducts().filter(
    (product) => product.categoryId === categoryId,
  )

  if (products.length > 0) {
    return { deleted: false, products }
  }

  categories = categories.filter((entry) => entry.id !== categoryId)
  return { deleted: true }
}
