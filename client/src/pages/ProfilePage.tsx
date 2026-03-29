import { useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { PageShell } from '../components/PageShell'
import { GlassPanel } from '../components/GlassPanel'
import { findSupportedLocation, supportedLocations } from '../data/locations.ts'
import { useAppSession } from '../auth/session.tsx'

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function ProfilePage() {
  const navigate = useNavigate()
  const { logout, resetOnboarding, session, updateProfile } = useAppSession()
  const profile = session.profile
  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState(profile?.displayName ?? '')
  const [city, setCity] = useState(profile?.city ?? '')
  const [error, setError] = useState('')

  const selectedLocation = useMemo(() => findSupportedLocation(city), [city])

  if (!session.isAuthenticated) {
    return <Navigate to="/auth" replace />
  }

  if (!session.onboardingComplete || !profile) {
    return <Navigate to="/onboarding" replace />
  }

  function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!displayName.trim()) {
      setError('Add the name you want Echo to show.')
      return
    }

    if (!selectedLocation) {
      setError('Choose one of the supported cities so your map marker stays grounded.')
      return
    }

    updateProfile({
      username: session.username ?? 'test',
      displayName: displayName.trim(),
      city: selectedLocation.city,
      country: selectedLocation.country,
      lat: selectedLocation.lat,
      lng: selectedLocation.lng,
    })
    setError('')
    setIsEditing(false)
  }

  function handleResetOnboarding() {
    resetOnboarding()
    navigate('/auth', { replace: true })
  }

  function handleLogout() {
    logout()
    navigate('/auth', { replace: true })
  }

  return (
    <PageShell note="Only what the map needs to know about you." variant="about">
      <section className="profile-page">
        <GlassPanel className="profile-summary" flat>
          <div className="profile-summary__header">
            <div className="profile-avatar profile-avatar--large" aria-hidden="true">
              <span>{getInitials(profile.displayName)}</span>
            </div>

            <div className="profile-summary__identity">
              <p className="panel-kicker">Profile</p>
              <h1 className="section-title">{profile.displayName}</h1>
              <p className="profile-summary__username">@{profile.username}</p>
            </div>
          </div>

          <div className="profile-summary__chips">
            <span className="soft-badge">{profile.city}</span>
            <span className="soft-badge">{profile.country}</span>
          </div>

          <p className="section-copy">
            Your location is only used to place a soft personal marker on the map.
          </p>

          <div className="action-row">
            <button className="button button--primary" onClick={() => setIsEditing(true)} type="button">
              Edit profile
            </button>
            <button className="button button--secondary" onClick={handleResetOnboarding} type="button">
              Reset onboarding
            </button>
            <button className="button button--ghost" onClick={handleLogout} type="button">
              Log out
            </button>
          </div>
        </GlassPanel>

        <GlassPanel className="profile-editor" flat>
          <p className="panel-kicker">{isEditing ? 'Edit quietly' : 'Stored details'}</p>
          <h2 className="section-title">
            {isEditing ? 'Update how Echo holds your place.' : 'Your current setup'}
          </h2>

          {isEditing ? (
            <form className="entry-form" onSubmit={handleSave}>
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

              {error ? <p className="inline-error">{error}</p> : null}

              <div className="action-row">
                <button className="button button--primary" type="submit">
                  Save changes
                </button>
                <button
                  className="button button--secondary"
                  onClick={() => {
                    setDisplayName(profile.displayName)
                    setCity(profile.city)
                    setError('')
                    setIsEditing(false)
                  }}
                  type="button"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-editor__readout">
              <div className="profile-readout-row">
                <span className="field-label">Display name</span>
                <span>{profile.displayName}</span>
              </div>
              <div className="profile-readout-row">
                <span className="field-label">Username</span>
                <span>@{profile.username}</span>
              </div>
              <div className="profile-readout-row">
                <span className="field-label">City</span>
                <span>{profile.city}</span>
              </div>
              <div className="profile-readout-row">
                <span className="field-label">Country</span>
                <span>{profile.country}</span>
              </div>
            </div>
          )}
        </GlassPanel>
      </section>
    </PageShell>
  )
}
