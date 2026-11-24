import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useToast } from '../components/ui'
import { useAuth } from '../context/hooks'
import './LoginPage.css'

function WebsiteLogo() {
  return (
    <div className="login-logo" aria-label="Vinayak Group">
      <span className="login-logo__word">vinayak<span>ग्रुप</span></span>
      <span className="login-logo__name">GROUP</span>
      <span className="login-logo__tagline">BUILT REAL... BUILT TRUE...</span>
    </div>
  )
}

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
      <header className="login-page__brand"><WebsiteLogo /></header>
      <main className="login-card">
        <h1>Login</h1>
        <form className="login-form" onSubmit={submit} noValidate>
          <label className="login-field">
            <span>Email Address</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email address"
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
      </main>
    </div>
  )
}
