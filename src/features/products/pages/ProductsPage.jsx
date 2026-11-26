import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  Boxes,
  CircleDollarSign,
  Edit3,
  Eye,
  FileDown,
  FileSpreadsheet,
  Grid2X2,
  List,
  MoreVertical,
  Package,
  Plus,
  RefreshCw,
  Search,
  XCircle,
} from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button, ConfirmDialog, Input, useToast } from '../../../components/ui'
import { useAuth, useFirmContext } from '../../../context/hooks'
import { hasModulePermission } from '../../../core/accessControl'
import { downloadCsv } from '../../../utils/csv'
import { getCategoriesWithProductCounts } from '../../categories/services/categoryService'
import { getFirmLabel } from '../../users/utils/userUtils'
import ProductImage from '../components/ProductImage'
import ProductStatusBadge from '../components/ProductStatusBadge'
import ProductForm from '../components/ProductForm'
import ProductTable from '../components/ProductTable'
import { useProducts } from '../hooks/useProducts'
import { formatPrice, getKpis, getStockStatus, getStockStatusLabel, PRODUCT_CSV_COLUMNS } from '../utils/productUtils'
import '../styles/products.css'

function ProductCard({ product, category, onView, onEdit, onDelete, canEdit, canDelete }) {
  const stockStatus = getStockStatus(product)
  const stockLabel = getStockStatusLabel(stockStatus)
  const statusTone = stockStatus === 'out-of-stock' ? 'danger' : stockStatus === 'low-stock' ? 'warning' : 'success'

  return (
    <article className="product-card">
      <div className="product-card__visual">
        <ProductImage product={product} size={150} alt={`${product.name} product image`} />
        <ProductStatusBadge product={product} />
      </div>
      <div className="product-card__body">
        <div className="product-card__heading">
          <div>
            <h3>{product.name}</h3>
            <p>{product.code || 'No product code'} <span aria-hidden="true">•</span> {category?.name || 'Uncategorised'}</p>
          </div>
          <button type="button" className="product-card__more" aria-label={`More actions for ${product.name}`} title="More actions">
            <MoreVertical size={17} aria-hidden="true" />
          </button>
        </div>

        <div className="product-card__prices">
          <span><strong>{formatPrice(product.sellingPrice)}</strong><small>Selling Price</small></span>
          <span><strong>{formatPrice(product.buyingPrice)}</strong><small>Buying Price</small></span>
        </div>

        <div className="product-card__meta">
          <span><Boxes size={14} aria-hidden="true" /> {product.quantity ?? 0} {product.unit || 'units'}</span>
          <span className={`product-card__stock product-card__stock--${statusTone}`}>
            {statusTone === 'danger' ? <XCircle size={13} aria-hidden="true" /> : statusTone === 'warning' ? <AlertTriangle size={13} aria-hidden="true" /> : <span aria-hidden="true">✓</span>}
            {stockLabel}
          </span>
        </div>

        <div className="product-card__actions">
          <Button size="sm" variant="secondary" leadingIcon={<Eye size={14} />} onClick={() => onView(product.id)}>View Details</Button>
          <button type="button" className="product-card__action product-card__action--edit" onClick={() => onEdit(product.id)} disabled={!canEdit} aria-label={`Edit ${product.name}`} title="Edit product"><Edit3 size={15} /></button>
          <button type="button" className="product-card__action product-card__action--delete" onClick={() => onDelete(product.id)} disabled={!canDelete} aria-label={`Delete ${product.name}`} title="Delete product"><MoreVertical size={15} /></button>
        </div>
      </div>
    </article>
  )
}

function ProductCardFilters({ filters, onFiltersChange, categories, viewMode, onViewModeChange }) {
  const updateFilter = (key, value) => onFiltersChange((current) => ({ ...current, [key]: value }))

  return (
    <div className="products-card-toolbar">
      <Input
        type="search"
        value={filters.search}
        onChange={(event) => updateFilter('search', event.target.value)}
        placeholder="Search products by name or code..."
        aria-label="Search products by name or code"
        leadingIcon={<Search size={16} />}
        containerClassName="products-card-toolbar__search"
      />
      <select value={filters.categoryId} onChange={(event) => updateFilter('categoryId', event.target.value)} aria-label="Filter by category">
        <option value="all">All Categories</option>
        {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
      </select>
      <select value={filters.stockStatus} onChange={(event) => updateFilter('stockStatus', event.target.value)} aria-label="Filter by stock status">
        <option value="all">All Stock Status</option>
        <option value="in-stock">In Stock</option>
        <option value="low-stock">Low Stock</option>
        <option value="out-of-stock">Out of Stock</option>
      </select>
      <select value={filters.status} onChange={(event) => updateFilter('status', event.target.value)} aria-label="Filter by product status">
        <option value="all">Active & Inactive</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
      <div className="products-view-toggle" aria-label="Product view">
        <button type="button" className={viewMode === 'cards' ? 'is-active' : ''} onClick={() => onViewModeChange('cards')} aria-label="Card view"><Grid2X2 size={16} /></button>
        <button type="button" className={viewMode === 'table' ? 'is-active' : ''} onClick={() => onViewModeChange('table')} aria-label="Table view"><List size={16} /></button>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser } = useAuth()
  const { currentFirmId } = useFirmContext()
  const routePrefix = location.pathname.startsWith('/firms/') && currentFirmId
    ? `/firms/${currentFirmId}/workspace`
    : ''
  const canCreateProducts = hasModulePermission(currentUser, 'Products', 'create')
  const canExportProducts = hasModulePermission(currentUser, 'Products', 'export')
  const categories = useMemo(() => getCategoriesWithProductCounts(), [])
  const categoriesById = useMemo(() => Object.fromEntries(categories.map((category) => [category.id, category])), [categories])
  const {
    products,
    filters,
    setFilters,
    createProduct,
    saveProduct,
    canEditProduct,
    deleteProduct,
    refresh,
  } = useProducts({ categoriesById })
  const [formState, setFormState] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [viewMode, setViewMode] = useState('cards')

  const kpis = useMemo(() => {
    const summary = getKpis(products)
    const inStock = products.filter((product) => getStockStatus(product) === 'in-stock').length
    const outOfStock = products.filter((product) => getStockStatus(product) === 'out-of-stock').length
    const stockValue = products.reduce((sum, product) => sum + Number(product.sellingPrice ?? 0) * Number(product.quantity ?? 0), 0)
    return { ...summary, inStock, outOfStock, stockValue }
  }, [products])

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

  const handleDelete = () => {
    if (!deleteTarget || !canEditProduct(deleteTarget.id, 'delete')) return
    const deleted = deleteProduct(deleteTarget.id)
    if (!deleted) {
      toast.error('The product could not be deleted')
      return
    }
    toast.success('Product deleted')
    setDeleteTarget(null)
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
      <header className="products-reference-header">
        <div className="products-reference-header__title">
          <span className="products-reference-header__icon"><Package size={25} aria-hidden="true" /></span>
          <div>
            <h1>Products</h1>
            <p>Manage your business product catalogue and stock.</p>
          </div>
        </div>
        <div className="products-reference-header__actions">
          <button type="button" className="products-icon-button" onClick={exportCsv} disabled={!canExportProducts} title="Export CSV" aria-label="Export CSV"><FileDown size={16} /></button>
          <button type="button" className="products-icon-button" onClick={exportCsv} disabled={!canExportProducts} title="Export spreadsheet" aria-label="Export spreadsheet"><FileSpreadsheet size={16} /></button>
          <button type="button" className="products-icon-button" onClick={refresh} title="Refresh products" aria-label="Refresh products"><RefreshCw size={16} /></button>
          {canCreateProducts && <Button leadingIcon={<Plus size={16} />} onClick={() => navigate(`${routePrefix}/products/create`)}>Add Product</Button>}
        </div>
      </header>

      <section className="products-kpi-grid" aria-label="Product summary">
        <article className="products-kpi-card products-kpi-card--mint"><span><Package size={17} /></span><small>Total Products</small><strong>{kpis.total}</strong><em>{kpis.active} active</em></article>
        <article className="products-kpi-card products-kpi-card--blue"><span><Boxes size={17} /></span><small>In Stock</small><strong>{kpis.inStock}</strong><em>{kpis.total ? `${Math.round((kpis.inStock / kpis.total) * 100)}% of total` : 'No data yet'}</em></article>
        <article className="products-kpi-card products-kpi-card--peach"><span><AlertTriangle size={17} /></span><small>Low Stock</small><strong>{kpis.lowStock}</strong><em>At minimum level</em></article>
        <article className="products-kpi-card products-kpi-card--rose"><span><XCircle size={17} /></span><small>Out of Stock</small><strong>{kpis.outOfStock}</strong><em>{kpis.total ? `${Math.round((kpis.outOfStock / kpis.total) * 100)}% of total` : 'No data yet'}</em></article>
        <article className="products-kpi-card products-kpi-card--lavender"><span><CircleDollarSign size={17} /></span><small>Stock Valuation</small><strong>{formatPrice(kpis.stockValue)}</strong><em>Based on selling price</em></article>
      </section>

      {viewMode === 'cards' ? (
        <>
          <ProductCardFilters filters={filters} onFiltersChange={setFilters} categories={categories} viewMode={viewMode} onViewModeChange={setViewMode} />
          {products.length > 0 ? (
            <div className="product-card-grid">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  category={categoriesById[product.categoryId]}
                  onView={(id) => navigate(`${routePrefix}/products/${id}`)}
                  onEdit={(id) => setFormState({ mode: 'edit', id })}
                  onDelete={(id) => setDeleteTarget(products.find((entry) => entry.id === id) ?? null)}
                  canEdit={canEditProduct(product.id, 'edit')}
                  canDelete={canEditProduct(product.id, 'delete')}
                />
              ))}
            </div>
          ) : (
            <section className="products-empty-reference" aria-live="polite">
              <span><Package size={26} aria-hidden="true" /></span>
              <h2>{filters.search || filters.categoryId !== 'all' || filters.stockStatus !== 'all' ? 'No products match these filters' : 'No products yet'}</h2>
              <p>{filters.search || filters.categoryId !== 'all' || filters.stockStatus !== 'all' ? 'Try clearing a filter or searching for another product.' : 'Add a product to start building the catalogue for this firm.'}</p>
              {canCreateProducts && !filters.search && filters.categoryId === 'all' && <Button size="sm" leadingIcon={<Plus size={15} />} onClick={() => navigate(`${routePrefix}/products/create`)}>Add your first product</Button>}
            </section>
          )}
        </>
      ) : (
        <ProductTable
          products={products}
          filters={filters}
          onFiltersChange={setFilters}
          categories={categories}
          onRowView={(id) => navigate(`${routePrefix}/products/${id}`)}
          onRowEdit={(id) => setFormState({ mode: 'edit', id })}
          onRowDelete={(id) => setDeleteTarget(products.find((product) => product.id === id) ?? null)}
          canEdit={(product) => canEditProduct(product.id, 'edit')}
          canDelete={(product) => canEditProduct(product.id, 'delete')}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete product?"
        description={`${deleteTarget?.name ?? 'This product'} will be removed from the product list. This action cannot be undone.`}
        confirmLabel="Delete Product"
        cancelLabel="Cancel"
        tone="danger"
      />
    </div>
  )
}
