import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, CircleAlert, ShieldCheck } from 'lucide-react'
import { Button, ConfirmDialog, Modal, useToast } from '../../../components/ui'
import { downloadCsv } from '../../../utils/csv'
import { getProducts } from '../../products/services/productService'
import { getFirmLabel } from '../../users/utils/userUtils'
import { CATEGORY_CSV_COLUMNS } from '../services/categoryUtils'
import CategoryForm from '../components/CategoryForm'
import CategoryTable from '../components/CategoryTable'
import { useCategories } from '../hooks/useCategories'
import '../styles/categories.css'

function KpiCard({ label, value, icon: Icon }) {
  return (
    <div className="categories-kpi-card">
      <div className="categories-kpi-card__top">
        <span className="categories-kpi-card__label">{label}</span>
        {Icon ? <Icon className="categories-kpi-card__icon" /> : null}
      </div>
      <span className="categories-kpi-card__value">{value}</span>
    </div>
  )
}

export default function CategoriesPage() {
  const toast = useToast()
  const navigate = useNavigate()
  const { categories, filters, setFilters, saveCategory, createCategory, deleteCategory, toggleCategoryStatus } = useCategories()

  const [formState, setFormState] = useState(null)
  const [confirmState, setConfirmState] = useState(null)

  const totalCategories = categories.length
  const activeCategories = categories.filter((category) => category.status === 'active').length
  const inactiveCategories = categories.filter((category) => category.status === 'inactive').length

  const clearFilters = () => setFilters({ search: '', firmId: 'all', status: 'all' })

  const exportCsv = () => {
    downloadCsv({
      filename: 'vinayak-categories.csv',
      columns: CATEGORY_CSV_COLUMNS,
      rows: categories.map((category) => ({
        id: category.id,
        name: category.name,
        code: category.code,
        description: category.description,
        firmId: getFirmLabel(category.firmId),
        status: category.status,
        createdAt: category.createdAt,
      })),
    })
  }

  const handleDelete = (categoryId) => {
    const result = deleteCategory(categoryId)
    if (result.deleted) {
      toast.success('Category deleted')
    }
    return result
  }

  const handleSaveCategory = (categoryData) => {
    if (formState?.mode === 'add') {
      createCategory(categoryData)
      toast.success('Category created')
    } else if (categoryData.id) {
      saveCategory(categoryData.id, categoryData)
      toast.success('Category updated')
    } else {
      createCategory(categoryData)
      toast.success('Category created')
    }
    setFormState(null)
  }

  const handleToggleStatus = (categoryId) => {
    toggleCategoryStatus(categoryId)
    toast.success('Category status updated')
  }

  return (
    <div className="categories-page">
      <header className="categories-header">
        <div className="categories-header__top">
          <div className="categories-header__text">
            <p className="categories-header__eyebrow"><span aria-hidden="true">#</span> Categories</p>
            <h1 className="categories-header__title">Categories</h1>
            <p className="categories-header__description">
              Organize products into a browsable structure.
            </p>
          </div>
          <div className="categories-header__actions">
            <Button variant="secondary" onClick={exportCsv}>Export CSV</Button>
            <Button size="sm" onClick={() => setFormState({ mode: 'add' })}>Add Category</Button>
          </div>
        </div>

        <div className="categories-kpi-grid">
          <KpiCard label="Total Categories" value={totalCategories} icon={ShieldCheck} />
          <KpiCard label="Active Categories" value={activeCategories} icon={CheckCircle2} />
          <KpiCard label="Inactive Categories" value={inactiveCategories} icon={CircleAlert} />
        </div>
      </header>

      <CategoryTable
        categories={categories}
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={clearFilters}
        onRowView={(id) => navigate(`/categories/${id}`)}
        onRowEdit={(id) => setFormState({ mode: 'edit', id })}
        onRowActivate={(id) => handleToggleStatus(id)}
        onRowDeactivate={(id) => handleToggleStatus(id)}
        onRowDelete={(id) => setConfirmState({ category: categories.find((c) => c.id === id) })}
        downloadCategories={exportCsv}
      />

      {formState && (
        <CategoryForm
          mode={formState.mode === 'view' ? 'edit' : formState.mode}
          category={formState.id ? categories.find((c) => c.id === formState.id) : null}
          onClose={() => setFormState(null)}
          onSubmit={handleSaveCategory}
        />
      )}

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
