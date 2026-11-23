export function togglePermission(
  permissions,
  moduleId,
  permission,
  checked,
) {
  const next = permissions ?? {}
  return {
    ...next,
    [moduleId]: {
      ...(next[moduleId] ?? {}),
      [permission]: Boolean(checked),
    },
  }
}

export function getPermissionSummary(permissions) {
  return Object.entries(permissions ?? {}).map(([moduleId, modulePermissions]) => ({
    moduleId,
    permissionCount: Object.values(modulePermissions ?? {}).filter(Boolean).length,
  }))
}
