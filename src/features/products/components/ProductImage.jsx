import { productImageUrl } from '../utils/productUtils'

export default function ProductImage({ product, size = 40, alt = '' }) {
  const src = product?.image || productImageUrl(product?.name ?? 'Product')
  return (
    <img
      src={src}
      alt={alt || `Image of ${product?.name ?? 'product'}`}
      width={size}
      height={size}
      className="product-image"
      loading="lazy"
    />
  )
}
