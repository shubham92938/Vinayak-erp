import { isStabilityModeEnabled } from '../../../core/stabilityMode'
import { STABILITY_PRODUCTS } from '../../../core/stabilityData'
import { DEMO_PRODUCTS } from '../../../core/demoData'

// Stability mode remains available for the focused one-firm edge-case fixture.
// Normal local workspaces use the interconnected three-firm demo catalogue.
export const PRODUCT_DEMO_DATA = isStabilityModeEnabled() ? STABILITY_PRODUCTS : DEMO_PRODUCTS
