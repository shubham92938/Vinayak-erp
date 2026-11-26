// The dashboard must not manufacture business metrics. The supplied PDFs do
// not contain dashboard snapshots, so the dashboard service starts with empty
// collections and will populate from API records when that connection exists.
export const DEMO_DATA_LABEL = 'Imported ERP data'
export const DEMO_DATA_NOTICE = 'No dashboard snapshot was supplied in the imported PDFs.'
export const DEMO_TODAY = new Date().toISOString().slice(0, 10)
export const DEMO_DATA_START = DEMO_TODAY
export const DEMO_CUSTOMERS = []
export const DEMO_SUPPLIERS = []
export const DEMO_PRODUCTS = []
export const DEMO_TRANSACTIONS = []
export const DEMO_ORDERS = []
