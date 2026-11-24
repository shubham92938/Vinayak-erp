import { RecordedTable } from '../../../components/recorded'
import { getCategoriesWithProductCounts } from '../../categories/services/categoryService'
import { formatPrice } from '../../products/utils/productUtils'

const categories = getCategoriesWithProductCounts()

export default function PriceListTable({ rows, filters, onFiltersChange }) {
  const columns = [
    { key: 'number', label: 'No.', width: '38px', align: 'center', render: (_row, index) => index + 1 },
    {
      key: 'image',
      label: 'Image',
      width: '50px',
      align: 'center',
      render: (row) => row.image ? <img className="recorded-product__image" src={row.image} alt="" /> : <span className="recorded-product__no-photo">◉</span>,
    },
    { key: 'firm', label: 'Firm(Admin)', minWidth: '120px' },
    { key: 'name', label: 'Name', minWidth: '170px' },
    { key: 'code', label: 'Code', width: '72px' },
    { key: 'category', label: 'Categories', width: '95px' },
    { key: 'sellingPrice', label: 'Price', width: '100px', align: 'right', render: (row) => formatPrice(row.sellingPrice) },
  ]

  return (
    <RecordedTable
      rows={rows}
      columns={columns}
      getRowId={(row) => row.id}
      initialPageSize={5}
      pageSizeOptions={[5, 10, 15, 25]}
      search={filters.search}
      onSearchChange={(search) => onFiltersChange((current) => ({ ...current, search }))}
      searchPlaceholder="Search"
      searchLabel="Search price list"
      filters={(
        <>
          <label>
            <span>Firms:</span>
            <select value={filters.firmId} onChange={(event) => onFiltersChange((current) => ({ ...current, firmId: event.target.value }))} aria-label="Filter price list by firm">
              <option value="all">—All Firms—</option>
              {[...new Map(rows.map((row) => [row.firmId, row.firm])).entries()].map(([id, label]) => <option key={id} value={id}>{label}</option>)}
            </select>
          </label>
          <label>
            <span>Category:</span>
            <select value={filters.categoryId} onChange={(event) => onFiltersChange((current) => ({ ...current, categoryId: event.target.value }))} aria-label="Filter price list by category">
              <option value="all">—All Category—</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </label>
        </>
      )}
      filterRow={(row) => (filters.firmId === 'all' || row.firmId === filters.firmId) && (filters.categoryId === 'all' || row.categoryId === filters.categoryId)}
      emptyMessage="No prices found."
      ariaLabel="Price list"
      minWidth={710}
    />
  )
}
