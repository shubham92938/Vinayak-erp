import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../../../context/hooks'
import { hasModulePermission } from '../../../core/accessControl'
import { ArrowLeft, Edit } from 'lucide-react'
import { Button, Card, CardBody, Modal, useToast } from '../../../components/ui'
import { getProducts } from '../../products/services/productService'
import { formatPrice, getFirmLabel } from '../../products/utils/productUtils'
import CategoryForm from '../components/CategoryForm'
import { useCategories } from '../hooks/useCategories'
import { formatCategoryDate } from '../services/categoryUtils'
import '../styles/categories.css'

export default function CategoryDetailsPage({ categoryId: providedCategoryId }) {
  const { categoryId: routeCategoryId } = useParams()
  const categoryId = providedCategoryId ?? routeCategoryId
  const toast = useToast()
  const { currentUser } = useAuth()
  const canEditCategory = hasModulePermission(currentUser, 'Categories', 'edit')
  const { getCategoryById, saveCategory, toggleCategoryStatus } = useCategories()
  const category = getCategoryById(categoryId)

  const products = useMemo(
    () =>
      getProducts()
        .filter((product) => product.categoryId === categoryId)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [categoryId],
  )

  const [isEditing, setIsEditing] = useState(false)

  const handleToggleStatus = () => {
    if (!canEditCategory) return
    const updated = toggleCategoryStatus(category.id)
    if (updated) toast.success('Category status updated')
  }

  const handleSave = (categoryData) => {
    if (categoryData.id && canEditCategory) {
      const updated = saveCategory(categoryData.id, categoryData)
      if (updated) toast.success('Category updated')
    }
    setIsEditing(false)
  }

  if (!category) {
    return (
      <div className="categories-page">
        <div className="categories-details-empty">
          <Button variant="secondary" size="sm" leadingIcon={<ArrowLeft size={14} />} onClick={() => window.history.back()}>
            Back to Categories
          </Button>
          <h2>Category not found</h2>
          <p>We could not find the category you requested.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="categories-page">
      <header className="categories-header">
        <div className="categories-header__top">
          <div className="categories-header__text">
            <p className="categories-header__eyebrow"><span aria-hidden="true">#</span> Category Details</p>
            <h1 className="categories-header__title">{category.name}</h1>
            <p className="categories-header__description">
              {category.code} · {getFirmLabel(category.firmId)}
            </p>
          </div>
          <div className="categories-header__actions">
            <Button variant="secondary" onClick={() => window.history.back()} leadingIcon={<ArrowLeft size={14} />}>
              Back to Categories
            </Button>
            <Button variant="secondary" onClick={handleToggleStatus} leadingIcon={<Edit size={14} />} disabled={!canEditCategory}>
              {category.status === 'active' ? 'Inactivate' : 'Activate'}
            </Button>
            <Button onClick={() => setIsEditing(true)} leadingIcon={<Edit size={14} />} disabled={!canEditCategory}>
              Edit Category
            </Button>
          </div>
        </div>
      </header>

      <Card className="categories-details-card">
        <CardBody className="categories-details-summary">
          <div className="categories-details-summary__item">
            <span className="categories-details-summary__label">Name</span>
            <span className="categories-details-summary__value">{category.name}</span>
          </div>
          <div className="categories-details-summary__item">
            <span className="categories-details-summary__label">Code</span>
            <span className="categories-details-summary__value">{category.code}</span>
          </div>
          <div className="categories-details-summary__item">
            <span className="categories-details-summary__label">Firm</span>
            <span className="categories-details-summary__value">{getFirmLabel(category.firmId)}</span>
          </div>
          <div className="categories-details-summary__item">
            <span className="categories-details-summary__label">Products</span>
            <span className="categories-details-summary__value">{products.length}</span>
          </div>
          <div className="categories-details-summary__item">
            <span className="categories-details-summary__label">Status</span>
            <span className="categories-details-summary__value">
              {category.status === 'active' ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="categories-details-summary__item">
            <span className="categories-details-summary__label">Created</span>
            <span className="categories-details-summary__value">{formatCategoryDate(category.createdAt)}</span>
          </div>
        </CardBody>
      </Card>

      {category.description && (
        <Card className="categories-details-card">
          <CardBody className="categories-details-description">
            <p>{category.description}</p>
          </CardBody>
        </Card>
      )}

      <Card className="categories-details-card">
        <CardBody>
          <h3 className="categories-details-card__title">Products in this category</h3>
          {products.length === 0 ? (
            <p className="categories-empty">
              No products are currently assigned to this category.
            </p>
          ) : (
            <table className="categories-details-table">
              <thead>
                <tr>
                  <th scope="col">Product</th>
                  <th scope="col">Unit</th>
                  <th scope="col">Buying Price</th>
                  <th scope="col">Selling Price</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.unit}</td>
                    <td>{formatPrice(product.buyingPrice)}</td>
                    <td>{formatPrice(product.sellingPrice)}</td>
                    <td>{product.status === 'active' ? 'Active' : 'Inactive'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>

      <Modal
        open={isEditing}
        onClose={() => setIsEditing(false)}
        title={`Edit ${category.name}`}
        description="Update the category name, code, description, and firm."
      >
        <CategoryForm
          mode="edit"
          category={category}
          onClose={() => setIsEditing(false)}
          onSubmit={handleSave}
        />
      </Modal>
    </div>
  )
}
