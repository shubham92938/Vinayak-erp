import { getFirmId, getFirmInitials, SAMPLE_FIRMS } from '../config/firms'
import { canCreateFirm, canEditFirm } from './accessControl'
import { createUser, getCurrentAuthenticatedUser } from '../features/users/services/userService'
import { getDefaultAccessPolicy } from '../features/users/data/rolePermissions'

let firms = SAMPLE_FIRMS
const listeners = new Set()

function notify() {
  listeners.forEach((listener) => listener())
}

function cloneFirm(firm) {
  return firm ? { ...firm } : null
}

function normalizeFirm(firm) {
  const id = getFirmId(firm)
  const businessType = firm.businessType ?? firm.entity ?? ''
  const city = firm.city ?? firm.location ?? ''
  const gstNumber = firm.gstNumber ?? firm.gst ?? ''
  const panNumber = firm.panNumber ?? firm.pan ?? ''

  return {
    ...firm,
    id,
    firmId: id,
    initials: firm.initials ?? getFirmInitials(firm.name),
    businessType,
    entity: businessType,
    city,
    location: city,
    gstNumber,
    gst: gstNumber,
    panNumber,
    pan: panNumber,
    status: firm.status ?? 'active',
  }
}

// Keep the compatibility aliases in the old seed records in sync.
firms = firms.map(normalizeFirm)
SAMPLE_FIRMS.splice(0, SAMPLE_FIRMS.length, ...firms)
firms = SAMPLE_FIRMS

export function subscribeToFirms(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getFirms() {
  return firms.map(cloneFirm)
}

export function getFirmById(firmId) {
  return cloneFirm(firms.find((firm) => getFirmId(firm) === firmId))
}

export function isFirmIdAvailable(firmId, excludeId = null) {
  const normalized = String(firmId ?? '').trim().toLowerCase()
  if (!normalized) return false
  return !firms.some(
    (firm) => getFirmId(firm) === normalized && getFirmId(firm) !== excludeId,
  )
}

export function isFirmNameAvailable(name, excludeId = null) {
  const normalized = String(name ?? '').trim().toLowerCase()
  if (!normalized) return false
  return !firms.some(
    (firm) =>
      getFirmId(firm) !== excludeId &&
      String(firm.name ?? '').trim().toLowerCase() === normalized,
  )
}

export function createFirm(firmData) {
  const currentUser = getCurrentAuthenticatedUser()
  if (!canCreateFirm(currentUser)) {
    throw new Error('You do not have permission to create firms')
  }

  const id = String(firmData.firmId ?? firmData.id ?? '').trim().toLowerCase()
  if (!isFirmIdAvailable(id)) {
    throw new Error('Firm ID is already in use')
  }

  const firm = normalizeFirm({
    ...firmData,
    id,
    firmId: id,
    createdAt: firmData.createdAt ?? new Date().toISOString(),
  })

  firms.push(firm)
  notify()
  return cloneFirm(firm)
}

export function updateFirm(firmId, firmData) {
  const currentUser = getCurrentAuthenticatedUser()
  if (!canEditFirm(currentUser, firmId)) {
    throw new Error('You do not have permission to edit this firm')
  }

  const index = firms.findIndex((firm) => getFirmId(firm) === firmId)
  if (index === -1) return null

  const nextId = String(firmData.firmId ?? firmData.id ?? firmId).trim().toLowerCase()
  if (nextId !== firmId && !isFirmIdAvailable(nextId, firmId)) {
    throw new Error('Firm ID is already in use')
  }

  const updated = normalizeFirm({
    ...firms[index],
    ...firmData,
    id: nextId,
    firmId: nextId,
    updatedAt: new Date().toISOString(),
  })
  firms[index] = updated
  notify()
  return cloneFirm(updated)
}

export function setFirmStatus(firmId, status) {
  return updateFirm(firmId, { status })
}

/**
 * Creates the firm and its first Firm Admin as one demo operation. There is no
 * backend transaction here, so a failed admin creation removes the just-added
 * firm before rethrowing. The boundary is deliberately kept in the service so
 * the UI never has to coordinate two independent records.
 */
export function createFirmWithAdmin(firmData, adminData) {
  const firm = createFirm(firmData)

  try {
    const access = getDefaultAccessPolicy('firm_admin')
    const admin = createUser({
      name: adminData.name,
      email: adminData.email,
      phone: adminData.phone ?? firm.phone ?? '',
      profileImage: null,
      firmId: firm.id,
      role: 'firm_admin',
      status: 'active',
      password: adminData.password,
      permissions: access.modules,
      firmPermissions: access.firmPermissions,
      dataPermissions: access.dataPermissions,
      createdAt: new Date().toISOString(),
      lastLogin: null,
    })

    return { firm, admin }
  } catch (error) {
    firms = firms.filter((entry) => getFirmId(entry) !== firm.id)
    SAMPLE_FIRMS.splice(0, SAMPLE_FIRMS.length, ...firms)
    notify()
    throw error
  }
}

export function resetFirmsForDemo() {
  // Useful for local/demo tooling without exposing mutable arrays to pages.
  firms = SAMPLE_FIRMS
  notify()
}
