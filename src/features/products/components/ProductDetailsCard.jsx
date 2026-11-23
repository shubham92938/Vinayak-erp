import { Card, CardBody } from '../../../components/ui'
import { formatPrice } from '../utils/productUtils'
import ProductImage from './ProductImage'
import ProductStatusBadge from './ProductStatusBadge'
import StockStatusBadge from './StockStatusBadge'

export default function ProductDetailsCard({
  product,
  categoryName = '—',
  firmName = '—',
  actions,
}) {
  if (!product) return null

  const rows = [
    { label: 'Product', value: product.name, showImage: true },
    { label: 'Code', value: product.code },
    { label: 'Category', value: categoryName },
    { label: 'Firm', value: firmName },
    { label: 'Description', value: product.description },
    { label: 'Unit', value: product.unit },
    { label: 'Buying Price', value: formatPrice(product.buyingPrice) },
    { label: 'Selling Price', value: formatPrice(product.sellingPrice) },
    { label: 'MRP', value: product.mrp ? formatPrice(product.mrp) : '—' },
    { label: 'Current Stock', value: `${product.quantity ?? 0} ${product.unit ?? ''}`.trim() },
    { label: 'Min Stock', value: `${product.minStock ?? 0} ${product.unit ?? ''}`.trim() },
    { label: 'Status', value: <ProductStatusBadge product={product} /> },
    { label: 'Stock', value: <StockStatusBadge product={product} /> },
    {
      label: 'Stock Tracking',
      value: product.stockTracking === false ? 'Disabled' : 'Enabled',
    },
  ]

  return (
    <Card className="product-details-card">
      <CardBody>
        <div className="product-details-card__head">
          <ProductImage product={product} size={48} />
          <div className="product-details-card__title">
            <h3 className="product-details-card__name">{product.name}</h3>
            <span className="product-details-card__code">{product.code}</span>
          </div>
          {actions && <div className="product-details-card__actions">{actions}</div>}
        </div>
        <div className="product-details-card__meta">
          {rows.map((row) => (
            <div key={row.label} className="product-details-card__meta-item">
              <span className="product-details-card__meta-label">{row.label}</span>
              <span className="product-details-card__meta-value">
                {row.showImage ? <ProductImage product={product} size={44} /> : row.value}
              </span>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  )
}
