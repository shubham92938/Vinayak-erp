# Vinayak ERP — UI/UX Design Brief

**Document purpose:** handoff to a professional product/UI/UX designer for a modern, coherent redesign of the existing web application.

**Product:** Vinayak ERP
**Repository:** `shubham92938/Vinayak-erp`
**Current stack:** React 19, Vite, React Router, React Hook Form, Zod, Lucide React, Recharts
**Primary market context:** small and mid-sized Indian businesses managing products, inventory, sales, purchasing, customers, and finance across one or more firms.

---

## 1. Product summary

Vinayak ERP is a firm-aware operations and accounting workspace. A user signs in, selects or enters a firm workspace, and manages the firm’s master data and day-to-day transactions.

The product combines:

- Firm and workspace management
- Product catalogue and pricing
- Customer records
- Inventory movement and stock control
- Sales and sales orders
- Purchases and purchase orders
- Quotations
- Transactions, payments, expenses, transfers, and profit/loss
- Reports and exports
- User accounts, permissions, notifications, and settings

The redesign should make the product feel modern, calm, visual, and easier to scan without changing the underlying business behavior.

### The most important design request

Improve the **existing website**, especially:

- Global navbar and workspace navigation
- Page hierarchy and section rhythm
- Dashboard/module cards
- Product catalogue cards and product sections
- Filters, tables, actions, empty states, and detail panels
- Responsive behavior on mobile

This is **not** a request to invent a different product or replace the ERP information architecture.

---

## 2. Design direction from the client

The client shared two visual references. They liked the **format and composition**, not the exact branding or content.

### Format to take as inspiration

- Rounded modular dashboard panels
- Soft, friendly card shapes
- Compact pill-style navigation and category tabs
- Clear visual grouping of related metrics
- Large headline area with supporting modules beneath
- A contextual profile/firm panel on the right where useful
- Product cards with a clear visual hierarchy
- Pastel surfaces used as a way to distinguish content groups
- Strong whitespace and approachable typography

### Do not copy

- Jewellery, education, banking, or unrelated industry content
- Reference logos, names, people, avatars, copy, or exact layouts
- Any visual that makes Vinayak ERP look like a banking or jewellery product
- Any new navigation model that hides existing modules

### Desired Vinayak ERP character

Create an original visual identity for a practical Indian business operations product:

- Professional, but not cold
- Visual, but not decorative at the expense of data
- Friendly, but still trustworthy for money and inventory records
- Card-based, but usable for dense tables and long product names
- Suitable for desktop operators and mobile business owners

A restrained pastel palette is welcome, but status meaning must remain clear. Colour must not be the only indicator of low stock, payment status, error, or permission state.

---

## 3. Users and access model

The application already has role- and firm-aware permissions. The UI must communicate access clearly without exposing modules or actions a user cannot use.

### Supported roles

| Role | Typical responsibility | Design implication |
|---|---|---|
| Super Admin | Manages firms, users, permissions, and all business data | Can switch across firms and see global administration controls |
| Firm Admin | Manages one firm’s master data and operations | Own-firm workspace and administrative controls |
| Manager | Oversees day-to-day business activity | Broad read/create/edit access, operational overview |
| Accountant | Finance, approvals, exports, reconciliation | Needs strong financial hierarchy and audit-friendly states |
| Sales Staff | Sales and sales orders | Fast customer/product selection and sale creation |
| Purchase Staff | Purchases and purchase orders | Fast supplier/order workflow and due tracking |
| Inventory Staff | Stock and inventory movement | Fast stock-in, stock-out, adjustment, and transfer workflows |
| Viewer | Read-only access | Hide edit/create/delete actions and show clear read-only state |

### Permission dimensions

Permissions exist at several levels:

- Module visibility: `view`, `create`, `edit`, `delete`, `export`, `approve`
- Firm access: own firm or explicitly assigned firms
- Data scope: own-firm data versus all-firm data
- Firm permissions: view/edit firm details, create firms, manage all firms
- User status: active or inactive

### Permission-aware UI requirements

- Do not show disabled action clutter when an action is not permitted; hide it where appropriate.
- When a user can view but not edit, preserve the same screen with a clear read-only treatment.
- If a user reaches an unauthorized route, show a useful access-denied state and a route back to an allowed workspace.
- Firm switchers must only show firms the user can access.
- “All firms” filters must only appear for users with the relevant scope permission.
- Exports and approval actions must visibly reflect permission state.

---

## 4. Information architecture and navigation

The existing product uses a global header and horizontal navigation. The redesign may refine the presentation, but all of the following modules must remain discoverable and permission-aware.

### Overview

- Dashboard
- Firms / My Firms home

### Users

- Users & Permissions
- User details
- Permission matrix
- User activity

### Products / master data

- Products
- Add Product
- Product details
- Categories
- Category details
- Price List

### Customers

- Customers
- Customer details
- Customer sales history
- Customer payment history
- Customer activity

### Inventory

- Inventory Overview
- Stock In
- Stock Out
- Stock Adjustments
- Stock Transfers

### Sales management

- Sales
- Sale details
- Sale print/download
- Sales Orders
- Sales Order details
- Create Sales Order / Sale

### Purchase management

- Purchases
- Purchase details
- Purchase Orders
- Purchase Order details
- Create Purchase Order / Purchase

### Quotations

- Quotations
- Quotation details

### Finance

- Transactions
- Balance
- Payment In
- Payment Out
- Fund Transfers
- Expenses
- Profit & Loss

### Insight and system

- Reports
- Notifications
- Settings
  - General
  - Firm
  - Financial
  - Inventory
  - Document
- Profile
- Search

### Existing route patterns

The application supports direct/legacy routes and firm-workspace routes. The designer should treat these as the same product screens:

- Direct examples: `/products`, `/sales`, `/customers`
- Firm workspace examples: `/firms/:firmId/workspace/products`, `/firms/:firmId/workspace/sales`
- Firm profile: `/firms/:firmId/profile`
- Firm home: `/home`
- Login: `/login`

Do not redesign the URL structure or remove direct links as part of a visual redesign.

---

## 5. Screen inventory and UX requirements

### 5.1 Login

**Route:** `/login`

Current behavior:

- Email and password login
- Show/hide password control
- Error message for missing/invalid credentials
- Theme toggle
- Security and firm-scoped access messaging

Design goals:

- Fast, trustworthy, mobile-friendly sign-in
- Keep the Vinayak brand visible without overloading the screen
- Clear focus states and autofill-friendly fields
- Error copy near the form, not only in a toast
- Preserve password recovery placeholder behavior until a backend exists

Local demo credentials:

- Email: `admin@local.invalid`
- Password: `demo123`

### 5.2 My Firms / firm selection

**Route:** `/home`

Current behavior:

- Shows firms accessible to the current user
- Search firms
- Open a firm workspace
- Create a new firm when permitted
- Shows firm name, contact/association, business type, city, status, and more details

Design goals:

- Make the active/access relationship immediately clear
- Use modern firm cards with a strong primary “Open workspace” action
- Support one-firm and many-firm states
- Design empty, no-results, inactive, and create-firm states
- On mobile, cards should remain easy to scan and tap

### 5.3 Global workspace shell

Current shared elements:

- Vinayak brand/header
- Current firm context
- Theme toggle
- User menu/profile/logout
- Global navigation
- Context/status strip
- Main content region

Design goals:

- Make the current firm and current module obvious at all times
- Make primary modules reachable within one or two taps
- Avoid nav overflow becoming an unusable horizontal line on mobile
- Use a compact responsive menu/drawer when the full nav cannot fit
- Keep the navbar visually light enough that page content remains primary
- Provide a consistent breadcrumb or page-context pattern

### 5.4 Dashboard

**Route:** `/dashboard` or workspace index

Current dashboard data includes:

- Total Sales
- Total Purchases
- Total Revenue
- Total Expenses
- Gross Profit
- Net Profit
- Outstanding Receivables
- Outstanding Payables
- Total Products
- Low Stock Products
- Sales overview
- Revenue versus expense
- Payment collection
- Firm performance
- Top products
- Inventory alerts
- Pending orders
- Upcoming payments
- Recent transactions
- Top customers

Dashboard controls:

- Date-range presets
- Custom date range
- Financial year
- Firm filter where permitted
- Reset filters
- Refresh
- Export filtered dashboard data

Design goals:

- Do not show every metric with equal visual weight
- Establish a clear “what needs attention” hierarchy
- Use modular cards like the client’s references, but keep financial numbers readable
- Pair every chart with a meaningful summary and accessible text alternative
- Make inventory alerts, overdue payments, and pending orders actionable
- Provide useful loading, empty, error, and no-data states
- Keep the first viewport useful on laptop and mobile

Recommended dashboard structure to explore:

1. Greeting/page context and primary actions
2. Date/firm filter pills
3. Three to six priority business signals
4. Sales/revenue/cash visual section
5. Inventory and order attention section
6. Recent activity or transactions
7. Quick access to major modules

This is a design recommendation, not a permission to remove existing dashboard information.

### 5.5 Products

**Routes:** `/products`, `/products/create`, `/products/:productId`

Current product fields:

- Name
- Code
- Category
- Firm
- Unit
- Quantity
- Minimum stock / quantity alert
- Buying price
- Selling price
- Optional SGST, CGST, IGST
- Notes/description
- Status: active/inactive
- Image

Current actions:

- Search
- Category filtering
- View
- Edit
- Delete with confirmation
- Export
- Create product
- Product detail view
- Stock history
- Price history

Design goals:

- Use product cards or a card/table hybrid as a more visual catalogue mode
- Keep long agricultural/irrigation product names readable
- Show code, category, selling price, quantity, and stock status first
- Make low-stock and out-of-stock states obvious
- Keep View/Edit/Delete actions discoverable but not visually noisy
- Preserve a dense table mode for bulk operations and exports
- Provide a clear empty state when no products exist
- Support image upload and generated catalogue thumbnails

### 5.6 Categories

**Routes:** `/categories`, `/categories/create`, `/categories/:categoryId`, `/categories/:categoryId/edit`

Requirements:

- Category list and search
- Create/edit category
- Category details
- Product count per category
- Linked-product warning before category deletion
- Active/inactive category state

Design goals:

- Show category health and product count visually
- Make category-to-product relationships easy to understand
- Prevent accidental deletion when products are linked

### 5.7 Price List

**Route:** `/price-lists` / `/price-list`

Requirements:

- Browse prices by product/category/firm
- Preserve product identity and price context
- Support export where permission allows

Design goals:

- Make a price list quick to scan on mobile
- Distinguish buying price, selling price, and price-list price
- Provide clear filters and a compact comparison pattern

### 5.8 Customers

**Routes:** `/customers`, `/customers/:customerId`

Current customer experience includes:

- Search and filters
- Customer table
- Create/edit customer
- Customer profile/details
- Sales history
- Payment history
- Activity
- Customer-specific actions

Design goals:

- Make customer identity, balance, contact, and recent activity visible together
- Use a clean profile header with contextual actions
- Keep sales and payment history scannable
- Support dealers/customers with optional email data

### 5.9 Inventory

**Routes:**

- `/inventory`
- `/inventory/stock-in`
- `/inventory/stock-out`
- `/inventory/adjustments`
- `/inventory/transfers`

Inventory overview currently includes:

- Total products
- Total stock quantity
- Low-stock products
- Out-of-stock products
- In-stock products
- Stock valuation
- Product/category/status/firm filters
- Stock table

Inventory workflows:

- Record stock in
- Record stock out
- Adjust stock
- Transfer stock between locations/firms where permitted
- Select product, quantity, unit, date, reason, and notes

Design goals:

- Stock status should be instantly understandable
- Separate “quantity”, “stock value”, “low stock”, and “out of stock” concepts
- Use clear confirmation and reversal/error states
- Make the most common stock action easy to start
- Do not hide transfer/adjustment workflows inside a generic menu

### 5.10 Sales and Sales Orders

**Routes:**

- `/sales`
- `/sales/new`
- `/orders`
- `/orders/create`
- `/orders/details/:saleId`
- `/sales/:saleId`
- `/sales-orders`
- `/sales-orders/new`
- `/sales-orders/:orderId`
- `/orders/details/:saleId/download`

Sales experience includes:

- Sales list/table
- Search and filters
- Payment mode and buyer type filters
- Date filtering
- Create order/sale
- Product selection
- Customer selection
- Quantity/price/discount/tax calculations
- Payment recording
- View details
- Print/download
- Cancel sale with confirmation
- CSV export where permitted

Design goals:

- Optimize for fast entry by a sales operator
- Keep order totals, due amount, payment status, and customer visible
- Use a clear step or section hierarchy in forms
- Make product search and line-item editing comfortable on touch screens
- Show calculation details without making the form intimidating
- Make cancellation destructive and explicit

### 5.11 Purchases and Purchase Orders

**Routes:**

- `/purchases`
- `/purchases/:purchaseId`
- `/purchase-orders`
- `/purchase-orders/new`
- `/purchase-orders/:orderId`

Requirements:

- Purchase list and filtering
- Supplier/seller information
- Bill total, paid, due, payment mode, date
- Create purchase/purchase order
- Purchase details
- Export
- View supplier/order context

Design goals:

- Emphasize due amounts and delivery/order status
- Make supplier and document number prominent
- Preserve the same visual grammar as sales while distinguishing purchase flow

### 5.12 Quotations

**Routes:** `/quotations`, `/quotations/:quotationId`

Requirements:

- Quotation list
- Create/view quotation
- Customer/product/price context
- Details and status

Design goals:

- Make draft, sent, accepted, expired, and rejected states easy to distinguish if supported by the data
- Provide a simple transition from quotation to sale/order where the existing workflow supports it

### 5.13 Finance

**Routes:**

- `/transactions`
- `/balance`
- `/payment-in`
- `/payment-out`
- `/fund-transfers`
- `/expenses`
- `/profit-loss`

Finance information includes:

- Transactions and account activity
- Account balances
- Payments in and out
- Fund transfers
- Expenses
- Revenue/cost/expense/profit views
- Outstanding receivables and payables
- Dates, firms, amounts, payment modes, categories, and references

Design goals:

- Use strong numeric hierarchy and INR formatting
- Make inflow/outflow and positive/negative states unmistakable
- Keep an audit-friendly reference/date/party/value pattern
- Use colour sparingly and supplement it with labels/icons
- Provide export/print affordances where permitted

### 5.14 Reports

**Route:** `/reports`

Requirements:

- Report selection
- Date/firm filters
- Data tables and/or charts
- Export actions

Design goals:

- Make report purpose obvious before the user opens it
- Use report cards grouped by Sales, Inventory, Purchasing, Finance, and Customers
- Show estimated data scope and selected filters
- Make exports explicit about format and scope

### 5.15 Notifications

**Route:** `/notifications`

Requirements:

- Notification list
- Read/unread state
- Date/time and source context
- Navigation to relevant module where possible

Design goals:

- Prioritize alerts that require action: low stock, due payment, failed workflow, permission changes
- Make unread status accessible beyond colour alone

### 5.16 Settings and profile

**Routes:** `/settings`, `/settings/general`, `/settings/firm`, `/settings/financial`, `/settings/inventory`, `/settings/document`, `/profile`

Requirements:

- Account/profile details
- Firm configuration
- Financial preferences
- Inventory preferences
- Document settings
- General settings
- Logout/account actions

Design goals:

- Use a stable settings sub-navigation
- Explain the impact of important settings
- Protect destructive and firm-wide controls
- Keep account settings distinct from firm settings

### 5.17 Users and Permissions

**Routes:** `/users`, `/users/:userId`

Requirements:

- User list
- Create/edit user
- Role selection
- Firm assignment/access
- Active/inactive state
- Module permission matrix
- Data scope permissions
- User details/activity

Design goals:

- Make role defaults understandable before manual overrides
- Clearly distinguish module permissions from firm/data scope
- Make “Super Admin has full access” explicit
- Prevent accidental privilege escalation
- Use progressive disclosure for the large permission matrix

---

## 6. Product catalogue source data and assets

The supplied product PDFs are authoritative source material for the product asset work.

### Parsed catalogue summary

- Firm: **Shree Vinayak Agency**
- Source date: **26 November 2026**
- Products: **90**
- Categories: **6**
- Out-of-stock rows: **9**

Category counts:

| Category | Approx. rows |
|---|---:|
| MINI | 37 |
| PVC PIPE & FITTING | 31 |
| DRIP | 17 |
| POTATO SEED | 2 |
| SPRAY PIPE | 2 |
| MINI SPRINKLER | 1 |

The repository includes the reviewable product asset bundle at:

- `design-proposals/product-assets/index.html`
- `design-proposals/product-assets/products.json`
- `design-proposals/product-assets/products.csv`
- `design-proposals/product-assets/categories.json`
- `design-proposals/product-assets/images/` — 90 SVG illustrations

The original source PDFs and ZIP bundle are stored in Google Drive:

[Vinayak ERP Product Assets - 2026-11-26](https://drive.google.com/drive/folders/1umZXJ5r0DQjmgzu2J2xFQbbAVOXCu5JK)

Important: these product assets are prepared for design/data review. The current application’s product demo dataset remains separate until an explicit implementation/import step is approved.

---

## 7. Current data and technical behavior

### Current implementation model

- React/Vite single-page application
- Data is currently local/demo-oriented, with service/store boundaries intended for future API integration
- Authentication uses local demo state and browser storage
- Several workflows use local stores and demo datasets
- No backend/API contract should be assumed by the visual designer
- The dashboard service exposes a stable shape so the data source can later be replaced

### Important UX implication

Design screens for realistic loading and asynchronous states even though the current demo often resolves locally:

- Loading/skeleton
- Empty data
- No search results
- Error state
- Permission denied
- Inactive record
- Unsaved changes
- Confirmation required
- Successful save/export
- Network/API failure in the future

### Current UI building blocks

Existing components include:

- Button variants and icon buttons
- Input, select, textarea, form fields
- Card, card header/body/footer
- Badge/status badge
- Dropdown and user menu
- Modal, drawer, confirm dialog
- Toast notifications
- Loader/skeleton states
- Data table with search, filters, pagination, and export
- Recorded table patterns for products, sales, purchases, and similar records
- Lucide icons
- Recharts charts
- Theme toggle with light/dark support

The designer should produce reusable components that map naturally to these patterns rather than separate one-off page designs.

---

## 8. Responsive requirements

The product must work for:

- Desktop operators using a large monitor/laptop
- Tablets used around a shop/warehouse
- Mobile users checking status, customers, inventory, or approvals

### Mobile requirements

- Touch targets at least approximately 44px where practical
- Global navigation becomes a drawer, sheet, or compact menu without losing module access
- Filters become a bottom sheet or stacked controls
- Tables may scroll horizontally but must keep row identity and key actions accessible
- Forms become one-column with clear section boundaries
- Product cards become two-column or one-column based on width
- Financial values remain readable without horizontal clipping
- Long product names wrap or truncate with accessible full text
- Bottom-fixed actions are allowed only when they do not cover form content
- Avoid hover-only interaction

### Tablet requirements

- Preserve card hierarchy without squeezing four dense columns into a tiny space
- Use collapsible sections for secondary information
- Keep the current firm and page title visible

---

## 9. Accessibility and interaction standards

Use the UI/UX Pro Max guidance already consulted for this project:

- Semantic headings and landmarks
- Visible keyboard focus states
- Accessible labels for icon-only controls
- Colour contrast suitable for normal text and status labels
- Do not encode meaning by colour alone
- Reduced-motion support
- Keyboard-accessible dropdowns, dialogs, drawers, and tables
- Chart summaries or text alternatives
- Clear focus order in forms
- Inline validation associated with the relevant field
- Destructive actions require confirmation
- Status badges should include text, not only colour
- Tables must retain accessible headers and row actions

---

## 10. Design system direction

The designer should define a single reusable system covering all modules.

### Tokens to deliver

- Colour roles: canvas, surface, elevated surface, text, muted text, border, primary action, success, warning, danger, info
- Pastel card tones with semantic use rules
- Typography scale and weight rules
- Spacing scale
- Border radius scale
- Shadow/elevation scale
- Focus ring
- Motion durations and reduced-motion behavior
- Breakpoints
- Table density modes
- Form/control heights

### Visual principles

- One strong primary action per section
- Large title, concise description, then the work surface
- Consistent section header pattern
- Use pastel cards to group meaning, not to decorate every element
- Use neutral surfaces behind dense data
- Keep action icons consistent across modules
- Keep product cards visually rich but operationally useful
- Avoid excessive gradients, glass effects, or decorative illustrations that compete with numbers

### Suggested component set

- Global shell/header
- Firm switcher
- Navigation item/group
- Breadcrumb/page context
- Page header
- Primary/secondary/tertiary button
- Icon button
- Filter bar and filter chip
- Metric card
- Product card
- Firm card
- Status badge
- Data table
- Detail panel
- Activity row
- Timeline
- Empty state
- Permission-denied state
- Loading skeleton
- Confirm dialog
- Form section
- Step/form footer
- Chart card
- Notification row

---

## 11. Content and localization notes

- Currency is Indian Rupees: use `₹` and Indian number grouping where appropriate.
- Dates should use an Indian-friendly format and remain unambiguous.
- Product names may be long, uppercase, abbreviated, or contain measurements such as `75MM`, `3/4"`, `4.5 MTR`, and `300 MTR`.
- Preserve source spelling in product master data unless a separate display label is intentionally introduced.
- Do not silently rename domain concepts such as Stock In, Stock Out, Payment In, Payment Out, Fund Transfers, Profit & Loss, or Price List.
- Keep copy concise and operational. Avoid generic marketing language inside transaction screens.
- Use clear labels such as “Total Due”, “Paid”, “Selling Price”, “Minimum Stock”, “Stock Status”, and “Firm”.

---

## 12. States that must be designed

Every major screen should have frames for:

1. Normal populated state
2. Loading state
3. Empty state
4. No search/filter results
5. Error state
6. Permission denied state
7. Read-only state
8. Inactive record state
9. Low-stock/out-of-stock state
10. Confirmation dialog
11. Successful save or export feedback
12. Unsaved changes / leave-page warning where applicable
13. Long-content state for product names, customer names, and table values
14. Mobile and tablet state

---

## 13. Designer deliverables requested

Please provide:

### Discovery and structure

- Short UX audit of the current app
- Sitemap/information architecture
- Primary user flows
- Permission-aware navigation map
- Dashboard information-priority recommendation

### Visual design

- Design tokens and visual system
- Desktop frames
- Tablet frames
- Mobile frames
- Login
- My Firms
- Workspace dashboard
- Product catalogue/card view
- Product detail/form
- Inventory overview and stock movement
- Sales/order form and details
- Purchase/order form and details
- Finance overview/details
- Reports
- Users/permission matrix
- Settings
- Empty/loading/error/permission states

### Interaction and handoff

- Clickable prototype for key flows
- Component variants and states
- Responsive behavior specification
- Accessibility annotations
- Developer-ready spacing, typography, and colour specs
- Asset export rules and naming
- Figma variables/components if Figma is used

---

## 14. Acceptance criteria for the design

The design is ready for implementation when:

- Every existing route and module has a mapped screen or intentional shared pattern.
- Navigation remains permission-aware and no existing workflow becomes hidden.
- The current firm is always clear.
- The dashboard has a clear first-viewport hierarchy.
- Products can be scanned visually and managed in bulk.
- Long product names, prices, stock states, and actions remain usable.
- Sales, purchase, inventory, and finance forms are consistent but not confusingly identical.
- Mobile screens are designed, not merely scaled-down desktop screens.
- All key states are documented.
- Components and tokens are reusable across modules.
- The design uses the attached references only as format inspiration and is original to Vinayak ERP.
- No feature, route, permission rule, data workflow, or module is removed as part of visual modernization.

---

## 15. Useful repository locations

- `src/App.jsx` — route composition
- `src/config/navigation.js` — canonical grouped navigation and route metadata
- `src/layouts/MainLayout/MainLayout.jsx` — current global website shell/navigation
- `src/layouts/MainLayout/MainLayout.css` — current shell styling
- `src/pages/LoginPage.jsx` — login
- `src/pages/HomePage.jsx` — My Firms
- `src/features/dashboard/pages/DashboardPage.jsx` — dashboard entry/quick access
- `src/features/products/pages/ProductsPage.jsx` — product list
- `src/features/products/components/ProductForm.jsx` — product form
- `src/features/products/pages/ProductDetailsPage.jsx` — product details
- `src/features/inventory/` — inventory workflows
- `src/features/sales/` and `src/features/sales-orders/` — sales/order workflows
- `src/features/purchases/` and `src/features/purchase-orders/` — purchase workflows
- `src/features/users/` — users and permission matrix
- `src/core/accessControl.js` — authorization rules
- `src/features/users/data/rolePermissions.js` — default role permissions
- `src/components/ui/` — shared UI primitives
- `src/components/data-table/` and `src/components/recorded/` — table patterns
- `src/styles/variables.css` — visual variables
- `design-proposals/product-assets/` — parsed catalogue and generated product illustrations

---

## 16. Demo access and review

Local demo login:

```text
Email:    admin@local.invalid
Password: demo123
Role:     Super Admin
Firm:     Shree Vinayak Agency
```

The designer should review the existing app with the Super Admin account first, then consider how a firm-scoped role and read-only role would experience the same screens.

The current branch/PR history contains a proposal and product asset bundle, but the application UI itself should only be redesigned after the design direction is approved.
