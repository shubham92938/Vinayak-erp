import { useMemo, useState } from 'react'
import * as categoryService from '../services/categoryService'

const initialFilters = { search: '', firmId: 'all', status: 'all' }

export function useCategories() {
  const [categories, setCategories] = useState(() =>
    categoryService.getCategoriesWithProductCounts(),
  )
  const [filters, setFilters] = useState(initialFilters)

  const visibleCategories = useMemo(
    () => categoryService.filterCategories(categories, filters),
    [categories, filters],
  )

  const refresh = () => setCategories(categoryService.getCategoriesWithProductCounts())

  const saveCategory = (categoryId, categoryData) => {
    const category = categoryService.updateCategory(categoryId, categoryData)
    if (category) refresh()
    return category
  }

  const createCategory = (categoryData) => {
    const category = categoryService.createCategory(categoryData)
    refresh()
    return category
  }

  const deleteCategory = (categoryId) => {
    const result = categoryService.deleteCategory(categoryId)
    if (result.deleted) refresh()
    return result
  }

  const toggleCategoryStatus = (categoryId) => {
    const category = categoryService.toggleCategoryStatus(categoryId)
    refresh()
    return category
  }

  return {
    categories: visibleCategories,
    filters,
    setFilters,
    saveCategory,
    createCategory,
    deleteCategory,
    toggleCategoryStatus,
    getCategoryById: categoryService.getCategoryById,
    getCategoriesWithProductCounts: categoryService.getCategoriesWithProductCounts,
  }
}
