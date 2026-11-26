/**
 * Firms represented by the supplied ERP records.
 *
 * The application keeps these records in memory until an API is connected. Do
 * not add placeholder firms here: this list is the source of truth for the
 * imported business data.
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
    pinCode: '456001',
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
