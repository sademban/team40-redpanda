import { useEffect, useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { MoodBackground } from '../components/MoodBackground.tsx'
import { useApp } from '../contexts/AppContext'

type AuthMode = 'login' | 'register'

interface AuthLocationState {
  mode?: AuthMode
  message?: string
}

export function AuthPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, continueAsGuest, register, login, authError } = useApp()
  const state = location.state as AuthLocationState | null
  const [mode, setMode] = useState<AuthMode>(state?.mode ?? (user ? 'register' : 'login'))
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState(state?.message ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isStartingGuest, setIsStartingGuest] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  function validateEmail(value: string) {
    const trimmed = value.trim()
    if (!trimmed) return 'Email is required.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'Enter a valid email address.'
    return ''
  }

  function validatePassword(value: string) {
    if (!value) return 'Password is required.'
    if (value.length < 8) return 'Password must be at least 8 characters.'
    return ''
  }
  const isGuestSession = Boolean(user && !user.isPersistent)

  
  useEffect(() => {
    if (state?.mode) {
      setMode(state.mode)
    } else if (isGuestSession) {
      setMode('register')
    }
    
    if (state?.message) {
      setMessage(state.message)
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [isGuestSession, location.pathname, navigate, state])
  
  if (user?.isPersistent) {
    return <Navigate to="/" replace />
  }
      
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')
    setIsSubmitting(true)

    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await register(email, password)
      }

      navigate('/', { replace: true })
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Authentication failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleContinueAsGuest() {
    setError('')
    setMessage('')
    setIsStartingGuest(true)

    try {
      await continueAsGuest()
      navigate('/', { replace: true })
    } catch (guestError) {
      setError(guestError instanceof Error ? guestError.message : 'Failed to start a guest session.')
    } finally {
      setIsStartingGuest(false)
    }
  }

  return (
    <div className="page-shell">
      <MoodBackground variant="write" />
      <main className="entry-shell entry-shell--auth">
        <section className="glass-panel glass-panel--flat auth-stage">
          <p className="eyebrow auth-stage__eyebrow">Echo</p>
          <h1 className="display auth-stage__title">Arrive softly.</h1>
          <p className="section-copy auth-stage__copy">
            A quiet space to leave one true line. Browse as a guest, save your identity later.
          </p>
        </section>

        <section className="glass-panel glass-panel--flat auth-card">
          <div className="auth-card__brand">
            <div className="auth-card__mark" aria-hidden="true">
              <span className="auth-card__orb" />
            </div>
            <span className="auth-card__wordmark">Echo</span>
          </div>

          <p className="eyebrow auth-card__eyebrow">{mode === 'login' ? 'Welcome back' : 'Save this identity'}</p>
          <h1 className="auth-card__title">{mode === 'login' ? 'Sign in to keep your thread.' : 'Create a saved account.'}</h1>
          <p className="section-copy auth-card__copy">
            {isGuestSession
              ? 'You are already moving through Echo as a guest. Save this identity now if you want recovery later.'
              : mode === 'login'
              ? 'Use your saved account to recover the same conversations and return as the same person.'
              : 'Signing up upgrades a guest identity into a recoverable saved account.'}
          </p>

          <div className="account-mode-switch" role="tablist" aria-label="Authentication flow">
            <button
              aria-selected={mode === 'login'}
              className={`chip${mode === 'login' ? ' is-active' : ''}`}
              onClick={() => {
                setMode('login')
                setError('')
              }}
              type="button"
            >
              Login
            </button>
            <button
              aria-selected={mode === 'register'}
              className={`chip${mode === 'register' ? ' is-active' : ''}`}
              onClick={() => {
                setMode('register')
                setError('')
              }}
              type="button"
            >
              Sign up
            </button>
          </div>

          <form className="entry-form" onSubmit={handleSubmit}>
            <label className="field">
              <span className="field-label">Email</span>
              <input
                autoComplete="email"
                aria-invalid={Boolean(emailError)}
                className={`field__input field__input--plain${emailError ? ' field__input--invalid' : ''}`}
                disabled={isSubmitting}
                onBlur={(event) => setEmailError(validateEmail(event.target.value))}
                onChange={(event) => {
                  setEmail(event.target.value)
                  if (emailError) setEmailError('')
                }}
                placeholder="you@example.com"
                type="email"
                value={email}
              />
              {emailError ? <span className="field-inline-error">{emailError}</span> : null}
            </label>

            <label className="field">
              <span className="field-label">Password</span>
              <div className="field__password">
                <input
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  aria-invalid={Boolean(passwordError)}
                  className={`field__input field__input--plain field__input--password${passwordError ? ' field__input--invalid' : ''}`}
                  disabled={isSubmitting}
                  onBlur={(event) => setPasswordError(validatePassword(event.target.value))}
                  onChange={(event) => {
                    setPassword(event.target.value)
                    if (passwordError) setPasswordError('')
                  }}
                  placeholder="At least 8 characters"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                />
                <button
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  className="field__password-toggle"
                  disabled={isSubmitting}
                  onClick={() => setShowPassword((value) => !value)}
                  type="button"
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.066 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
              {passwordError ? <span className="field-inline-error">{passwordError}</span> : null}
            </label>

            <p className="field-note">
              {isGuestSession
                ? `You are upgrading the current guest session as ${user?.handle}.`
                : mode === 'login'
                ? 'Use your saved account to recover the same identity and conversations.'
                : 'Sign up upgrades a guest identity into a recoverable saved account.'}
            </p>
            {message ? <p className="account-feedback account-feedback--success">{message}</p> : null}
            {error || authError ? <p className="inline-error">{error || authError}</p> : null}

            <div className="action-row">
              <button className="button button--primary auth-card__submit" disabled={isSubmitting} type="submit">
                {isSubmitting ? 'Working...' : mode === 'login' ? 'Login' : 'Create account'}
              </button>
            </div>

            <div className="auth-card__guest">
              {isGuestSession ? (
                <button className="button button--ghost auth-card__guest-button" onClick={() => navigate('/')} type="button">
                  Keep browsing as guest
                </button>
              ) : (
                <>
                  <p className="field-note">Need a temporary pass first? You can stay anonymous and decide later.</p>
                  <button
                    className="button button--ghost auth-card__guest-button"
                    disabled={isStartingGuest}
                    onClick={() => void handleContinueAsGuest()}
                    type="button"
                  >
                    {isStartingGuest ? 'Starting guest...' : 'Continue as guest'}
                  </button>
                </>
              )}
            </div>
          </form>
        </section>
      </main>
    </div>
  )
}
