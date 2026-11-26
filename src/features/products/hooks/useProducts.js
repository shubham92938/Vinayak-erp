import { useCallback, useMemo, useState } from 'react'
import * as productService from '../services/productService'
import { getPriceHistoryFor } from '../data/priceHistoryDemoData'
import { getStockHistoryFor } from '../data/stockHistoryDemoData'
import { filterProducts } from '../utils/productUtils'
import { useAuth, useFirmContext } from '../../../context/hooks'
import {
  canAccessRecord,
  enforceCreateFirmId,
  filterRecordsForUser,
  getDataPermission,
} from '../../../core/accessControl'

const initialFilters = {
  search: '',
  firmId: 'all',
  categoryId: 'all',
  status: 'all',
  stockStatus: 'all',
  fromDate: '',
  toDate: '',
}

export function useProducts({ categoriesById = {}, firmsById = {} } = {}) {
  const { currentUser } = useAuth()
  const { currentFirmId } = useFirmContext()
  const [allProducts, setProducts] = useState(() => productService.getAllProducts())
  const [filters, setFilters] = useState(initialFilters)

  const canViewAllProducts = getDataPermission(currentUser, 'Products', 'view', 'all')
  const productFirmScope = currentUser?.role === 'super_admin' || canViewAllProducts ? null : currentFirmId
  const scopedProducts = useMemo(
    () => filterRecordsForUser(allProducts, currentUser, 'Products', 'view', productFirmScope),
    [allProducts, currentUser, productFirmScope],
  )
  const visibleProducts = useMemo(
    () => filterProducts(scopedProducts, filters, { categoriesById, firmsById }),
    [scopedProducts, filters, categoriesById, firmsById],
  )

  const canEditProduct = (productId, action = 'edit') => {
    const product = allProducts.find((entry) => entry.id === productId)
    return product ? canAccessRecord(currentUser, product, 'Products', action) : false
  }

  const saveProduct = (productId, productData) => {
    const existingProduct = allProducts.find((entry) => entry.id === productId)
    if (!existingProduct || !canEditProduct(productId, 'edit')) return null
    const product = productService.updateProduct(productId, {
      ...productData,
      firmId: existingProduct.firmId,
    })
    if (product) setProducts(productService.getAllProducts())
    return product
  }

  const createProduct = (productData) => {
    const firmId = enforceCreateFirmId(currentUser, productData.firmId ?? currentFirmId, 'Products')
    if (!firmId || !canAccessRecord(currentUser, { firmId }, 'Products', 'create')) return null
    const product = productService.createProduct({ ...productData, firmId })
    setProducts(productService.getAllProducts())
    return product
  }

  const deleteProduct = (productId) => {
    if (!canEditProduct(productId, 'delete')) return null
    productService.deleteProduct(productId)
    setProducts(productService.getAllProducts())
    return productId
  }

  const toggleProductStatus = (productId) => {
    if (!canEditProduct(productId, 'edit')) return null
    const product = productService.toggleProductStatus(productId)
    setProducts(productService.getAllProducts())
    return product
  }

  const duplicateProduct = (productId, overrides) => {
    if (!canEditProduct(productId, 'create')) return null
    const product = productService.duplicateProduct(productId, {
      ...overrides,
      firmId: currentFirmId ?? overrides?.firmId,
    })
    setProducts(productService.getAllProducts())
    return product
  }

  const refresh = useCallback(() => setProducts(productService.getAllProducts()), [])

  return {
    products: visibleProducts,
    filters,
    setFilters,
    saveProduct,
    createProduct,
    canEditProduct,
    deleteProduct,
    toggleProductStatus,
    duplicateProduct,
    refresh,
    getProductById: (productId) => scopedProducts.find((product) => product.id === productId) ?? null,
    getProductByCode: productService.getProductByCode,
    getStockHistoryFor,
    getPriceHistoryFor,
  }
}
