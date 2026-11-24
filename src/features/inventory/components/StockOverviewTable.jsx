import { useMemo } from 'react'
import { DataTable } from '../../../components/data-table'
import { Select } from '../../../components/ui'
import { FirmFilter } from '../../../components/filters'
import { getFirmLabel } from '../../users/utils/userUtils'
import { useFirmContext } from '../../../context/hooks'
import { formatMoney } from '../../../core/store'
import { getStockTable } from '../services/inventoryService'

export default function StockOverviewTable({ filters, onFiltersChange }) {
  const { accessibleFirms } = useFirmContext()
  const products = getStockTable()
  const categories = useMemo(
    () => [...new Set(products.map((product) => product.categoryName))],
    [products],
  )

  const columns = [
    { id: 'name', header: 'Product', accessor: 'name', minWidth: '200px' },
    { id: 'code', header: 'Code', accessor: 'code', width: '100px' },
    { id: 'category', header: 'Category', accessor: 'categoryName', width: '140px' },
    { id: 'firm', header: 'Firm', accessor: 'firmId', width: '150px', cell: (row) => <span className="inventory-firm">{getFirmLabel(row.firmId)}</span> },
    { id: 'quantity', header: 'Available Quantity', accessor: 'availableQuantity', width: '130px', align: 'right' },
    { id: 'minStock', header: 'Minimum Stock', accessor: 'minStock', width: '110px', align: 'right' },
    { id: 'unit', header: 'Unit', accessor: 'unit', width: '80px' },
    { id: 'stockValue', header: 'Stock Value', accessor: 'stockValue', width: '120px', align: 'right', cell: (row) => <span className="inventory-money">{formatMoney(row.stockValue)}</span> },
    { id: 'status', header: 'Stock Status', accessor: 'stockStatus', width: '110px', cell: (row) => <span className={`inventory-status inventory-status--${row.stockStatus.toLowerCase().replace(/\s+/g, '-')}`}>{row.stockStatus}</span> },
  ]

  return (
    <DataTable
      data={products}
      columns={columns}
      getRowId={(row) => row.id}
      ariaLabel="Stock overview"
      filtersActive={Boolean(filters.product || filters.category || filters.stockStatus !== 'all' || filters.firmId !== 'all')}
      filter={(row) =>
        (filters.product ? row.name.toLowerCase().includes(String(filters.product).toLowerCase()) || row.code?.toLowerCase().includes(String(filters.product).toLowerCase()) : true) &&
        (filters.category ? row.categoryName === filters.category : true) &&
        (filters.stockStatus === 'all' || row.stockStatus === filters.stockStatus) &&
        (filters.firmId === 'all' || row.firmId === filters.firmId)
      }
      filters={
        <div className="inventory-filters">
          <Select
            label="Product"
            options={[{ value: '', label: 'All products' }, ...products.map((product) => ({ value: product.code, label: `${product.name} (${product.code})` }))]}
            value={filters.product ?? ''}
            onChange={(event) => onFiltersChange({ product: event.target.value })}
            aria-label="Filter by product"
          />
          <Select
            label="Category"
            options={[{ value: '', label: 'All categories' }, ...categories.map((category) => ({ value: category, label: category }))]}
            value={filters.category ?? ''}
            onChange={(event) => onFiltersChange({ category: event.target.value })}
            aria-label="Filter by category"
          />
          <Select
            label="Stock Status"
            options={[
              { value: 'all', label: 'All statuses' },
              { value: 'In Stock', label: 'In Stock' },
              { value: 'Low Stock', label: 'Low Stock' },
              { value: 'Out of Stock', label: 'Out of Stock' },
              { value: 'Untracked', label: 'Untracked' },
            ]}
            value={filters.stockStatus ?? 'all'}
            onChange={(event) => onFiltersChange({ stockStatus: event.target.value })}
            aria-label="Filter by stock status"
          />
          {filters.showFirmFilter && (
            <FirmFilter value={filters.firmId} onChange={(firmId) => onFiltersChange({ firmId })} firms={accessibleFirms} />
          )}
        </div>
      }
      selectable={false}
    />
  )
}
