import { Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Button, ConfirmDialog, Modal, useToast } from '../../../components/ui'
import { useAuth } from '../../../context/hooks'
import { hasModulePermission } from '../../../core/accessControl'
import { getProducts } from '../../products/services/productService'
import CategoryTable from '../components/CategoryTable'
import { useCategories } from '../hooks/useCategories'
import '../styles/categories.css'

export default function CategoriesPage() {
  const toast = useToast()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const canCreateCategories = hasModulePermission(currentUser, 'Categories', 'create')
  const canEditCategories = hasModulePermission(currentUser, 'Categories', 'edit')
  const canDeleteCategories = hasModulePermission(currentUser, 'Categories', 'delete')
  const {
    categories,
    filters,
    setFilters,
    deleteCategory,
  } = useCategories()
  const [confirmState, setConfirmState] = useState(null)

  const handleDelete = (categoryId) => {
    if (!canDeleteCategories) return
    const result = deleteCategory(categoryId)
    if (result.deleted) toast.success('Category deleted')
  }

  const requestDelete = (categoryId) => {
    if (!canDeleteCategories) return
    setConfirmState({ category: categories.find((entry) => entry.id === categoryId) })
  }

  const showAdvancedFilters = currentUser?.role === 'super_admin'

  return (
    <div className="categories-page recorded-categories-page">
      <section className="recorded-category-surface">
        <header className="recorded-category-header">
          <h1>Categories</h1>
          {canCreateCategories && (
            <button
              type="button"
              className="recorded-category-add"
              onClick={() => navigate('/categories/create')}
              aria-label="Create category"
              title="Create category"
            >
              <Plus size={18} strokeWidth={1.6} />
            </button>
          )}
        </header>

        <CategoryTable
          categories={categories}
          filters={filters}
          onFiltersChange={setFilters}
          onRowEdit={(id) => navigate(`/categories/${id}/edit`)}
          onRowDelete={requestDelete}
          canEdit={canEditCategories}
          canDelete={canDeleteCategories}
          showAdvancedFilters={showAdvancedFilters}
        />
      </section>

      <ConfirmDialog
        open={Boolean(confirmState) && !confirmState.blocked}
        onClose={() => setConfirmState(null)}
        onConfirm={() => {
          const linked = getProducts().filter((product) => product.categoryId === confirmState?.category?.id)
          if (linked.length > 0) {
            setConfirmState({ blocked: true, category: confirmState.category, products: linked })
            return
          }
          handleDelete(confirmState.category.id)
          setConfirmState(null)
        }}
        title="Delete category?"
        description={`${confirmState?.category?.name ?? ''} will be removed from the category list.`}
        confirmLabel="Delete Category"
        cancelLabel="Cancel"
        tone="danger"
      />

      {confirmState?.blocked && (
        <Modal
          open
          onClose={() => setConfirmState(null)}
          title="Category has products"
          description="This category cannot be deleted yet because products are assigned to it."
          footer={
            <Button variant="secondary" onClick={() => setConfirmState(null)}>
              Close
            </Button>
          }
        >
          <div className="categories-linked-products">
            <strong>Products assigned:</strong>
            <ul>
              {confirmState.products.slice(0, 8).map((product) => (
                <li key={product.id}>{product.name}</li>
              ))}
              {confirmState.products.length > 8 ? (
                <li>+ {confirmState.products.length - 8} more</li>
              ) : null}
            </ul>
            <p>
              Remove or re-assign these products first, or deactivate the
              category instead.
            </p>
          </div>
        </Modal>
      )}
    </div>
  )
}
