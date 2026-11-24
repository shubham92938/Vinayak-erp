let activeFirmId = null

export function setActiveFirmId(firmId) {
  activeFirmId = firmId ?? null
}

export function getActiveFirmId() {
  return activeFirmId
}
