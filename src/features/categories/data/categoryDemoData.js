import { isStabilityModeEnabled } from '../../../core/stabilityMode'
import { STABILITY_CATEGORIES } from '../../../core/stabilityData'
import { DEMO_CATEGORIES } from '../../../core/demoData'

// Normal local workspaces use the same interconnected three-firm catalogue;
// stability mode swaps in the focused one-firm edge-case fixture.
export const CATEGORY_DEMO_DATA = isStabilityModeEnabled() ? STABILITY_CATEGORIES : DEMO_CATEGORIES
