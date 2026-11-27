# Stability test data

The website includes an opt-in synthetic-data mode for exercising populated ERP screens without changing the normal empty/demo data boundary.

## Start it

Run the dev server and open:

```text
http://localhost:5173/home?stability=1
```

The query flag persists in browser storage so navigation continues to use the same fixture data. A yellow banner identifies the mode. Use the banner close button, or open any route with `?stability=0`, to disable it and reload the app.

## Covered fixture cases

- 12 products across six categories
- In-stock, low-stock, out-of-stock, inactive, untracked, zero-price, and long-name products
- Product card/table views, filters, export, detail routes, and delete confirmation
- Four customers with dealer, regular, inactive, long-name, email, and outstanding-balance cases
- Purchases with paid and partially-paid states
- Sales orders with processing and completed states
- Expenses with paid and draft states
- Accounts and transaction rows with positive and negative values
- Unread/read notifications
- Stock-in, stock-out, and adjustment history

## What to check manually

1. Open `/home?stability=1`, search and switch between firms/workspace.
2. Open the workspace dashboard and check cards, tables, alerts, and quick actions.
3. Open Products, switch between card/table views, filter by category/status/stock, and open details.
4. Open Inventory, Customers, Purchases, Sales Orders, Expenses, Transactions, Notifications, and Reports.
5. Test narrow mobile widths, long names, empty search results, inactive rows, disabled actions, dialogs, exports, and back navigation.
6. Log in as a read-only or firm-scoped user and verify that fixture data remains permission-filtered.

All fixture records are marked in code as synthetic stability-test data and are not uploaded to Google Drive or sent to external services.
