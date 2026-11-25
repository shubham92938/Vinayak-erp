import { Card, CardBody } from '../../../components/ui'
import { formatPrice, getStockStatus, productImageUrl } from '../utils/productUtils'

const STOCK_LABELS = {
  'in-stock': 'In Stock',
  'low-stock': 'Low Stock',
  'out-of-stock': 'Out of Stock',
  untracked: 'Untracked',
}

function productSlug(name) {
  return String(name ?? '')
    .trim()
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function displayUnit(unit) {
  const value = String(unit ?? '').trim()
  if (!value) return '—'
  return `${value.charAt(0).toLocaleUpperCase()}${value.slice(1)} (${value})`
}

function displayTax(product) {
  const tax = [product?.taxSGST, product?.taxCGST, product?.taxIGST]
    .map((value) => Number(value ?? 0))
    .reduce((total, value) => total + (Number.isFinite(value) ? value : 0), 0)
  return `${tax} %`
}

function Barcode({ value }) {
  return (
    <span className="recorded-product-barcode" aria-label={`Barcode ${value}`}>
      <span aria-hidden="true" />
    </span>
  )
}

export default function ProductDetailsCard({
  product,
  categoryName = '—',
  firmName = '—',
}) {
  if (!product) return null

  const stockStatus = getStockStatus(product)
  const image = product.image || productImageUrl(product.name)
  const rows = [
    { label: 'Name', value: product.name },
    { label: 'Firm', value: firmName },
    { label: 'Slug', value: productSlug(product.name) },
    { label: 'Code', value: product.code || '—' },
    { label: 'Barcode', value: <Barcode value={product.code || product.id} /> },
    { label: 'Categories', value: categoryName },
    { label: 'Unit', value: displayUnit(product.unit) },
    { label: 'Quantity', value: product.quantity ?? 0 },
    {
      label: 'Stock In/out',
      value: (
        <span className={`recorded-detail-stock recorded-detail-stock--${stockStatus}`}>
          {STOCK_LABELS[stockStatus]}
        </span>
      ),
    },
    { label: 'Tax', value: displayTax(product) },
    { label: 'Dealer Price', value: formatPrice(product.buyingPrice) },
    { label: 'Customer Price', value: formatPrice(product.sellingPrice) },
    { label: 'Notes', value: product.description || '' },
  ]

  return (
    <div className="recorded-product-details">
      <Card className="recorded-product-details__image-card">
        <CardBody>
          <h2 className="recorded-product-details__card-title">Product Image</h2>
          <div className="recorded-product-details__image-frame">
            <img src={image} alt={product.image ? `Image of ${product.name}` : 'No product photo'} />
          </div>
        </CardBody>
      </Card>

      <Card className="recorded-product-details__table-card">
        <CardBody flush>
          <h2 className="recorded-product-details__card-title">Product Details</h2>
          <table className="recorded-product-details__table">
            <tbody>
              {rows.map((row) => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  <td>{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  )
}
