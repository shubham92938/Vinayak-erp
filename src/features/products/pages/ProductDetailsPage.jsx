import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Edit, Power } from 'lucide-react'
import { Badge, Button, Card, CardBody, useToast } from '../../../components/ui'
import { useAuth } from '../../../context/hooks'
import { hasModulePermission } from '../../../core/accessControl'
import { getCategoriesWithProductCounts } from '../../categories/services/categoryService'
import { getFirmLabel } from '../../users/utils/userUtils'
import { formatDate, formatPrice } from '../utils/productUtils'
import ProductForm from '../components/ProductForm'
import ProductDetailsCard from '../components/ProductDetailsCard'
import { PRICE_HISTORY_DEMO_DATA } from '../data/priceHistoryDemoData'
import { STOCK_HISTORY_DEMO_DATA } from '../data/stockHistoryDemoData'
import { useProducts } from '../hooks/useProducts'
import '../styles/products.css'

const TABS = ['Stock History', 'Price History']

const STOCK_TYPE_VARIANTS = {
  IN: 'success',
  OUT: 'danger',
  ADJUST: 'warning',
}

const STOCK_TYPE_LABELS = {
  IN: 'Stock In',
  OUT: 'Stock Out',
  ADJUST: 'Adjustment',
}

const PRICE_TYPE_VARIANTS = {
  NEW_PRICE: 'info',
  OLD_PRICE: 'neutral',
}

export default function ProductDetailsPage() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { currentUser } = useAuth()
  const canEditProduct = hasModulePermission(currentUser, 'Products', 'edit')
  const { getProductById, saveProduct, toggleProductStatus } = useProducts()
  const categories = useMemo(() => getCategoriesWithProductCounts(), [])
  const categoriesById = useMemo(
    () => Object.fromEntries(categories.map((category) => [category.id, category])),
    [categories],
  )

  const product = getProductById(productId)
  const stockHistory = STOCK_HISTORY_DEMO_DATA.filter((entry) => entry.productId === productId)
  const priceHistory = PRICE_HISTORY_DEMO_DATA.filter((entry) => entry.productId === productId)
  const hasHistory = stockHistory.length > 0 || priceHistory.length > 0

  const [tab, setTab] = useState(TABS[0])
  const [isEditing, setIsEditing] = useState(false)

  const handleSaveProduct = (productData) => {
    if (product?.id && canEditProduct) {
      const updated = saveProduct(product.id, productData)
      if (updated) {
        toast.success('Product updated')
        setIsEditing(false)
      }
      return updated
    }
    return null
  }

  const handleToggleStatus = () => {
    if (!canEditProduct || !product) return
    const updated = toggleProductStatus(product.id)
    if (updated) toast.success('Product status updated')
  }

  if (!product) {
    return (
      <div className="products-page">
        <div className="products-details-empty">
          <Button variant="secondary" size="sm" leadingIcon={<ArrowLeft size={14} />} onClick={() => navigate('/products')}>
            Back to Products
          </Button>
          <h2>Product not found</h2>
          <p>We could not find the product you requested.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="products-page recorded-product-details-page">
      <header className="recorded-product-details__intro">
        <div>
          <h1>{product.name}</h1>
          <p>
            <button type="button" onClick={() => navigate('/products')}>Products</button>
            <span aria-hidden="true">›</span>
            <span>{product.id}</span>
          </p>
        </div>
        {canEditProduct && (
          <div className="recorded-product-details__actions">
            <Button variant="secondary" size="sm" onClick={handleToggleStatus} leadingIcon={<Power size={13} />}>
              {product.status === 'active' ? 'Deactivate' : 'Activate'}
            </Button>
            <Button size="sm" onClick={() => setIsEditing(true)} leadingIcon={<Edit size={13} />}>
              Edit Product
            </Button>
          </div>
        )}
      </header>

      <ProductDetailsCard
        product={product}
        categoryName={categoriesById[product.categoryId]?.name ?? '—'}
        firmName={getFirmLabel(product.firmId)}
      />

      {hasHistory && (
        <>
          <div className="products-details-tabs" role="tablist" aria-label="Product history">
            {TABS.map((tabName) => (
              <button
                key={tabName}
                type="button"
                role="tab"
                aria-selected={tab === tabName}
                className={['products-details-tab', tab === tabName && 'products-details-tab--active'].filter(Boolean).join(' ')}
                onClick={() => setTab(tabName)}
              >
                {tabName}
              </button>
            ))}
          </div>

          {tab === 'Stock History' && (
            <Card className="products-details-card">
              <CardBody>
                <h2 className="products-details-card__title">Stock History</h2>
                <div className="products-stock-history">
                  {stockHistory.length === 0 ? (
                    <p className="products-empty">No stock history records for this product.</p>
                  ) : (
                    stockHistory.map((entry) => (
                      <div key={entry.id} className="products-stock-history__item">
                        <div className="products-stock-history__type">
                          <Badge variant={STOCK_TYPE_VARIANTS[entry.type] ?? 'neutral'} size="sm">
                            {STOCK_TYPE_LABELS[entry.type]}
                          </Badge>
                          <span className="products-stock-history__date">{formatDate(entry.date)}</span>
                        </div>
                        <div className="products-stock-history__qty">
                          <strong>{entry.qty > 0 ? '+' : ''}{entry.qty}</strong> {product.unit}
                          {entry.demo !== false && <Badge variant="success" size="sm">DEMO</Badge>}
                        </div>
                        <p className="products-stock-history__note">
                          {entry.note}
                          {entry.refNo ? ` · Ref ${entry.refNo}` : ''}
                          {entry.reason ? ` · ${entry.reason}` : ''}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </CardBody>
            </Card>
          )}

          {tab === 'Price History' && (
            <Card className="products-details-card">
              <CardBody>
                <h2 className="products-details-card__title">Price History</h2>
                <div className="products-price-history">
                  {priceHistory.length === 0 ? (
                    <p className="products-empty">No price history records for this product.</p>
                  ) : (
                    priceHistory.map((entry) => (
                      <div key={entry.id} className="products-price-history__item">
                        <div className="products-price-history__type">
                          <Badge variant={PRICE_TYPE_VARIANTS[entry.type] ?? 'info'} size="sm">
                            {entry.type}
                          </Badge>
                          <span className="products-price-history__date">{formatDate(entry.date)}</span>
                        </div>
                        <div className="products-price-history__prices">
                          <span className="products-price-history__from">{formatPrice(entry.oldValue)}</span>
                          <span className="products-price-history__arrow" aria-hidden="true">→</span>
                          <span className="products-price-history__to">{formatPrice(entry.newValue)}</span>
                          {entry.mrp ? <span className="products-price-history__mrp">MRP {formatPrice(entry.mrp)}</span> : null}
                        </div>
                        {entry.demo !== false && <Badge variant="success" size="sm">DEMO</Badge>}
                        {entry.note && <p className="products-price-history__note">{entry.note}</p>}
                      </div>
                    ))
                  )}
                </div>
              </CardBody>
            </Card>
          )}
        </>
      )}

      <div className="recorded-product-details__footer-actions">
        <Button variant="secondary" onClick={() => navigate('/products')} leadingIcon={<ArrowLeft size={14} />}>
          Back
        </Button>
      </div>

      {isEditing && (
        <ProductForm
          mode="edit"
          product={product}
          categories={categories}
          onClose={() => setIsEditing(false)}
          onSubmit={handleSaveProduct}
        />
      )}
    </div>
  )
}
