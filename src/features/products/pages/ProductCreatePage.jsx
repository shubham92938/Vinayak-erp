import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../../../components/ui'
import { useAuth } from '../../../context/hooks'
import { hasModulePermission } from '../../../core/accessControl'
import { getCategoriesWithProductCounts } from '../../categories/services/categoryService'
import ProductForm from '../components/ProductForm'
import { useProducts } from '../hooks/useProducts'
import '../styles/products.css'

/**
 * Keep product creation on its own URL, matching the recorded workflow while
 * retaining the same permission-checked service used by the list and detail
 * surfaces.
 */
export default function ProductCreatePage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { currentUser } = useAuth()
  const canCreateProducts = hasModulePermission(currentUser, 'Products', 'create')
  const categories = useMemo(() => getCategoriesWithProductCounts(), [])
  const { createProduct } = useProducts()

  const handleSubmit = (productData) => {
    if (!canCreateProducts) return null

    const saved = createProduct(productData)
    if (!saved) {
      toast.error('The product could not be saved')
      return null
    }

    toast.success('Product created')
    return saved
  }

  if (!canCreateProducts) {
    return (
      <div className="products-page">
        <div className="products-details-empty">
          <h2>Product creation is restricted</h2>
          <p>You do not have permission to create products in this firm.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="products-page">
      <ProductForm
        mode="add"
        categories={categories}
        onClose={() => navigate('/products')}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
