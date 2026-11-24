/**
 * Seed firms used by the frontend demo.
 *
 * The array is intentionally kept as the shared in-memory collection so the
 * existing feature services and the firm-management services all reference
 * the same records. A real API can replace firmStore.js without changing the
 * pages that consume it.
 */
export const SAMPLE_FIRMS = [
  {
    id: 'vinayak-associates',
    firmId: 'vinayak-associates',
    name: 'Vinayak Associates',
    initials: 'VA',
    businessType: 'Private Limited',
    entity: 'Private Limited',
    contactPerson: 'Aarav Mehta',
    phone: '+91-20-5555-0100',
    email: 'office@vinayak-associates.in',
    address: '104, Centrally Located Building',
    city: 'Pune',
    location: 'Pune',
    state: 'Maharashtra',
    pinCode: '411001',
    gstNumber: '27AABCV1234A1Z5',
    gst: '27AABCV1234A1Z5',
    panNumber: 'AABCV1234A',
    pan: 'AABCV1234A',
    status: 'active',
    createdAt: '2026-08-01T09:00:00.000Z',
  },
  {
    id: 'vinayak-traders',
    firmId: 'vinayak-traders',
    name: 'Vinayak Traders',
    initials: 'VT',
    businessType: 'Partnership',
    entity: 'Partnership',
    contactPerson: 'Kiran Joshi',
    phone: '+91-22-2555-0200',
    email: 'office@vinayak-traders.in',
    address: '17/A, Second Floor',
    city: 'Mumbai',
    location: 'Mumbai',
    state: 'Maharashtra',
    pinCode: '400001',
    gstNumber: '27AACCV5678B1Z4',
    gst: '27AACCV5678B1Z4',
    panNumber: 'AACCV5678B',
    pan: 'AACCV5678B',
    status: 'active',
    createdAt: '2026-08-05T09:00:00.000Z',
  },
  {
    id: 'vinayak-logistics',
    firmId: 'vinayak-logistics',
    name: 'Vinayak Logistics',
    initials: 'VL',
    businessType: 'LLP',
    entity: 'LLP',
    contactPerson: 'Vinayak Logistics Admin',
    phone: '+91-253-555-0300',
    email: 'office@vinayak-logistics.in',
    address: 'Research Wing, 2nd Floor',
    city: 'Nashik',
    location: 'Nashik',
    state: 'Maharashtra',
    pinCode: '422001',
    gstNumber: '27AAECV9012C1Z3',
    gst: '27AAECV9012C1Z3',
    panNumber: 'AAECV9012C',
    pan: 'AAECV9012C',
    status: 'active',
    createdAt: '2026-08-06T09:00:00.000Z',
  },
]

export const DEFAULT_FIRM_ID = SAMPLE_FIRMS[0].id

export function getFirmId(firm) {
  return firm?.firmId ?? firm?.id ?? null
}

export function getFirmInitials(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'F'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts.at(-1)[0]}`.toUpperCase()
}
