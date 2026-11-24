import { useState } from 'react'
import { ShieldCheck, TrendingUp } from 'lucide-react'
import { useAuth } from '../../../context/hooks'
import { hasModulePermission } from '../../../core/accessControl'
import { useNavigate } from 'react-router-dom'
import { Button, useToast } from '../../../components/ui'
import { createStockIn, getStockTable } from '../services/inventoryService'
import StockForm from '../components/StockForm'
import '../styles/inventory.css'

export default function StockInPage() {
  const toast = useToast()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const canEditInventory = hasModulePermission(currentUser, 'Inventory', 'edit')
  const [isFormOpen, setIsFormOpen] = useState(false)

  const allProducts = getStockTable()
  const totalIn = allProducts.reduce((sum, product) => sum + product.availableQuantity, 0)

  return (
    <div className="inventory-page">
      <header className="inventory-header">
        <div className="inventory-header__top">
          <div className="inventory-header__text">
            <p className="inventory-header__eyebrow"><span aria-hidden="true">#</span> Stock In</p>
            <h1 className="inventory-header__title">Stock In</h1>
            <p className="inventory-header__description">Record physical stock arrivals — Purchases, Re-stocking.</p>
          </div>
          <div className="inventory-header__actions">
            <Button size="sm" variant="secondary" onClick={() => navigate('/inventory')}>Back to Inventory</Button>
            {canEditInventory && <Button onClick={() => setIsFormOpen(true)}><ShieldCheck size={14} /> Record Stock In</Button>}
          </div>
        </div>
        <div className="inventory-kpi-grid">
          <KpiCard label="Products" value={allProducts.length} />
          <KpiCard label="Total In Stock" value={totalIn} icon={TrendingUp} />
          <KpiCard label="Stock History" value={countStockMoves('stock-in')} icon={ShieldCheck} />
        </div>
      </header>

      {isFormOpen && (
        <StockForm
          mode="stock-in"
          onClose={() => setIsFormOpen(false)}
          onSubmit={(data) => {
            if (!canEditInventory) return
            createStockIn(data)
            toast.success('Stock In recorded')
          }}
        />
      )}
    </div>
  )
}

import { getStockMovements } from '../../../core/store'
function countStockMoves(type) {
  return getStockMovements(null).filter((entry) => entry.type === type).length
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
