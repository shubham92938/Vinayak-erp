import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ArrowLeft, Edit, Power } from 'lucide-react'
import { Badge, Button, Card, CardBody, Modal, useToast } from '../../../components/ui'
import { getCategoriesWithProductCounts } from '../../categories/services/categoryService'
import { getFirmLabel } from '../../users/utils/userUtils'
import { formatPrice, formatDate } from '../utils/productUtils'
import ProductForm from '../components/ProductForm'
import ProductDetailsCard from '../components/ProductDetailsCard'
import { PRICE_HISTORY_DEMO_DATA } from '../data/priceHistoryDemoData'
import { STOCK_HISTORY_DEMO_DATA } from '../data/stockHistoryDemoData'
import { useProducts } from '../hooks/useProducts'
import '../styles/products.css'

const TABS = ['Overview', 'Stock History', 'Price History']

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
  const toast = useToast()
  const { getProductById, saveProduct, toggleProductStatus } = useProducts()
  const categories = useMemo(() => getCategoriesWithProductCounts(), [])
  const categoriesById = useMemo(
    () => Object.fromEntries(categories.map((category) => [category.id, category])),
    [categories],
  )

  const product = getProductById(productId)
  const stockHistory = STOCK_HISTORY_DEMO_DATA.filter((entry) => entry.productId === productId)
  const priceHistory = PRICE_HISTORY_DEMO_DATA.filter((entry) => entry.productId === productId)

  const [tab, setTab] = useState('Overview')
  const [isEditing, setIsEditing] = useState(false)

  const handleSaveProduct = (productData) => {
    if (product?.id) {
      saveProduct(product.id, productData)
      toast.success('Product updated')
    }
    setIsEditing(false)
  }

  const handleToggleStatus = () => {
    toggleProductStatus(product.id)
    toast.success('Product status updated')
  }

  if (!product) {
    return (
      <div className="products-page">
        <div className="products-details-empty">
          <Button variant="secondary" size="sm" leadingIcon={<ArrowLeft size={14} />} onClick={() => window.history.back()}>
            Back to Products
          </Button>
          <h2>Product not found</h2>
          <p>We could not find the product you requested.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="products-page">
      <header className="products-header">
        <div className="products-header__top">
          <div className="products-header__text">
            <p className="products-header__eyebrow"><span aria-hidden="true">#</span> Product Details</p>
            <h1 className="products-header__title">{product.name}</h1>
            <p className="products-header__description">
              {product.code} · {categoriesById[product.categoryId]?.name ?? '—'} · {getFirmLabel(product.firmId)}
            </p>
          </div>
          <div className="products-header__actions">
            <Button variant="secondary" onClick={() => window.history.back()} leadingIcon={<ArrowLeft size={14} />}>
              Back to Products
            </Button>
            <Button variant="secondary" onClick={handleToggleStatus} leadingIcon={<Power size={14} />}>
              {product.status === 'active' ? 'Deactivate' : 'Activate'}
            </Button>
            <Button onClick={() => setIsEditing(true)} leadingIcon={<Edit size={14} />}>
              Edit Product
            </Button>
          </div>
        </div>

        <div className="products-details-tabs">
          {TABS.map((tabName) => (
            <button
              key={tabName}
              type="button"
              className={['products-details-tab', tab === tabName && 'products-details-tab--active'].filter(Boolean).join(' ')}
              onClick={() => setTab(tabName)}
            >
              {tabName}
            </button>
          ))}
        </div>
      </header>

      <ProductDetailsCard
        product={product}
        categoryName={categoriesById[product.categoryId]?.name ?? '—'}
        firmName={getFirmLabel(product.firmId)}
      />

      {tab === 'Stock History' && (
        <Card className="products-details-card">
          <CardBody>
            <h3 className="products-details-card__title">Demo Stock History</h3>
            <p className="products-details-card__subtitle">Sample records for the frontend preview.</p>
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
                      <Badge variant="success" size="sm">DEMO</Badge>
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
            <h3 className="products-details-card__title">Demo Price History</h3>
            <p className="products-details-card__subtitle">Sample records for the frontend preview.</p>
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
                    <Badge variant="success" size="sm">DEMO</Badge>
                    {entry.note && <p className="products-price-history__note">{entry.note}</p>}
                  </div>
                ))
              )}
            </div>
          </CardBody>
        </Card>
      )}

      <Modal
        open={isEditing}
        onClose={() => setIsEditing(false)}
        title={`Edit ${product.name}`}
        description="Update product details and pricing."
      >
        <ProductForm
          mode="edit"
          product={product}
          categories={categories}
          onClose={() => setIsEditing(false)}
          onSubmit={handleSaveProduct}
        />
      </Modal>
    </div>
  )
}
