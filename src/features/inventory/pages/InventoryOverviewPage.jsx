import { useState } from 'react'
import { ShieldCheck, TrendingUp } from 'lucide-react'
import { Card, CardBody } from '../../../components/ui'
import { useFirmContext } from '../../../context/hooks'
import { getProducts } from '../../products/services/productService'
import { formatMoney } from '../../../core/store'
import { getStockTable, getStockStatus } from '../services/inventoryService'
import StockOverviewTable from '../components/StockOverviewTable'
import '../styles/inventory.css'

export default function InventoryOverviewPage() {
  useFirmContext()
  const [filters, setFilters] = useState({ product: '', category: '', stockStatus: 'all', firmId: 'all' })

  const allProducts = getProducts()
  const inStockCount = allProducts.filter((product) => getStockStatus(product) === 'In Stock').length
  const lowStockCount = allProducts.filter((product) => getStockStatus(product) === 'Low Stock').length
  const outOfStockCount = allProducts.filter((product) => getStockStatus(product) === 'Out of Stock').length
  const stockValue = getStockTable().reduce((sum, row) => sum + row.stockValue, 0)

  const kpis = [
    { label: 'Total Products', value: allProducts.length, icon: ShieldCheck },
    { label: 'Total Stock Quantity', value: allProducts.reduce((sum, product) => sum + (product.quantity ?? 0), 0) },
    { label: 'Low Stock Products', value: lowStockCount, icon: TrendingUp },
    { label: 'Out of Stock Products', value: outOfStockCount, icon: ShieldCheck },
    { label: 'In Stock Products', value: inStockCount },
    { label: 'Stock Valuation', value: formatMoney(stockValue) },
  ]

  return (
    <div className="inventory-page">
      <header className="inventory-header">
        <div className="inventory-header__top">
          <div className="inventory-header__text">
            <p className="inventory-header__eyebrow"><span aria-hidden="true">#</span> Inventory</p>
            <h1 className="inventory-header__title">Inventory Overview</h1>
            <p className="inventory-header__description">
              Track stock levels, minimums and valuation across all firms.
            </p>
          </div>
        </div>
      </header>

      <div className="inventory-kpi-grid">
        {kpis.map((item) => (
          <div key={item.label} className="inventory-kpi-card">
            <div className="inventory-kpi-card__top">
              <span className="inventory-kpi-card__label">{item.label}</span>
              {item.icon ? <item.icon className="inventory-kpi-card__icon" /> : null}
            </div>
            <span className="inventory-kpi-card__value">{item.value}</span>
          </div>
        ))}
      </div>

      <Card className="inventory-card">
        <CardBody>
          <StockOverviewTable filters={filters} onFiltersChange={setFilters} />
        </CardBody>
      </Card>
    </div>
  )
}
