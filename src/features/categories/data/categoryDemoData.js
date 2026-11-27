import { isStabilityModeEnabled } from '../../../core/stabilityMode'
import { STABILITY_CATEGORIES } from '../../../core/stabilityData'

// Stability mode supplies synthetic category rows for testing tables, forms,
// filters, linked-product warnings, and permission-aware screens.
export const CATEGORY_DEMO_DATA = isStabilityModeEnabled() ? STABILITY_CATEGORIES : []
