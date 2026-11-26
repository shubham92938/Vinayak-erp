export const USER_ACTIVITY_TYPES = [
  { id: 'user-created', label: 'User created', variant: 'success' },
  { id: 'user-updated', label: 'User updated', variant: 'info' },
  { id: 'role-changed', label: 'Role changed', variant: 'info' },
  { id: 'permission-changed', label: 'Permission changed', variant: 'warning' },
  { id: 'account-activated', label: 'Account activated', variant: 'success' },
  { id: 'account-deactivated', label: 'Account deactivated', variant: 'warning' },
  { id: 'last-login', label: 'Last login', variant: 'info' },
]

// Activity is written by real user actions; no activity log was supplied in
// the imported ERP PDFs.
export const USER_ACTIVITY_DEMO_DATA = []
