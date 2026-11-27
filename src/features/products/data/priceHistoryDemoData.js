import { isStabilityModeEnabled } from '../../../core/stabilityMode'
import { DEMO_PRICE_HISTORY } from '../../../core/demoData'

export const PRICE_HISTORY_DEMO_DATA = isStabilityModeEnabled() ? [] : DEMO_PRICE_HISTORY

export function getPriceHistoryFor(productId) {
  return PRICE_HISTORY_DEMO_DATA.filter((entry) => entry.productId === productId)
}
