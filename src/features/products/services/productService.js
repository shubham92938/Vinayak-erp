import { getActiveFirmId } from '../../../core/firmContextStore'
import { PRODUCT_DEMO_DATA } from '../data/productDemoData'

let products = PRODUCT_DEMO_DATA.map((product) => ({ ...product }))

export const getAllProducts = () => products.map((product) => ({ ...product }))

export const getProducts = () => {
  const activeFirmId = getActiveFirmId()
  return getAllProducts().filter((product) => !activeFirmId || product.firmId === activeFirmId)
}

export const getProductById = (productId) => {
  const activeFirmId = getActiveFirmId()
  const product = products.find((entry) =>
    entry.id === productId && (!activeFirmId || entry.firmId === activeFirmId),
  )
  return product ? { ...product } : null
}

export const getProductByCode = (code, firmId) => {
  const targetFirmId = firmId ?? getActiveFirmId()
  return products.find(
    (entry) =>
      String(entry.code ?? '').toLocaleLowerCase() ===
        String(code ?? '').toLocaleLowerCase() &&
      (!targetFirmId || entry.firmId === targetFirmId),
  ) ?? null
}

export function createProduct(productData) {
  const product = {
    id: `prod-${products.length + 1}`,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...productData,
  }
  products = [product, ...products]
  return { ...product }
}

export function updateProduct(productId, productData) {
  const index = products.findIndex((entry) => entry.id === productId)
  if (index === -1) return null

  const updated = {
    ...products[index],
    ...productData,
    firmId: products[index].firmId,
    updatedAt: new Date().toISOString(),
  }
  products[index] = updated
  return { ...updated }
}

export function updateProductQuantity(productId, newQuantity) {
  const index = products.findIndex((entry) => entry.id === productId)
  if (index === -1) return null

  const updated = { ...products[index], quantity: Math.max(0, Math.round(newQuantity ?? 0)), updatedAt: new Date().toISOString() }
  products[index] = updated
  return { ...updated }
}

export function toggleProductStatus(productId) {
  const product = products.find((entry) => entry.id === productId)
  if (!product) return null

  const status = product.status === 'active' ? 'inactive' : 'active'
  products = products.map((entry) =>
    entry.id === productId ? { ...entry, status } : entry,
  )
  return { ...product, status }
}

export function deleteProduct(productId) {
  products = products.filter((entry) => entry.id !== productId)
  return productId
}

export function generateUniqueProductCode(firmId, baseCode) {
  const base = String(baseCode ?? 'PRD').toUpperCase().slice(0, 16)
  const seen = new Set(
    products
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

export function duplicateProduct(productId, overrides = {}) {
  const original = getProductById(productId)
  if (!original) return null

  const id = `prod-${products.length + 100}`
  const code = generateUniqueProductCode(original.firmId, original.code)

  const duplicated = {
    ...original,
    id,
    code,
    status: 'active',
    quantity: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }

  products = [duplicated, ...products]
  return { ...duplicated }
}
