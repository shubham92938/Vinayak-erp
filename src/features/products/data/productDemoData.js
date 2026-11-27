import { isStabilityModeEnabled } from '../../../core/stabilityMode'
import { STABILITY_PRODUCTS } from '../../../core/stabilityData'

// Stability mode is opt-in via ?stability=1 or localStorage. The normal app
// keeps the imported product master empty until authoritative data is loaded.
export const PRODUCT_DEMO_DATA = isStabilityModeEnabled() ? STABILITY_PRODUCTS : []
