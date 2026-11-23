import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../../components/ui'
import { downloadCsv } from '../../../utils/csv'
import { getPriceListRows } from '../services/priceListService'
import PriceListTable from '../components/PriceListTable'
import '../styles/price-list.css'

const CSV_COLUMNS = [
  { key: 'name', label: 'Product' },
  { key: 'code', label: 'Code' },
  { key: 'category', label: 'Category' },
  { key: 'firm', label: 'Firm' },
  { key: 'buyingPrice', label: 'Buying Price' },
  { key: 'sellingPrice', label: 'Selling Price' },
  { key: 'mrp', label: 'MRP' },
  { key: 'lastUpdated', label: 'Last Updated' },
]

export default function PriceListPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState({ firmId: 'all', categoryId: 'all', search: '' })

  const rows = useMemo(() => getPriceListRows(filters), [filters])
  const totalRows = rows.length

  const exportCsv = () => {
    downloadCsv({
      filename: 'vinayak-price-list.csv',
      columns: CSV_COLUMNS,
      rows,
    })
  }

  const handleRowView = (productId) => navigate(`/products/${productId}`)

  return (
    <div className="price-list-page">
      <header className="price-list-header">
        <div className="price-list-header__top">
          <div className="price-list-header__text">
            <p className="price-list-header__eyebrow"><span aria-hidden="true">#</span> Price List</p>
            <h1 className="price-list-header__title">Price List</h1>
            <p className="price-list-header__description">
              Current buying and selling prices of all products.
            </p>
          </div>
          <div className="price-list-header__actions">
            <Button variant="secondary" onClick={exportCsv}>Export CSV</Button>
            <Button size="sm" onClick={() => navigate('/products')}>Back to Products</Button>
          </div>
        </div>
        <div className="price-list-kpi">
          <span className="price-list-kpi__label">Products</span>
          <span className="price-list-kpi__value">{totalRows}</span>
        </div>
      </header>

      <PriceListTable
        rows={rows}
        filters={filters}
        onFiltersChange={setFilters}
        onRowView={handleRowView}
      />
    </div>
  )
}
