import { useState } from 'react'
import { Building2, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Button, Input, useToast } from '../components/ui'
import { useAuth } from '../context/hooks'
import './LoginPage.css'

const DEMO_ACCOUNTS = [
  { label: 'Super Admin', email: 'admin@vinayak-associates.in', description: 'All firms and permissions' },
  { label: 'Firm Admin', email: 'meera@vinayak-associates.in', description: 'Vinayak Associates only' },
  { label: 'Firm Member', email: 'rohan@vinayak-associates.in', description: 'Assigned firm access' },
]

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
      setError('Enter your login ID and password')
      return
    }

    setIsSubmitting(true)
    try {
      login(email, password)
      toast.success('Signed in successfully', { description: 'Choose a firm to open its workspace.' })
      navigate('/home', { replace: true, state: { from: location.state?.from } })
    } catch (cause) {
      setError(cause?.message ?? 'Unable to sign in')
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectDemo = (account) => {
    setEmail(account.email)
    setPassword('demo123')
    setError('')
  }

  return (
    <div className="login-page">
      <div className="login-page__decor login-page__decor--one" />
      <div className="login-page__decor login-page__decor--two" />
      <main className="login-card">
        <div className="login-card__brand">
          <span className="login-card__brand-mark"><Building2 size={20} aria-hidden="true" /></span>
          <span>Vinayak <strong>ERP</strong></span>
        </div>
        <div className="login-card__heading">
          <p className="login-card__eyebrow">Secure workspace access</p>
          <h1>Welcome back</h1>
          <p>Sign in to choose a firm and continue to your ERP workspace.</p>
        </div>

        <form className="login-form" onSubmit={submit} noValidate>
          <Input
            label="Login ID / Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@firm.in"
            leadingIcon={<Mail size={16} />}
            autoComplete="username"
            required
          />
          <div className="login-form__password">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password"
              leadingIcon={<LockKeyhole size={16} />}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="login-form__password-toggle"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {error && <p className="login-form__error" role="alert">{error}</p>}
          <Button type="submit" fullWidth loading={isSubmitting}>Sign in</Button>
        </form>

        <div className="login-demo">
          <div className="login-demo__heading">
            <span>Frontend demo accounts</span>
            <small>Password: demo123</small>
          </div>
          <div className="login-demo__accounts">
            {DEMO_ACCOUNTS.map((account) => (
              <button key={account.email} type="button" className="login-demo__account" onClick={() => selectDemo(account)}>
                <span className="login-demo__account-title">{account.label}</span>
                <span className="login-demo__account-email">{account.email}</span>
                <span className="login-demo__account-description">{account.description}</span>
              </button>
            ))}
          </div>
        </div>

        <p className="login-card__note">This frontend uses mock authentication for demonstration. A secure backend should verify credentials and permissions independently.</p>
      </main>
    </div>
  )
}
