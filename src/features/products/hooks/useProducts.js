import { useCallback, useMemo, useState } from 'react'
import * as productService from '../services/productService'
import { getPriceHistoryFor } from '../data/priceHistoryDemoData'
import { getStockHistoryFor } from '../data/stockHistoryDemoData'
import { filterProducts } from '../utils/productUtils'

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
  const [products, setProducts] = useState(() => productService.getProducts())
  const [filters, setFilters] = useState(initialFilters)

  const visibleProducts = useMemo(
    () => filterProducts(products, filters, { categoriesById, firmsById }),
    [products, filters, categoriesById, firmsById],
  )

  const saveProduct = (productId, productData) => {
    const product = productService.updateProduct(productId, productData)
    if (product) setProducts(productService.getProducts())
    return product
  }

  const createProduct = (productData) => {
    const product = productService.createProduct(productData)
    setProducts(productService.getProducts())
    return product
  }

  const deleteProduct = (productId) => {
    productService.deleteProduct(productId)
    setProducts(productService.getProducts())
  }

  const toggleProductStatus = (productId) => {
    const product = productService.toggleProductStatus(productId)
    setProducts(productService.getProducts())
    return product
  }

  const duplicateProduct = (productId, overrides) => {
    const product = productService.duplicateProduct(productId, overrides)
    setProducts(productService.getProducts())
    return product
  }

  const refresh = useCallback(() => setProducts(productService.getProducts()), [])

  return {
    products: visibleProducts,
    filters,
    setFilters,
    saveProduct,
    createProduct,
    deleteProduct,
    toggleProductStatus,
    duplicateProduct,
    refresh,
    getProductById: productService.getProductById,
    getProductByCode: productService.getProductByCode,
    getStockHistoryFor,
    getPriceHistoryFor,
  }
}
