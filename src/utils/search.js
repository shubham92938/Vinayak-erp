function normalizeSearchValue(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, ' ')
    .trim()
}

export function searchMatches(query, ...values) {
  const terms = normalizeSearchValue(query).split(/\s+/).filter(Boolean)
  if (terms.length === 0) return true

  const haystack = normalizeSearchValue(values.flat(Infinity).filter(Boolean).join(' '))
  return terms.every((term) => haystack.includes(term))
}

export function searchText(...values) {
  return normalizeSearchValue(values.flat(Infinity).filter(Boolean).join(' '))
}
