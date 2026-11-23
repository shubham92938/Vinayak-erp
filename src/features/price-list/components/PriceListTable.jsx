import { useMemo } from 'react'
import { Eye } from 'lucide-react'
import { Button, Select } from '../../../components/ui'
import { DataTable } from '../../../components/data-table'
import { FirmFilter } from '../../../components/filters'
import { formatPrice } from '../../products/utils/productUtils'
import { getCategoriesWithProductCounts } from '../../categories/services/categoryService'

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All categories' },
  ...getCategoriesWithProductCounts().map((category) => ({
    value: category.id,
    label: `${category.name} · ${category.code}`,
  })),
]

export default function PriceListTable({ rows, filters, onFiltersChange, onRowView }) {
  const columns = useMemo(
    () => [
      {
        id: 'name',
        header: 'Product Name',
        accessor: 'name',
        minWidth: '220px',
        cell: (row) => (
          <span className="price-list-name">
            <span className="price-list-name__name">{row.name}</span>
            <span className="price-list-name__code">{row.code}</span>
          </span>
        ),
      },
      {
        id: 'category',
        header: 'Category',
        accessor: 'category',
        width: '150px',
      },
      {
        id: 'firm',
        header: 'Firm',
        accessor: 'firm',
        width: '160px',
      },
      {
        id: 'buyingPrice',
        header: 'Buying Price',
        accessor: 'buyingPrice',
        width: '130px',
        align: 'right',
        cell: (row) => <span className="price-list-money">{formatPrice(row.buyingPrice)}</span>,
      },
      {
        id: 'sellingPrice',
        header: 'Selling Price',
        accessor: 'sellingPrice',
        width: '140px',
        align: 'right',
        cell: (row) => <span className="price-list-money">{formatPrice(row.sellingPrice)}</span>,
      },
      {
        id: 'mrp',
        header: 'MRP',
        accessor: (row) => row.mrp ?? '—',
        width: '120px',
        align: 'right',
        cell: (row) => <span className="price-list-money">{formatPrice(row.mrp)}</span>,
      },
      {
        id: 'lastUpdated',
        header: 'Last Updated',
        accessor: 'lastUpdated',
        width: '120px',
        cell: (row) => <span className="price-list-date">{new Date(row.lastUpdated).toLocaleDateString('en-IN')}</span>,
      },
      {
        id: 'actions',
        header: 'Actions',
        width: '64px',
        sortable: false,
        cell: (row) => (
          <Button
            variant="ghost"
            size="sm"
            leadingIcon={<Eye size={14} />}
            onClick={() => onRowView(row.productId)}
          >
            View
          </Button>
        ),
      },
    ],
    [onRowView],
  )

  return (
    <div className="price-list-table">
      <DataTable
        data={rows}
        columns={columns}
        getRowId={(row) => row.id}
        search={filters.search}
        onSearchChange={(search) => onFiltersChange((current) => ({ ...current, search }))}
        searchPlaceholder="Search products by name or code..."
        searchLabel="Search products"
        minWidth={980}
        selectable={false}
        filtersActive={Boolean(filters.search || filters.firmId !== 'all' || filters.categoryId !== 'all')}
        filter={(row) =>
          (filters.firmId === 'all' || row.firmId === filters.firmId) &&
          (filters.categoryId === 'all' || row.categoryId === filters.categoryId)
        }
        filterKey={`${filters.firmId}-${filters.categoryId}`}
        initialSort={{ columnId: 'sellingPrice', direction: 'desc' }}
        filters={
          <div className="price-list-filters">
            <FirmFilter value={filters.firmId} onChange={(firmId) => onFiltersChange({ firmId })} />
            <Select
              label="Category"
              options={CATEGORY_OPTIONS}
              value={filters.categoryId}
              onChange={(event) => onFiltersChange({ categoryId: event.target.value })}
              aria-label="Filter by category"
            />
          </div>
        }
      />
    </div>
  )
}
