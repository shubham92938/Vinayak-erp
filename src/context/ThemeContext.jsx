import { useCallback, useEffect, useMemo, useState } from 'react'
import { applyTheme, getInitialTheme, isTheme, THEMES, THEME_STORAGE_KEY } from './theme'
import { ThemeContext } from './themeContext'

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    applyTheme(theme)
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {
      // Keep the in-memory selection working when persistence is unavailable.
    }
  }, [theme])

  const setAppTheme = useCallback((nextTheme) => {
    if (!isTheme(nextTheme)) return
    setTheme(nextTheme)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme((currentTheme) => (
      currentTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK
    ))
  }, [])

  const value = useMemo(() => ({
    theme,
    isDark: theme === THEMES.DARK,
    setTheme: setAppTheme,
    toggleTheme,
  }), [setAppTheme, theme, toggleTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
