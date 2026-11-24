/**
 * Sales Orders service — wraps the central finance store.
 */
import {
  getSalesOrders,
  getSalesOrderById,
  createSalesOrder,
  updateSalesOrder,
  confirmSalesOrder,
  fulfillSalesOrder,
  cancelSalesOrder,
} from '../../../core/salesOrdersStore'

export {
  getSalesOrders,
  getSalesOrderById,
  createSalesOrder,
  updateSalesOrder,
  confirmSalesOrder,
  fulfillSalesOrder,
  cancelSalesOrder,
}
