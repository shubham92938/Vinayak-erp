export const USER_ACTIVITY_TYPES = [
  { id: 'user-created', label: 'User created', variant: 'success' },
  { id: 'user-updated', label: 'User updated', variant: 'info' },
  { id: 'role-changed', label: 'Role changed', variant: 'info' },
  { id: 'permission-changed', label: 'Permission changed', variant: 'warning' },
  { id: 'account-activated', label: 'Account activated', variant: 'success' },
  { id: 'account-deactivated', label: 'Account deactivated', variant: 'warning' },
  { id: 'last-login', label: 'Last login', variant: 'info' },
]

export const USER_ACTIVITY_DEMO_DATA = [
  { id: 'activity-01', type: 'user-created', userId: 'user-02', targetUserId: 'user-02', actorId: 'user-01', targetName: 'Meera Patel', actorName: 'Vinayak Associates Admin', createdAt: '2026-08-01T09:20:00' },
  { id: 'activity-02', type: 'user-created', userId: 'user-03', targetUserId: 'user-03', actorId: 'user-01', targetName: 'Rohan Sharma', actorName: 'Vinayak Associates Admin', createdAt: '2026-08-20T10:35:00' },
  { id: 'activity-03', type: 'role-changed', userId: 'user-05', targetUserId: 'user-05', actorId: 'user-02', targetName: 'Vicky Desai', actorName: 'Meera Patel', createdAt: '2026-10-14T14:00:00' },
  { id: 'activity-04', type: 'permission-changed', userId: 'user-07', targetUserId: 'user-07', actorId: 'user-02', targetName: 'Sunita More', actorName: 'Meera Patel', createdAt: '2026-11-03T09:30:00' },
  { id: 'activity-05', type: 'account-activated', userId: 'user-09', targetUserId: 'user-09', actorId: 'user-02', targetName: 'Tanuja Desai', actorName: 'Meera Patel', createdAt: '2026-11-06T11:10:00' },
  { id: 'activity-06', type: 'account-deactivated', userId: 'user-10', targetUserId: 'user-10', actorId: 'user-02', targetName: 'Vinayak Traders Manager', actorName: 'Meera Patel', createdAt: '2026-11-12T15:45:00' },
  { id: 'activity-07', type: 'last-login', userId: 'user-01', targetUserId: null, actorId: 'user-01', targetName: 'Vinayak Associates Admin', actorName: 'Vinayak Associates Admin', createdAt: '2026-11-21T09:20:00' },
  { id: 'activity-08', type: 'user-updated', userId: 'user-11', targetUserId: 'user-11', actorId: 'user-11', targetName: 'Vinayak Logistics Admin', actorName: 'Vinayak Logistics Admin', createdAt: '2026-11-19T18:30:00' },
]
