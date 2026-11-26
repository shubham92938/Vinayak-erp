# Main website recording review

Source: the five MP4 recordings in the connected Google Drive `Webdesign` folder (recorded 24 Nov 2026). The recordings are portrait Android captures; the first roughly 30 seconds of the longest file show unrelated browser/editor activity, so the website review starts at the login screen.

## Feature inventory implemented in this pass

- Website shell: Vinayak Group branding, current-firm banner, compact dark navigation, responsive horizontal navigation, and the recorded Home/Dashboard/Firms/Users/Products/Sales Management/Purchase Management/Quotations/Transaction/Reports structure.
- Authentication and firm selection: email/password login, password visibility control, firm cards with association/business type/city details, and explicit firm-scoped workspace entry. Existing authentication, multi-firm access, and permission enforcement remain active.
- Dashboard quick-access cards: Products, Price List, Sales, Sales Orders, Purchase, Purchase Orders, Quotations, Balance, Expenses, Outstanding, and Profit & Loss. The chart-heavy dashboard that was not present in the recordings is no longer shown.
- Products: compact table with firm/admin, image/no-photo state, name, code, category, quantity, buying/selling prices, stock status, row view/edit actions, export controls, category/search filters, 5/10/15/25 page sizes, and pagination.
- Product form: recorded no-photo/upload area and fields for name, category, dealer/customer prices, quantity, quantity alert, unit, SGST/CGST/IGST, notes, Save, and Cancel. Product codes and firm ownership are still generated/enforced by the existing scoped store.
- Price list: compact firm/category/search table with image, firm/admin, name, code, category, price, export controls, page sizes, and pagination.
- Sales: recorded filters, list columns, export/refresh/create controls, and a Create Sales Order flow with customer/order fields, product catalogue, cart quantities/prices, totals, payment/vehicle/driver/notes fields, and item deletion confirmation.
- Sales Orders: recorded filter/list layout, create control, the same cart-based order form, and persisted order creation.
- Purchases: recorded filters/list layout, export/create/refresh controls, and the Internal/External Create Purchase Order form. Internal mode supports firm selection, product rows, tax, totals, notes, and Purchase; External mode supports buyer/customer/bill/date/payment, new-product handoff, advance amount, notes, and Save External Purchase.

## Unwanted UI removed or hidden from the recorded first-half surface

- The left sidebar/topbar workspace chrome was replaced by the compact horizontal website navigation.
- Dashboard KPI/chart panels, demo-data notices, and transaction charts are no longer displayed on the main dashboard.
- Products no longer advertise advanced status/stock/date filters, bulk status controls, duplicate controls, or a large KPI strip; the recorded category/search/table workflow is the default.
- The login screen no longer exposes demo-account cards or the frontend implementation disclaimer.
- Finance, inventory, notification, settings, and other modules remain routable for the completed permission work, but are not promoted in the recorded navigation or first-half dashboard.

## Bugs fixed during the review

- Added the missing create routes and controls for sales, sales orders, and purchase orders.
- Fixed filter controls that replaced the entire filter object instead of merging the selected field.
- Fixed repeated sales-order fulfillment from decrementing stock by the full order on every click.
- Fixed repeated purchase-order receipt from adding the full order to stock on every click.
- Purchase creation now honors line tax rates, advance payments, paid/due status, payment mode, and returns a clone-safe record.
- Sales creation now honors line tax rates when the form provides them instead of silently forcing 18%.
- Removed the nested product edit modal caused by a form component that already rendered its own modal.
- Kept export/create/edit actions permission-aware while removing controls not demonstrated in the recordings.

## Deferred until the next recordings

The recordings only establish the first-half navigation and workflows above. Other existing modules and any deeper behavior not visible in these captures should not be treated as the final main-website design; they remain available behind the existing permission guards for later review.

## Remaining-section pass — 2026-11-26

The available `2026-11-26 12-21-32.mp4` overview (6:49) was reviewed again before the theme work. Its later sections confirm the same compact website shell across Firms, Users/Roles, Customers, Products, Categories, Price List, Sales, Sales Orders, Purchases, and the Internal/External Purchase Order form. The purchase form shows firm/product rows, tax and totals for internal purchases, plus buyer, bill, payment, advance, notes, and new-product handoff fields for external purchases.

The recording's visible master rows remain presentation reference only. The runtime still preserves the source-reviewed baseline: one Shree Vinayak Agency firm, 23 approved sales rows, and empty unverified product, category, customer, purchase, and order masters. The recording does not authorize importing the other visible names, products, customers, or purchase rows.
