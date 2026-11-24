import { useMemo } from 'react'
import { ActionMenu, Button, Select } from '../../../components/ui'
import { DataTable } from '../../../components/data-table'
import { FirmFilter } from '../../../components/filters'
import { DateRangeFilter } from '../../../components/filters'
import {
  PRODUCT_STATUSES,
  STOCK_STATUSES,
  formatPrice,
  getFirmLabel,
  getStockStatus,
} from '../utils/productUtils'
import ProductImage from './ProductImage'
import ProductStatusBadge from './ProductStatusBadge'

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  ...PRODUCT_STATUSES,
]

const STOCK_STATUS_OPTIONS = [
  { value: 'all', label: 'All stock' },
  ...STOCK_STATUSES.slice(1),
]

function ProductNameCell({ product }) {
  return (
    <span className="products-name">
      <span className="products-name__name">{product.name}</span>
      <span className="products-name__code">{product.code}</span>
    </span>
  )
}

function CategoryName({ product, categoriesById }) {
  return <span className="products-category">{categoriesById[product.categoryId]?.name ?? product.categoryId ?? '—'}</span>
}

function MoneyCell({ value }) {
  return <span className="products-money">{formatPrice(value)}</span>
}

export default function ProductTable({
  products,
  filters,
  onFiltersChange,
  onClearFilters,
  categories,
  onRowView,
  onRowEdit,
  onRowDuplicate,
  onRowActivate,
  onRowDeactivate,
  onRowDelete,
  onBulkActivate,
  onBulkDeactivate,
  downloadProducts,
  canCreate = true,
  canEdit = true,
  canDelete = true,
  canExport = true,
}) {
  const categoriesById = useMemo(
    () => Object.fromEntries(categories.map((category) => [category.id, category])),
    [categories],
  )
  const categoryOptions = useMemo(
    () => [
      { value: 'all', label: 'All categories' },
      ...categories.map((category) => ({
        value: category.id,
        label: `${category.name} · ${category.code}`,
      })),
    ],
    [categories],
  )

  const columns = useMemo(
    () => [
      {
        id: 'image',
        header: 'Product',
        width: '76px',
        sortable: false,
        align: 'center',
        cell: (product) => <ProductImage product={product} size={36} />,
      },
      {
        id: 'name',
        header: 'Name',
        accessor: 'name',
        minWidth: '230px',
        cell: (product) => <ProductNameCell product={product} />,
      },
      {
        id: 'category',
        header: 'Category',
        accessor: (product) => categoriesById[product.categoryId]?.name ?? '—',
        minWidth: '130px',
        cell: (product) => <CategoryName product={product} categoriesById={categoriesById} />,
      },
      {
        id: 'unit',
        header: 'Unit',
        accessor: 'unit',
        width: '100px',
      },
      {
        id: 'quantity',
        header: 'Quantity',
        accessor: 'quantity',
        width: '110px',
        align: 'right',
        cell: (product) => <span className="products-quantity">{product.quantity ?? 0}</span>,
      },
      {
        id: 'buyingPrice',
        header: 'Buying Price',
        accessor: 'buyingPrice',
        width: '120px',
        align: 'right',
        cell: (product) => <MoneyCell value={product.buyingPrice} />,
      },
      {
        id: 'sellingPrice',
        header: 'Selling Price',
        accessor: 'sellingPrice',
        width: '130px',
        align: 'right',
        cell: (product) => <MoneyCell value={product.sellingPrice} />,
      },
      {
        id: 'status',
        header: 'Status',
        accessor: 'status',
        width: '110px',
        cell: (product) => <ProductStatusBadge product={product} />,
      },
      {
        id: 'firm',
        header: 'Firm',
        accessor: (product) => getFirmLabel(product.firmId),
        width: '150px',
        cell: (product) => <span className="products-firm">{getFirmLabel(product.firmId)}</span>,
      },
      {
        id: 'actions',
        header: 'Actions',
        width: '78px',
        sortable: false,
        cell: (product) => (
          <ActionMenu
            label="Product actions"
            triggerLabel={`Actions for ${product.name}`}
            items={[
              { label: 'View product', onSelect: () => onRowView(product.id) },
              { label: 'Edit product', disabled: !canEdit, onSelect: () => onRowEdit(product.id) },
              { label: 'Duplicate product', disabled: !canCreate, onSelect: () => onRowDuplicate(product.id) },
              {
                label: product.status === 'active' ? 'Deactivate product' : 'Activate product',
                disabled: !canEdit,
                onSelect: () =>
                  product.status === 'active'
                    ? onRowDeactivate(product.id)
                    : onRowActivate(product.id),
              },
              { label: 'Delete product', danger: true, disabled: !canDelete, onSelect: () => onRowDelete(product.id) },
            ]}
          />
        ),
      },
    ],
    [
      categoriesById,
      onRowView,
      onRowEdit,
      onRowDuplicate,
      onRowActivate,
      onRowDeactivate,
      onRowDelete,
      canCreate,
      canEdit,
      canDelete,
    ],
  )

  const isFiltered =
    Boolean(filters.search) ||
    filters.firmId !== 'all' ||
    filters.categoryId !== 'all' ||
    filters.status !== 'all' ||
    filters.stockStatus !== 'all' ||
    Boolean(filters.fromDate || filters.toDate)

  return (
    <div className="products-table">
      <DataTable
        data={products}
        columns={columns}
        getRowId={(product) => product.id}
        search={filters.search}
        onSearchChange={(search) => onFiltersChange((current) => ({ ...current, search }))}
        searchPlaceholder="Search product name or code..."
        searchLabel="Search products"
        minWidth={980}
        filtersActive={isFiltered}
        onClearFilters={onClearFilters}
        filter={(product) =>
          (filters.firmId === 'all' || product.firmId === filters.firmId) &&
          (filters.categoryId === 'all' || product.categoryId === filters.categoryId) &&
          (filters.status === 'all' || product.status === filters.status) &&
          (filters.stockStatus === 'all' || getStockStatus(product) === filters.stockStatus)
        }
        filterKey={`${filters.firmId}-${filters.categoryId}-${filters.status}-${filters.stockStatus}-${filters.fromDate}-${filters.toDate}`}
        selectable
        initialPageSize={10}
        actions={<Button variant="secondary" size="sm" onClick={() => downloadProducts(products)} disabled={!canExport}>Export CSV</Button>}
        bulkActions={(selectedRows) => {
          const anyActive = selectedRows.some((product) => product.status === 'active')
          const anyInactive = selectedRows.some((product) => product.status === 'inactive')
          return (
            <>
              {anyInactive && (
                <Button variant="secondary" size="sm" onClick={() => onBulkActivate(selectedRows)} disabled={!canEdit}>Activate Selected</Button>
              )}
              {anyActive && (
                <Button variant="secondary" size="sm" onClick={() => onBulkDeactivate(selectedRows)} disabled={!canEdit}>Deactivate Selected</Button>
              )}
            </>
          )
        }}
        filters={
          <div className="products-filters">
            <FirmFilter value={filters.firmId} onChange={(firmId) => onFiltersChange({ firmId })} />
            <Select
              label="Category"
              options={categoryOptions}
              value={filters.categoryId}
              onChange={(event) => onFiltersChange({ categoryId: event.target.value })}
              aria-label="Filter by category"
            />
            <Select
              label="Status"
              options={STATUS_OPTIONS}
              value={filters.status}
              onChange={(event) => onFiltersChange({ status: event.target.value })}
              aria-label="Filter by status"
            />
            <Select
              label="Stock"
              options={STOCK_STATUS_OPTIONS}
              value={filters.stockStatus}
              onChange={(event) => onFiltersChange({ stockStatus: event.target.value })}
              aria-label="Filter by stock status"
            />
            <DateRangeFilter
              label="Last Updated"
              value={{
                preset: filters.fromDate || filters.toDate ? 'custom' : 'all',
                start: filters.fromDate,
                end: filters.toDate,
              }}
              onChange={({ start, end }) =>
                onFiltersChange({ fromDate: start ?? '', toDate: end ?? '' })
              }
            />
          </div>
        }
      />
    </div>
  )
}
