import { useState } from 'react'
import { ShieldCheck, TrendingDown, TrendingUp } from 'lucide-react'
import { useAuth } from '../../../context/hooks'
import { hasModulePermission } from '../../../core/accessControl'
import { useNavigate } from 'react-router-dom'
import { Button, useToast } from '../../../components/ui'
import { createStockOut, getStockTable } from '../services/inventoryService'
import StockForm from '../components/StockForm'
import '../styles/inventory.css'

export default function StockOutPage() {
  const toast = useToast()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const canEditInventory = hasModulePermission(currentUser, 'Inventory', 'edit')
  const [isFormOpen, setIsFormOpen] = useState(false)

  const allProducts = getStockTable()
  const lowStock = allProducts.filter((product) => product.stockStatus === 'Low Stock').length

  return (
    <div className="inventory-page">
      <header className="inventory-header">
        <div className="inventory-header__top">
          <div className="inventory-header__text">
            <p className="inventory-header__eyebrow"><span aria-hidden="true">#</span> Stock Out</p>
            <h1 className="inventory-header__title">Stock Out</h1>
            <p className="inventory-header__description">
              Record sales-based stock deductions. Stock can never go negative without confirmation.
            </p>
          </div>
          <div className="inventory-header__actions">
            <Button size="sm" variant="secondary" onClick={() => navigate('/inventory')}>Back to Inventory</Button>
            {canEditInventory && <Button onClick={() => setIsFormOpen(true)}><TrendingDown size={14} /> Record Stock Out</Button>}
          </div>
        </div>
        <div className="inventory-kpi-grid">
          <KpiCard label="Products" value={allProducts.length} />
          <KpiCard label="Products Below Min Stock" value={lowStock} icon={TrendingUp} />
          <KpiCard label="Total Out Stock" value={allProducts.filter((product) => product.stockStatus === 'Out of Stock').length} icon={ShieldCheck} />
        </div>
      </header>

      {isFormOpen && (
        <StockForm
          mode="stock-out"
          onClose={() => setIsFormOpen(false)}
          onSubmit={(data) => {
            if (!canEditInventory) return
            createStockOut(data)
            toast.success('Stock Out recorded')
          }}
        />
      )}
    </div>
  )
}

function KpiCard({ label, value, icon: Icon }) {
  return (
    <div className="inventory-kpi-card">
      <div className="inventory-kpi-card__top">
        <span className="inventory-kpi-card__label">{label}</span>
        {Icon ? <Icon className="inventory-kpi-card__icon" /> : null}
      </div>
      <span className="inventory-kpi-card__value">{value}</span>
    </div>
  )
}
