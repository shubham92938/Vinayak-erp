// No price-history rows were supplied in the imported PDFs.
export const PRICE_HISTORY_DEMO_DATA = []

export function getPriceHistoryFor(productId) {
  return PRICE_HISTORY_DEMO_DATA.filter((entry) => entry.productId === productId)
}
