import { Edit3, Eye, Trash2 } from 'lucide-react'
import { RecordedTable } from '../../../components/recorded'
import { getFirmLabel } from '../../users/utils/userUtils'
import { formatPrice, getStockStatus, productImageUrl } from '../utils/productUtils'

function ProductImageCell({ product }) {
  return (
    <img
      className="recorded-product__image"
      src={product.image || productImageUrl(product.name)}
      alt={product.image ? `${product.name} image` : 'No product photo'}
      title={product.image ? `${product.name} image` : 'No product photo'}
    />
  )
}

export default function ProductTable({
  products,
  filters,
  onFiltersChange,
  categories,
  onRowView,
  onRowEdit,
  onRowDelete,
  canEdit = true,
  canDelete = true,
}) {
  const categoriesById = Object.fromEntries(categories.map((category) => [category.id, category]))

  const columns = [
    {
      key: 'number',
      label: 'No.',
      width: '38px',
      align: 'center',
      render: (_product, index) => index + 1,
    },
    {
      key: 'image',
      label: 'Image',
      width: '54px',
      align: 'center',
      render: (product) => <ProductImageCell product={product} />,
    },
    {
      key: 'firm',
      label: 'Firm(Admin)',
      minWidth: '92px',
      render: (product) => <span className="recorded-product__firm">{getFirmLabel(product.firmId)}</span>,
    },
    {
      key: 'name',
      label: 'Name',
      minWidth: '150px',
      render: (product) => <span className="recorded-product__name">{product.name}</span>,
    },
    { key: 'code', label: 'Code', width: '70px' },
    {
      key: 'category',
      label: 'Categories',
      width: '90px',
      render: (product) => categoriesById[product.categoryId]?.name ?? '—',
    },
    {
      key: 'quantity',
      label: 'Quantity',
      width: '76px',
      align: 'center',
      render: (product) => (
        <span className="recorded-product__quantity">
          <b>{product.quantity ?? 0}</b><small>{product.unit ?? 'nos'}</small>
        </span>
      ),
    },
    {
      key: 'buyingPrice',
      label: 'Buying Price',
      width: '90px',
      align: 'right',
      render: (product) => formatPrice(product.buyingPrice),
    },
    {
      key: 'sellingPrice',
      label: 'Selling Price',
      width: '90px',
      align: 'right',
      render: (product) => formatPrice(product.sellingPrice),
    },
    {
      key: 'stock',
      label: 'Stock In/Out',
      width: '82px',
      align: 'center',
      render: (product) => {
        const status = getStockStatus(product)
        return <span className={`recorded-stock recorded-stock--${status}`}>{status === 'out-of-stock' ? 'Out Stock' : 'In Stock'}</span>
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '104px',
      align: 'center',
      render: (product) => {
        const canEditRow = typeof canEdit === 'function' ? canEdit(product) : canEdit
        const canDeleteRow = typeof canDelete === 'function' ? canDelete(product) : canDelete

        return (
          <span className="recorded-row-actions">
            <button type="button" className="recorded-row-actions__button" onClick={() => onRowView(product.id)} aria-label={`View ${product.name}`} title="View Product">
              <Eye size={13} />
            </button>
            <button type="button" className="recorded-row-actions__button recorded-row-actions__button--edit" onClick={() => onRowEdit(product.id)} disabled={!canEditRow} aria-label={`Edit ${product.name}`} title="Edit Product">
              <Edit3 size={13} />
            </button>
            <button type="button" className="recorded-row-actions__button recorded-row-actions__button--danger" onClick={() => onRowDelete?.(product.id)} disabled={!canDeleteRow} aria-label={`Delete ${product.name}`} title="Delete Product">
              <Trash2 size={13} />
            </button>
          </span>
        )
      },
    },
  ]

  return (
    <RecordedTable
      rows={products}
      columns={columns}
      getRowId={(product) => product.id}
      initialPageSize={5}
      pageSizeOptions={[5, 10, 15, 25]}
      paginationWindow={10}
      showFirstLast={false}
      search={filters.search}
      onSearchChange={(search) => onFiltersChange((current) => ({ ...current, search }))}
      getSearchText={(product) => [
        product.name,
        product.code,
        product.description,
        product.unit,
        categoriesById[product.categoryId]?.name,
        categoriesById[product.categoryId]?.code,
        getFirmLabel(product.firmId),
      ]}
      searchPlaceholder="Name, code, category or keyword"
      searchLabel="Search products by name, code, category or keyword"
      filters={(
        <label>
          <span>Category:</span>
          <select
            value={filters.categoryId}
            onChange={(event) => onFiltersChange((current) => ({ ...current, categoryId: event.target.value }))}
            aria-label="Filter products by category"
          >
            <option value="all">—All Categories—</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </label>
      )}
      emptyMessage="No products found."
      ariaLabel="Products"
      minWidth={840}
    />
  )
}
