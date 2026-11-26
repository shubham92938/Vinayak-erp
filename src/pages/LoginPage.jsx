import { useState } from 'react'
import { Eye, EyeOff, LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import BrandLockup from '../components/brand/BrandLockup'
import ThemeToggle from '../components/theme/ThemeToggle'
import { useToast } from '../components/ui'
import { useAuth } from '../context/hooks'
import './LoginPage.css'


export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const { isAuthenticated, login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isAuthenticated) return <Navigate to="/home" replace />

  const submit = async (event) => {
    event.preventDefault()
    if (isSubmitting) return
    setError('')
    if (!email.trim() || !password) {
      setError('Enter your email address and password')
      return
    }

    setIsSubmitting(true)
    try {
      login(email, password)
      toast.success('Signed in successfully')
      navigate('/home', { replace: true, state: { from: location.state?.from } })
    } catch (cause) {
      setError(cause?.message ?? 'Unable to sign in')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <section className="login-page__showcase" aria-label="Vinayak ERP">
        <div className="login-page__brand"><BrandLockup tone="light" size="lg" /></div>
        <div className="login-page__showcase-copy">
          <span className="login-page__showcase-kicker"><Sparkles size={14} aria-hidden="true" /> Operations, made clearer</span>
          <h1>Run every firm<br /><em>with clarity.</em></h1>
          <p>One calm workspace for products, sales, purchases, and the people who keep your business moving.</p>
          <ul className="login-page__proof-points">
            <li><ShieldCheck size={16} aria-hidden="true" /> Firm-aware access</li>
            <li><ShieldCheck size={16} aria-hidden="true" /> A single source of truth</li>
          </ul>
        </div>
        <div className="login-page__showcase-footer">
          <span>VINAYAK ERP</span>
          <span>ERP PLATFORM · 2026</span>
        </div>
      </section>

      <main className="login-card-shell">
        <ThemeToggle className="login-card-shell__theme-toggle" />
        <div className="login-card">
          <div className="login-card__header">
            <span className="login-card__kicker"><LockKeyhole size={14} aria-hidden="true" /> Secure workspace</span>
            <h2>Welcome back</h2>
            <p>Sign in to continue to your workspace.</p>
          </div>
          <form className="login-form" onSubmit={submit} noValidate>
            <label className="login-field">
              <span>Email Address</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                autoComplete="username"
                required
              />
            </label>

            <label className="login-field">
              <span>Password</span>
              <span className="login-password">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="login-password__toggle"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </span>
            </label>

            {error && <p className="login-form__error" role="alert">{error}</p>}
            <button type="submit" className="login-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in…' : 'Sign In'}
            </button>
            <button
              type="button"
              className="login-forgot"
              onClick={() => toast.info('Password recovery is not connected in this demo.')}
            >
              Forgot your password?
            </button>
          </form>
          <p className="login-card__footnote"><ShieldCheck size={13} aria-hidden="true" /> Your workspace data stays scoped to your firm.</p>
        </div>
      </main>
    </div>
  )
}
