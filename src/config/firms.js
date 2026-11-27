/**
 * Firms represented by the supplied ERP records.
 *
 * The application keeps these records in memory until an API is connected.
 * These local firms are intentionally synthetic demo workspaces so every
 * module can be previewed with an isolated set of records.
 */
export const SVA_FIRM_ID = 'shree-vinayak-agency'

export const SAMPLE_FIRMS = [
  {
    id: SVA_FIRM_ID,
    firmId: SVA_FIRM_ID,
    name: 'Shree Vinayak Agency',
    phone: '8989938999',
    address: 'Shop No. 136, Agar Road',
    city: 'Ujjain',
    state: 'Madhya Pradesh',
    pinCode: '456001',
    businessType: 'Irrigation & Farm Supplies',
    gstNumber: '23AABCS1234A1Z5',
    panNumber: 'AABCS1234A',
    status: 'active',
  },
  {
    id: 'indore-agro-supplies',
    firmId: 'indore-agro-supplies',
    name: 'Indore Agro Supplies',
    phone: '9826012456',
    address: 'Plot 18, Krishi Mandi Road',
    city: 'Indore',
    state: 'Madhya Pradesh',
    pinCode: '452001',
    businessType: 'Agricultural Trading',
    gstNumber: '23AABCI5678B1Z2',
    panNumber: 'AABCI5678B',
    status: 'active',
  },
  {
    id: 'malwa-irrigation-traders',
    firmId: 'malwa-irrigation-traders',
    name: 'Malwa Irrigation Traders',
    phone: '9755523456',
    address: '48 Industrial Estate, AB Road',
    city: 'Dewas',
    state: 'Madhya Pradesh',
    pinCode: '455001',
    businessType: 'Irrigation Equipment',
    gstNumber: '23AABCM9012C1Z9',
    panNumber: 'AABCM9012C',
    status: 'active',
  },
]

export const DEFAULT_FIRM_ID = SVA_FIRM_ID

export function getFirmId(firm) {
  return firm?.firmId ?? firm?.id ?? null
}

export function getFirmInitials(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'F'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts.at(-1)[0]}`.toUpperCase()
}
