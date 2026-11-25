import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, useToast } from '../../../components/ui'
import { useAuth } from '../../../context/hooks'
import { hasModulePermission } from '../../../core/accessControl'
import CategoryForm from '../components/CategoryForm'
import { useCategories } from '../hooks/useCategories'
import '../styles/categories.css'

export default function CategoryFormPage({ mode }) {
  const navigate = useNavigate()
  const toast = useToast()
  const { categoryId } = useParams()
  const { currentUser } = useAuth()
  const isCreating = mode === 'add'
  const permission = isCreating ? 'create' : 'edit'
  const hasPermission = hasModulePermission(currentUser, 'Categories', permission)
  const {
    categories,
    createCategory,
    saveCategory,
  } = useCategories()
  const category = useMemo(
    () => (isCreating ? null : categories.find((entry) => entry.id === categoryId) ?? null),
    [categories, categoryId, isCreating],
  )

  const handleSubmit = (categoryData) => {
    if (!hasPermission) return null

    if (isCreating) {
      const created = createCategory(categoryData)
      if (!created) {
        toast.error('The category could not be created')
        return null
      }
      return created
    }

    if (!category) return null
    const updated = saveCategory(category.id, categoryData)
    if (!updated) {
      toast.error('The category could not be updated')
      return null
    }
    return updated
  }

  const close = () => navigate('/categories')

  if (!isCreating && !category) {
    return (
      <div className="categories-page">
        <div className="categories-details-empty">
          <Button variant="secondary" size="sm" onClick={close}>Back to Categories</Button>
          <h2>Category not found</h2>
          <p>We could not find the category you requested.</p>
        </div>
      </div>
    )
  }

  if (!hasPermission) {
    return (
      <div className="categories-page">
        <div className="categories-details-empty">
          <Button variant="secondary" size="sm" onClick={close}>Back to Categories</Button>
          <h2>Category changes are restricted</h2>
          <p>You do not have permission to {isCreating ? 'create' : 'edit'} categories in this firm.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="categories-page recorded-categories-page recorded-category-form-page">
      <CategoryForm
        mode={mode}
        category={category}
        standalone
        onClose={close}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
