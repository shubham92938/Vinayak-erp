import { getProducts } from '../../products/services/productService'
import { getCategoriesWithProductCounts } from '../../categories/services/categoryService'
import { getFirmLabel } from '../../users/utils/userUtils'

const categoriesById = Object.fromEntries(
  getCategoriesWithProductCounts().map((category) => [category.id, category]),
)

export function getPriceListRows(filters = {}) {
  const products = getProducts()

  const { firmId, categoryId } = filters

  return products
    .filter((product) => {
      if (firmId && firmId !== 'all' && product.firmId !== firmId) return false
      if (categoryId && categoryId !== 'all' && product.categoryId !== categoryId) return false
      return true
    })
    .map((product) => ({
      id: product.id,
      productId: product.id,
      name: product.name,
      code: product.code,
      category: categoriesById[product.categoryId]?.name ?? '—',
      firm: getFirmLabel(product.firmId),
      buyingPrice: product.buyingPrice ?? 0,
      sellingPrice: product.sellingPrice ?? 0,
      mrp: product.mrp ?? null,
      lastUpdated: product.updatedAt ?? product.createdAt,
    }))
}

export function getPriceListTotalRows() {
  return getPriceListRows().length
}
