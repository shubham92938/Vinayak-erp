import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/hooks'
import { hasModulePermission } from '../../../core/accessControl'
import { CheckCircle2, CircleAlert, ShieldCheck } from 'lucide-react'
import { Button, ConfirmDialog, useToast } from '../../../components/ui'
import { downloadCsv } from '../../../utils/csv'
import { getCategoriesWithProductCounts } from '../../categories/services/categoryService'
import { getFirmLabel } from '../../users/utils/userUtils'
import { PRODUCT_CSV_COLUMNS, getKpis } from '../utils/productUtils'
import ProductForm from '../components/ProductForm'
import ProductTable from '../components/ProductTable'
import { useProducts } from '../hooks/useProducts'
import '../styles/products.css'

function KpiCard({ label, value, icon: Icon }) {
  return (
    <div className="products-kpi-card">
      <div className="products-kpi-card__top">
        <span className="products-kpi-card__label">{label}</span>
        {Icon ? <Icon className="products-kpi-card__icon" /> : null}
      </div>
      <span className="products-kpi-card__value">{value}</span>
    </div>
  )
}

export default function ProductsPage() {
  const toast = useToast()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const canCreateProducts = hasModulePermission(currentUser, 'Products', 'create')
  const canEditProducts = hasModulePermission(currentUser, 'Products', 'edit')
  const canDeleteProducts = hasModulePermission(currentUser, 'Products', 'delete')
  const canExportProducts = hasModulePermission(currentUser, 'Products', 'export')
  const categories = useMemo(() => getCategoriesWithProductCounts(), [])
  const categoriesById = useMemo(
    () => Object.fromEntries(categories.map((category) => [category.id, category])),
    [categories],
  )

  const {
    products,
    filters,
    setFilters,
    createProduct,
    saveProduct,
    deleteProduct,
    toggleProductStatus,
    duplicateProduct,
  } = useProducts({ categoriesById })

  const [formState, setFormState] = useState(null)
  const [confirmState, setConfirmState] = useState(null)
  const [confirmBulkState, setConfirmBulkState] = useState(null)

  const kpis = useMemo(() => getKpis(products), [products])
  const totalQuantity = kpis.totalQuantity.toLocaleString('en-IN')

  const clearFilters = () =>
    setFilters({ search: '', firmId: 'all', categoryId: 'all', status: 'all', stockStatus: 'all', fromDate: '', toDate: '' })

  const handleDuplicate = (productId) => {
    if (!canCreateProducts) return
    const product = duplicateProduct(productId)
    toast.success(product ? `Product duplicated as ${product.code}` : 'Duplicate failed')
  }

  const handleDelete = (productId) => {
    if (!canDeleteProducts) return
    deleteProduct(productId)
    toast.success('Product deleted')
  }

  const handleToggleStatus = (productId) => {
    if (!canEditProducts) return
    const updated = toggleProductStatus(productId)
    if (updated) toast.success('Product status updated')
  }

  const handleBulkActivate = (selected) => setConfirmBulkState({ type: 'activate', rows: selected })
  const handleBulkDeactivate = (selected) => setConfirmBulkState({ type: 'deactivate', rows: selected })

  const confirmBulkAction = () => {
    if (!canEditProducts || !confirmBulkState) return
    for (const product of confirmBulkState.rows) {
      if ((confirmBulkState.type === 'activate' && product.status !== 'active') ||
          (confirmBulkState.type === 'deactivate' && product.status !== 'inactive')) {
        toggleProductStatus(product.id)
      }
    }
    toast.success(`${confirmBulkState.rows.length} product(s) updated`)
    setConfirmBulkState(null)
  }

  const exportCsv = () => {
    const rows = products.map((product) => ({
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
    }))
    downloadCsv({
      filename: 'vinayak-products.csv',
      columns: PRODUCT_CSV_COLUMNS,
      rows,
    })
  }

  return (
    <div className="products-page">
      <header className="products-header">
        <div className="products-header__top">
          <div className="products-header__text">
            <p className="products-header__eyebrow"><span aria-hidden="true">#</span> Products</p>
            <h1 className="products-header__title">Products</h1>
            <p className="products-header__description">
              Manage products, pricing and inventory information.
            </p>
          </div>
          <div className="products-header__actions">
            <Button variant="secondary" onClick={exportCsv} disabled={!canExportProducts}>Export CSV</Button>
            {canCreateProducts && <Button size="sm" onClick={() => setFormState({ mode: 'add' })}>Add Product</Button>}
          </div>
        </div>

        <div className="products-kpi-grid">
          <KpiCard label="Total Products" value={kpis.total} icon={ShieldCheck} />
          <KpiCard label="Active Products" value={kpis.active} icon={CheckCircle2} />
          <KpiCard label="Inactive Products" value={kpis.inactive} icon={CircleAlert} />
          <KpiCard label="Low Stock Products" value={kpis.lowStock} icon={ShieldCheck} />
          <KpiCard label="Total Stock Quantity" value={totalQuantity} icon={ShieldCheck} />
        </div>
      </header>

      <ProductTable
        products={products}
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={clearFilters}
        categories={categories}
        onRowView={(id) => navigate(`/products/${id}`)}
        onRowEdit={(id) => setFormState({ mode: 'edit', id })}
        onRowDuplicate={handleDuplicate}
        onRowActivate={(id) => handleToggleStatus(id)}
        onRowDeactivate={(id) => handleToggleStatus(id)}
        onRowDelete={(id) => setConfirmState({ type: 'delete', product: products.find((p) => p.id === id) })}
        onBulkActivate={canEditProducts ? handleBulkActivate : () => {}}
        onBulkDeactivate={canEditProducts ? handleBulkDeactivate : () => {}}
        downloadProducts={exportCsv}
        canCreate={canCreateProducts}
        canEdit={canEditProducts}
        canDelete={canDeleteProducts}
        canExport={canExportProducts}
      />

      {formState && (
        <ProductForm
          mode={formState.mode}
          product={formState.id ? products.find((p) => p.id === formState.id) : null}
          categories={categories}
          onClose={() => setFormState(null)}
          onSubmit={(product) => {
            if (formState.mode === 'add') {
              createProduct(product)
            } else if (product.id) {
              saveProduct(product.id, product)
            }
            setFormState(null)
          }}
        />
      )}

      <ConfirmDialog
        open={confirmState?.type === 'delete'}
        onClose={() => setConfirmState(null)}
        onConfirm={() => {
          if (confirmState?.product) handleDelete(confirmState.product.id)
          setConfirmState(null)
        }}
        title="Delete product?"
        description={`${confirmState?.product?.name ?? ''} will be permanently removed from the product list.`}
        confirmLabel="Delete Product"
        cancelLabel="Cancel"
        tone="danger"
      />

      <ConfirmDialog
        open={Boolean(confirmBulkState)}
        onClose={() => setConfirmBulkState(null)}
        onConfirm={confirmBulkAction}
        title={`${confirmBulkState?.type === 'activate' ? 'Activate' : 'Deactivate'} selected products?`}
        description={`This will change the status of ${confirmBulkState?.rows?.length ?? 0} selected product(s).`}
        confirmLabel={`${confirmBulkState?.type === 'activate' ? 'Activate' : 'Deactivate'} Selected`}
        cancelLabel="Cancel"
        tone={confirmBulkState?.type === 'deactivate' ? 'danger' : 'success'}
      />
    </div>
  )
}
