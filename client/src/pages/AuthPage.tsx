import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAppSession } from '../auth/session.tsx'
import { MoodBackground } from '../components/MoodBackground.tsx'

export function AuthPage() {
  const navigate = useNavigate()
  const { session, login } = useAppSession()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (session.isAuthenticated) {
    return <Navigate to={session.onboardingComplete ? '/' : '/onboarding'} replace />
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!login(username, password)) {
      setError('Use `test` for both username and password.')
      return
    }

    setError('')
    navigate('/onboarding', { replace: true })
  }

  return (
    <div className="page-shell">
      <MoodBackground variant="write" />
      <main className="entry-shell entry-shell--auth">
        <section className="glass-panel glass-panel--flat auth-card">
          <div className="auth-card__brand">
            <div className="auth-card__mark" aria-hidden="true">
              <span className="auth-card__orb" />
            </div>
            <span className="auth-card__wordmark">Echo</span>
          </div>

          <h1 className="display auth-card__title">Arrive softly.</h1>
          <p className="section-copy auth-card__copy">
            A quiet sign-in before the map opens.
          </p>

          <form className="entry-form" onSubmit={handleSubmit}>
            <label className="field">
              <span className="field-label">Username</span>
              <input
                autoComplete="username"
                className="field__input field__input--plain"
                onChange={(event) => setUsername(event.target.value)}
                placeholder="test"
                value={username}
              />
            </label>

            <label className="field">
              <span className="field-label">Password</span>
              <input
                autoComplete="current-password"
                className="field__input field__input--plain"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="test"
                type="password"
                value={password}
              />
            </label>

            <p className="field-note">Use `test` for both username and password.</p>
            {error ? <p className="inline-error">{error}</p> : null}

            <button className="button button--primary auth-card__submit" type="submit">
              Continue
            </button>
          </form>
        </section>
      </main>
    </div>
  )
}
