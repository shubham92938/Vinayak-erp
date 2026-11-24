/**
 * Sales service — wraps the central sales store.
 */
import { mockSales, getSales, getSalesFiltered, getSaleById, getPayments } from '../../../core/salesStore'
import { getProducts } from '../../products/services/productService'

export { getSales, getSalesFiltered, getSaleById, getPayments }
export { mockSales }

export function getProductsForSale() {
  return getProducts().map((product) => ({
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
  return computeTotals(sale.items, sale.discount ?? 0)
}
