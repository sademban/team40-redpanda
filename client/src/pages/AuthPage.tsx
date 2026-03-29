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
  const isGuestSession = Boolean(user && !user.isPersistent)

  if (user?.isPersistent) {
    return <Navigate to="/" replace />
  }

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
          <p className="eyebrow auth-stage__eyebrow">Echo entry</p>
          <h1 className="display auth-stage__title">Arrive softly.</h1>
          <p className="section-copy auth-stage__copy">
            Start as a guest if you want to move lightly. Save an account when you want your
            conversations and identity to follow you.
          </p>

          <div className="auth-stage__details">
            <article className="auth-stage__detail">
              <span className="auth-stage__label">Guest first</span>
              <p>Browse, write, match, and even start a chat without committing yet.</p>
            </article>
            <article className="auth-stage__detail">
              <span className="auth-stage__label">Saved later</span>
              <p>Upgrade when you want recovery across refreshes, devices, and follow-up.</p>
            </article>
            <article className="auth-stage__detail">
              <span className="auth-stage__label">Private by default</span>
              <p>You choose when this temporary identity should become something durable.</p>
            </article>
          </div>
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
                className="field__input field__input--plain"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                type="email"
                value={email}
              />
            </label>

            <label className="field">
              <span className="field-label">Password</span>
              <input
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                className="field__input field__input--plain"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 8 characters"
                type="password"
                value={password}
              />
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
