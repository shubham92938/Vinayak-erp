import { useMemo, useState } from 'react'
import * as categoryService from '../services/categoryService'
import { useAuth, useFirmContext } from '../../../context/hooks'
import {
  canAccessRecord,
  enforceCreateFirmId,
  filterRecordsForUser,
  getDataPermission,
} from '../../../core/accessControl'

const initialFilters = { search: '', firmId: 'all', status: 'all' }

export function useCategories() {
  const { currentUser } = useAuth()
  const { currentFirmId } = useFirmContext()
  const [allCategories, setCategories] = useState(() => categoryService.getAllCategoriesWithProductCounts())
  const [filters, setFilters] = useState(initialFilters)

  const canViewAllCategories = getDataPermission(currentUser, 'Categories', 'view', 'all')
  const categoryFirmScope = currentUser?.role === 'super_admin' || canViewAllCategories ? null : currentFirmId
  const scopedCategories = useMemo(
    () => filterRecordsForUser(allCategories, currentUser, 'Categories', 'view', categoryFirmScope),
    [allCategories, currentUser, categoryFirmScope],
  )
  const visibleCategories = useMemo(
    () => categoryService.filterCategories(scopedCategories, filters),
    [scopedCategories, filters],
  )

  const refresh = () => setCategories(categoryService.getAllCategoriesWithProductCounts())

  const saveCategory = (categoryId, categoryData) => {
    const category = scopedCategories.find((entry) => entry.id === categoryId)
    if (!category || !canAccessRecord(currentUser, category, 'Categories', 'edit')) return null
    const updated = categoryService.updateCategory(categoryId, { ...categoryData, firmId: category.firmId })
    if (updated) refresh()
    return updated
  }

  const createCategory = (categoryData) => {
    const firmId = enforceCreateFirmId(currentUser, categoryData.firmId ?? currentFirmId, 'Categories')
    if (!firmId || !canAccessRecord(currentUser, { firmId }, 'Categories', 'create')) return null
    const category = categoryService.createCategory({ ...categoryData, firmId })
    refresh()
    return category
  }

  const deleteCategory = (categoryId) => {
    const category = scopedCategories.find((entry) => entry.id === categoryId)
    if (!category || !canAccessRecord(currentUser, category, 'Categories', 'delete')) return { deleted: false }
    const result = categoryService.deleteCategory(categoryId)
    if (result.deleted) refresh()
    return result
  }

  const toggleCategoryStatus = (categoryId) => {
    const category = scopedCategories.find((entry) => entry.id === categoryId)
    if (!category || !canAccessRecord(currentUser, category, 'Categories', 'edit')) return null
    const updated = categoryService.toggleCategoryStatus(categoryId)
    refresh()
    return updated
  }

  return {
    categories: visibleCategories,
    filters,
    setFilters,
    saveCategory,
    createCategory,
    deleteCategory,
    toggleCategoryStatus,
    getCategoryById: (categoryId) => scopedCategories.find((category) => category.id === categoryId) ?? null,
    getCategoriesWithProductCounts: () => scopedCategories,
  }
}
