import { useState } from 'react'
import { Eye, EyeOff, UserPlus, ShieldCheck, Sparkles } from 'lucide-react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import BrandLockup from '../components/brand/BrandLockup'
import ThemeToggle from '../components/theme/ThemeToggle'
import { useToast } from '../components/ui'
import { useAuth } from '../context/hooks'
import './LoginPage.css'
import './SignupPage.css'

export default function SignupPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { isAuthenticated, register } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isAuthenticated) return <Navigate to="/home" replace />

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
    if (error) setError('')
  }

  const submit = (event) => {
    event.preventDefault()
    if (isSubmitting) return

    const name = form.name.trim()
    const email = form.email.trim().toLowerCase()
    if (name.length < 2) {
      setError('Enter your full name')
      return
    }
    if (!email || !email.includes('@')) {
      setError('Enter a valid email address')
      return
    }
    if (form.password.length < 6) {
      setError('Use a password with at least 6 characters')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsSubmitting(true)
    try {
      register({ name, email, password: form.password })
      toast.success('Account created successfully')
      navigate('/home', { replace: true })
    } catch (cause) {
      setError(cause?.message ?? 'Unable to create your account')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="login-page signup-page">
      <section className="login-page__showcase signup-page__showcase" aria-label="Vinayak ERP">
        <div className="login-page__brand"><BrandLockup tone="light" size="lg" /></div>
        <div className="login-page__showcase-copy">
          <span className="login-page__showcase-kicker"><Sparkles size={14} aria-hidden="true" /> Start with a clear workspace</span>
          <h1>Make work<br /><em>flow better.</em></h1>
          <p>Create your local Vinayak ERP account, then add or open the firms you manage from one focused workspace.</p>
          <ul className="login-page__proof-points">
            <li><ShieldCheck size={16} aria-hidden="true" /> Built for multi-firm work</li>
            <li><ShieldCheck size={16} aria-hidden="true" /> Your access stays private</li>
          </ul>
        </div>
        <div className="login-page__showcase-footer">
          <span>VINAYAK ERP</span>
          <span>ERP PLATFORM · 2026</span>
        </div>
      </section>

      <main className="login-card-shell signup-card-shell">
        <ThemeToggle className="login-card-shell__theme-toggle" />
        <div className="login-card signup-card">
          <div className="login-card__header">
            <span className="login-card__kicker"><UserPlus size={14} aria-hidden="true" /> New workspace account</span>
            <h2>Create your account</h2>
            <p>Set up your local administrator account in a few seconds.</p>
          </div>

          <form className="login-form signup-form" onSubmit={submit} noValidate>
            <label className="login-field">
              <span>Full Name</span>
              <input
                type="text"
                value={form.name}
                onChange={updateField('name')}
                placeholder="Your full name"
                autoComplete="name"
                required
              />
            </label>
            <label className="login-field">
              <span>Email Address</span>
              <input
                type="email"
                value={form.email}
                onChange={updateField('email')}
                placeholder="you@company.com"
                autoComplete="email"
                required
              />
            </label>
            <label className="login-field">
              <span>Password</span>
              <span className="login-password">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={updateField('password')}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  required
                />
                <button type="button" className="login-password__toggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </span>
            </label>
            <label className="login-field">
              <span>Confirm Password</span>
              <span className="login-password">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={updateField('confirmPassword')}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  required
                />
                <button type="button" className="login-password__toggle" onClick={() => setShowConfirmPassword((value) => !value)} aria-label={showConfirmPassword ? 'Hide confirmation password' : 'Show confirmation password'}>
                  {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </span>
            </label>

            {error && <p className="login-form__error" role="alert">{error}</p>}
            <button type="submit" className="login-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account…' : 'Create Account'}
            </button>
            <p className="signup-page__signin">Already have an account? <Link to="/login">Sign in</Link></p>
          </form>
          <p className="login-card__footnote"><ShieldCheck size={13} aria-hidden="true" /> You can create firms and manage access after signing in.</p>
        </div>
      </main>
    </div>
  )
}
