/**
 * Purchase service — wraps the central purchase store.
 */
import {
  getPurchases,
  getPurchaseById,
  createPurchase,
  updatePurchase,
  confirmPurchase,
  deletePurchase,
} from '../../../core/purchaseStore'

export { getPurchases, getPurchaseById, createPurchase, updatePurchase, confirmPurchase, deletePurchase }
export { mockPurchases } from '../../../core/purchaseStore'
export { getProducts } from '../../products/services/productService'

export const PURCHASE_STATUSES = [
  { value: 'all', label: 'All statuses' },
  { value: 'Draft', label: 'Draft' },
  { value: 'Confirmed', label: 'Confirmed' },
  { value: 'Outstanding', label: 'Outstanding' },
  { value: 'Partially Paid', label: 'Partially Paid' },
  { value: 'Paid', label: 'Paid' },
]
