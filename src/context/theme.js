export const THEME_STORAGE_KEY = 'vinayak-erp-theme'
export const THEMES = Object.freeze({
  LIGHT: 'light',
  DARK: 'dark',
})

export function isTheme(value) {
  return value === THEMES.LIGHT || value === THEMES.DARK
}

export function getInitialTheme() {
  if (typeof window === 'undefined') return THEMES.LIGHT

  try {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (isTheme(storedTheme)) return storedTheme
  } catch {
    // Storage can be unavailable in private browsing or a locked-down iframe.
  }

  try {
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches
      ? THEMES.DARK
      : THEMES.LIGHT
  } catch {
    return THEMES.LIGHT
  }
}

export function applyTheme(theme) {
  if (typeof document === 'undefined') return
  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme
}
