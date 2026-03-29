import { useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAppSession } from '../auth/session.tsx'
import { MoodBackground } from '../components/MoodBackground.tsx'
import { findSupportedLocation, supportedLocations } from '../data/locations.ts'

export function OnboardingPage() {
  const navigate = useNavigate()
  const { completeOnboarding, session } = useAppSession()
  const [displayName, setDisplayName] = useState(session.profile?.displayName ?? '')
  const [city, setCity] = useState(session.profile?.city ?? '')
  const [error, setError] = useState('')

  const selectedLocation = useMemo(() => findSupportedLocation(city), [city])

  if (!session.isAuthenticated) {
    return <Navigate to="/auth" replace />
  }

  if (session.onboardingComplete) {
    return <Navigate to="/" replace />
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!displayName.trim()) {
      setError('Add the name you want Echo to show.')
      return
    }

    if (!selectedLocation) {
      setError('Choose one of the supported cities so we can place you on the map.')
      return
    }

    completeOnboarding({
      username: session.username ?? 'test',
      displayName: displayName.trim(),
      city: selectedLocation.city,
      country: selectedLocation.country,
      lat: selectedLocation.lat,
      lng: selectedLocation.lng,
    })
    navigate('/', { replace: true })
  }

  return (
    <div className="page-shell">
      <MoodBackground variant="about" />
      <main className="entry-shell entry-shell--onboarding">
        <section className="glass-panel glass-panel--flat onboarding-card">
          <div className="onboarding-card__intro">
            <p className="eyebrow">Onboarding</p>
            <h1 className="display onboarding-card__title">Let the map hold your place.</h1>
            <p className="section-copy onboarding-card__copy">
              This stays minimal. Your location is only used to place you softly on the map.
            </p>
          </div>

          <form className="entry-form" onSubmit={handleSubmit}>
            <label className="field">
              <span className="field-label">Username</span>
              <input
                className="field__input field__input--plain field__input--readonly"
                readOnly
                value={session.username ?? 'test'}
              />
            </label>

            <label className="field">
              <span className="field-label">Display name</span>
              <input
                className="field__input field__input--plain"
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="How should Echo know you?"
                value={displayName}
              />
            </label>

            <label className="field">
              <span className="field-label">City</span>
              <select
                className="field__select"
                onChange={(event) => setCity(event.target.value)}
                value={city}
              >
                <option value="">Choose a city</option>
                {supportedLocations.map((location) => (
                  <option key={`${location.city}-${location.country}`} value={location.city}>
                    {location.city}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span className="field-label">Country</span>
              <input
                className="field__input field__input--plain field__input--readonly"
                readOnly
                value={selectedLocation?.country ?? ''}
              />
            </label>

            <p className="field-note">Used only to show where you are on the map.</p>
            {error ? <p className="inline-error">{error}</p> : null}

            <div className="action-row">
              <button className="button button--primary" type="submit">
                Enter Echo
              </button>
            </div>
          </form>
        </section>

        <section className="glass-panel onboarding-preview">
          <p className="panel-kicker">What this does</p>
          <h2 className="section-title">A small place marker, nothing louder.</h2>
          <p className="section-copy">
            You will appear softly on the map so the app can feel like it belongs to a person, not just a set of stories.
          </p>

          <div className="onboarding-preview__chips">
            <span className="soft-badge">{displayName.trim() || 'Your name'}</span>
            <span className="soft-badge">
              {selectedLocation ? `${selectedLocation.city}, ${selectedLocation.country}` : 'Your city'}
            </span>
          </div>
        </section>
      </main>
    </div>
  )
}
