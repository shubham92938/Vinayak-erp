import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../context/hooks'
import './ThemeToggle.css'

export default function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme()
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode'
  const Icon = isDark ? Sun : Moon

  return (
    <button
      type="button"
      className={['theme-toggle', className].filter(Boolean).join(' ')}
      onClick={toggleTheme}
      aria-label={label}
      aria-pressed={isDark}
      title={label}
    >
      <Icon className="theme-toggle__icon" size={15} strokeWidth={2.2} aria-hidden="true" />
      <span className="theme-toggle__label">{isDark ? 'Light' : 'Dark'}</span>
      <span className="visually-hidden"> mode</span>
    </button>
  )
}
