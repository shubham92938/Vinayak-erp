/**
 * Sales service — wraps the central sales store.
 */
import { mockSales, getSales, getSalesFiltered, getSaleById, getPayments, updateSale } from '../../../core/salesStore'
import { getProducts } from '../../products/services/productService'
import { DEFAULT_FIRM_ID } from '../../../config/firms'
import { getActiveFirmId } from '../../../core/firmContextStore'

export { getSales, getSalesFiltered, getSaleById, getPayments, updateSale }
export { mockSales }

export function getProductsForSale() {
  const activeFirmId = getActiveFirmId()
  return getProducts().filter((product) => !activeFirmId || product.firmId === activeFirmId).map((product) => ({
    id: product.id,
    name: product.name,
    code: product.code,
    unit: product.unit,
    sellingPrice: product.sellingPrice,
    buyingPrice: product.buyingPrice,
    quantity: product.quantity,
  }))
}

export function createChallan({ customerId, customerName, items, discount, date, notes }) {
  const { subtotal, taxTotal, total } = computeTotals(items, discount)
  const challan = {
    id: `CHL-${Math.floor(Math.random() * 100000)}`,
    number: `CHAL-${String(mockSales.length + 1).padStart(6, '0')}`,
    type: 'Challan',
    customerId,
    customerName,
    date,
    items,
    discount,
    subtotal,
    taxTotal,
    total,
    advance: 0,
    paid: 0,
    due: total,
    status: 'Delivered',
    notes: notes ?? '',
    firmId: getActiveFirmId() ?? DEFAULT_FIRM_ID,
  }
  mockSales.push(challan)
  return { ...challan }
}

function computeTotals(items, discount) {
  const subtotal = items.reduce((sum, item) => sum + item.qty * (item.price ?? 0), 0)
  const taxTotal = Math.round((subtotal * 0.18 + Number.EPSILON) * 100) / 100
  return { subtotal, taxTotal, total: subtotal + taxTotal - discount }
}

export function getSaleTotals(sale) {
  const sourceTotal = Number(sale?.total)
  if (Number.isFinite(sourceTotal)) {
    const items = Array.isArray(sale?.items) ? sale.items : []
    const subtotal = Number.isFinite(Number(sale?.subtotal))
      ? Number(sale.subtotal)
      : items.reduce((sum, item) => sum + Number(item.qty ?? 0) * Number(item.price ?? 0), 0)
    return {
      subtotal,
      taxTotal: Number(sale?.taxTotal ?? 0),
      total: sourceTotal,
    }
  }
  return computeTotals(sale?.items ?? [], sale?.discount ?? 0)
}
