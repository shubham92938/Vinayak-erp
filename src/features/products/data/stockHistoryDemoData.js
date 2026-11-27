import { isStabilityModeEnabled } from '../../../core/stabilityMode'
import { STABILITY_STOCK_MOVEMENTS } from '../../../core/stabilityData'
import { DEMO_STOCK_HISTORY } from '../../../core/demoData'

export const STOCK_HISTORY_DEMO_DATA = isStabilityModeEnabled()
  ? STABILITY_STOCK_MOVEMENTS
  : DEMO_STOCK_HISTORY

export function getStockHistoryFor(_products, productId) {
  return STOCK_HISTORY_DEMO_DATA.filter((entry) => entry.productId === productId)
}
