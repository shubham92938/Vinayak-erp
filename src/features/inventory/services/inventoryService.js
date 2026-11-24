/**
 * Inventory service — wraps the central store + product service.
 */
import { getProducts, updateProductQuantity } from '../../products/services/productService'
import { getStockMovements, recordStockMovement, mockStockMovements } from '../../../core/store'

export function getStockTable() {
  return getProducts().map((product) => ({
    id: product.id,
    name: product.name,
    code: product.code,
    categoryName: product.categoryId,
    firmId: product.firmId,
    availableQuantity: product.quantity ?? 0,
    minStock: product.minStock ?? 0,
    unit: product.unit ?? 'pcs',
    stockValue: (product.quantity ?? 0) * (product.sellingPrice ?? 0),
    stockStatus: getStockStatus(product),
  }))
}

export function getStockStatus(product) {
  if (product.stockTracking === false) return 'Untracked'
  const quantity = product.quantity ?? 0
  if (quantity === 0) return 'Out of Stock'
  if (quantity <= product.minStock) return 'Low Stock'
  return 'In Stock'
}

export function getStockHistory(productId) {
  return getStockMovements(productId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function createStockIn({ productId, qty, unit, reference, reason }) {
  const product = getProducts().find((entry) => entry.id === productId)
  if (!product) throw new Error('Product not found')
  if (qty <= 0) throw new Error('Quantity must be greater than 0')

  const previousStock = product.quantity ?? 0
  updateProductQuantity(productId, previousStock + qty)
  return recordStockMovement({ type: 'stock-in', productId, qty, unit, reference, reason, previousStock, newStock: previousStock + qty })
}

export function createStockOut({ productId, qty, unit, reference, reason }) {
  const product = getProducts().find((entry) => entry.id === productId)
  if (!product) throw new Error('Product not found')
  if (qty <= 0) throw new Error('Quantity must be greater than 0')
  if (product.stockTracking !== false && (product.quantity ?? 0) - qty < 0) {
    throw new Error(`Insufficient stock: ${product.name}. Available: ${product.quantity}, requested: ${qty}`)
  }

  const previousStock = product.quantity ?? 0
  updateProductQuantity(productId, previousStock - qty)
  return recordStockMovement({ type: 'stock-out', productId, qty, unit, reference, reason, previousStock, newStock: previousStock - qty })
}

export function createAdjustment({ productId, newQuantity, reason }) {
  const product = getProducts().find((entry) => entry.id === productId)
  if (!product) throw new Error('Product not found')
  if (newQuantity < 0) throw new Error('Stock cannot be negative')

  const previousStock = product.quantity ?? 0
  updateProductQuantity(productId, newQuantity)
  return recordStockMovement({ type: 'adjustment', productId, qty: newQuantity - previousStock, unit: product.unit, reference: 'ADJ', reason, previousStock, newStock: newQuantity })
}

export function createTransfer({ sourceFirmId, destinationFirmId, productId, qty, notes }) {
  if (sourceFirmId === destinationFirmId) throw new Error('Source and destination must be different firms')
  const sourceProduct = getProducts().find((entry) => entry.id === productId && entry.firmId === sourceFirmId)
  const destinationProduct = getProducts().find((entry) => entry.firmId === destinationFirmId && entry.code === sourceProduct?.code)
  if (!sourceProduct) throw new Error('Source product not found')
  if (!destinationProduct) throw new Error('Destination firm has no product with this code. Create the product first.')
  if ((sourceProduct.quantity ?? 0) < qty) throw new Error('Insufficient stock at source firm')

  const outgoing = createStockOut({ productId: sourceProduct.id, qty, unit: sourceProduct.unit, reference: `XFER-${Math.floor(Math.random() * 1000)}`, reason: `Transfer to ${destinationFirmId} — ${notes}` })
  const incoming = createStockIn({ productId: destinationProduct.id, qty, unit: destinationProduct.unit, reference: `XFER-${outgoing.id}`, reason: `Transfer from ${sourceFirmId} — ${notes}` })
  return { outgoing, incoming }
}

export function getStockMovementSummary() {
  const movements = mockStockMovements
  return {
    totalIn: movements.reduce((sum, entry) => (entry.type === 'stock-in' ? sum + entry.qty : sum), 0),
    totalOut: movements.reduce((sum, entry) => (entry.type === 'stock-out' ? sum + entry.qty : sum), 0),
    adjustments: movements.filter((entry) => entry.type === 'adjustment').length,
  }
}
