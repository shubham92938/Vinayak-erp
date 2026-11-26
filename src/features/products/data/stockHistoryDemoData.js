// No stock-history rows were supplied in the imported PDFs.
export const STOCK_HISTORY_DEMO_DATA = []

export function getStockHistoryFor(_products, productId) {
  return STOCK_HISTORY_DEMO_DATA.filter((entry) => entry.productId === productId)
}
