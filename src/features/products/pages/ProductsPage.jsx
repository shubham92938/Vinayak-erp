import { FileDown, FileSpreadsheet, Plus, RefreshCw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, useToast } from '../../../components/ui'
import { useAuth } from '../../../context/hooks'
import { hasModulePermission } from '../../../core/accessControl'
import { downloadCsv } from '../../../utils/csv'
import { getCategoriesWithProductCounts } from '../../categories/services/categoryService'
import { getFirmLabel } from '../../users/utils/userUtils'
import { PRODUCT_CSV_COLUMNS } from '../utils/productUtils'
import ProductForm from '../components/ProductForm'
import ProductTable from '../components/ProductTable'
import { useProducts } from '../hooks/useProducts'
import '../styles/products.css'

export default function ProductsPage() {
  const toast = useToast()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const canCreateProducts = hasModulePermission(currentUser, 'Products', 'create')
  const canEditProducts = hasModulePermission(currentUser, 'Products', 'edit')
  const canExportProducts = hasModulePermission(currentUser, 'Products', 'export')
  const categories = useMemo(() => getCategoriesWithProductCounts(), [])
  const categoriesById = useMemo(() => Object.fromEntries(categories.map((category) => [category.id, category])), [categories])
  const { products, filters, setFilters, createProduct, saveProduct, refresh } = useProducts({ categoriesById })
  const [formState, setFormState] = useState(null)

  const exportCsv = () => {
    if (!canExportProducts) return
    downloadCsv({
      filename: 'vinayak-products.csv',
      columns: PRODUCT_CSV_COLUMNS,
      rows: products.map((product) => ({
        id: product.id,
        name: product.name,
        code: product.code,
        categoryId: categoriesById[product.categoryId]?.name ?? product.categoryId,
        firmId: getFirmLabel(product.firmId),
        unit: product.unit,
        quantity: product.quantity,
        buyingPrice: product.buyingPrice,
        sellingPrice: product.sellingPrice,
        status: product.status,
        createdAt: product.createdAt,
      })),
    })
  }

  const handleSave = (productData) => {
    const saved = formState?.mode === 'add'
      ? createProduct(productData)
      : saveProduct(formState?.id, productData)
    if (!saved) {
      toast.error('The product could not be saved')
      return null
    }
    toast.success(formState?.mode === 'add' ? 'Product created' : 'Product updated')
    setFormState(null)
    return saved
  }

  if (formState) {
    return (
      <div className="products-page">
        <ProductForm
          mode={formState.mode}
          product={formState.id ? products.find((product) => product.id === formState.id) : null}
          categories={categories}
          onClose={() => setFormState(null)}
          onSubmit={handleSave}
        />
      </div>
    )
  }

  return (
    <div className="products-page">
      <header className="recorded-page-header">
        <h1>Products</h1>
        <div className="recorded-page-header__actions">
          <button type="button" className="recorded-icon-button" onClick={exportCsv} disabled={!canExportProducts} title="Export PDF" aria-label="Export PDF">
            <FileDown size={14} />
          </button>
          <button type="button" className="recorded-icon-button" onClick={exportCsv} disabled={!canExportProducts} title="Export Excel" aria-label="Export Excel">
            <FileSpreadsheet size={14} />
          </button>
          <button type="button" className="recorded-icon-button" onClick={refresh} title="Refresh products" aria-label="Refresh products">
            <RefreshCw size={14} />
          </button>
          {canCreateProducts && (
            <Button size="sm" leadingIcon={<Plus size={14} />} onClick={() => setFormState({ mode: 'add' })}>
              Create Products
            </Button>
          )}
        </div>
      </header>

      <ProductTable
        products={products}
        filters={filters}
        onFiltersChange={setFilters}
        categories={categories}
        onRowView={(id) => navigate(`/products/${id}`)}
        onRowEdit={(id) => setFormState({ mode: 'edit', id })}
        canEdit={canEditProducts}
      />
    </div>
  )
}
