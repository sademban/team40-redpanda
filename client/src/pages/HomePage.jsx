import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { entryPlaceholders } from '../data/placeholders'
import { TEXT_LIMITS, DELAYS } from '../utils/constants'
import { uiStrings } from '../data/content'

/**
 * HomePage
 * Main entry point for the app. Users share what they're feeling and get matched
 * with stories from others. This is the emotional "landing" for the healing journey.
 */
export default function HomePage() {
  const navigate = useNavigate()
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Select a random placeholder on component mount
  const [placeholder] = useState(
    () => entryPlaceholders[Math.floor(Math.random() * entryPlaceholders.length)]
  )

  // Enable submit button only if text is long enough and not already loading
  const trimmed = value.trim()
  const canSubmit = trimmed.length >= TEXT_LIMITS.ENTRY_MIN_LENGTH && !loading

  /**
   * Handle form submission:
   * 1. Validate input
   * 2. Show loading state
   * 3. Simulate finding a match
   * 4. Navigate to match results page
   */
  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return

    setError('')
    setLoading(true)

    try {
      // Simulate finding a match (like a backend call)
      await new Promise((resolve) => setTimeout(resolve, DELAYS.ENTRY_SUBMIT))
      navigate('/match', { state: { entry: trimmed } })
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }, [canSubmit, trimmed, navigate])

  /**
   * Listen for keyboard shortcut: Cmd+Enter (Mac) or Ctrl+Enter (Windows/Linux)
   * This provides a quick way to submit without clicking the button
   */
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        handleSubmit()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleSubmit])

  return (
    <div className="page">
      <div className="content">
        {/* Wordmark */}
        <p className="wordmark fade-in" style={{ fontStyle: 'italic', color: 'var(--accent)', fontSize: '2rem', fontWeight: '600' }}>Echo</p>

        {/* Headline */}
        <h1 className="display fade-in fade-in--d1" style={{ marginBottom: '20px' }}>
          How are you feeling{' '}
          <span className="display--italic">right now?</span>
        </h1>

        {/* Subline explaining the premise */}
        <p className="text-muted fade-in fade-in--d2" style={{ marginBottom: '40px', fontSize: '1.25rem', lineHeight: '1.8' }}>
          No account. No diagnosis. Just one true thing.
        </p>

        {/* Main textarea for entry */}
        <div className="field fade-in fade-in--d2">
          <label className="sr-only" htmlFor="entry">How are you feeling?</label>
          <textarea
            id="entry"
            className="field__textarea"
            rows={5}
            autoFocus
            maxLength={TEXT_LIMITS.ENTRY_MAX_LENGTH}
            placeholder={placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={loading}
            style={{ resize: 'none', fontStyle: value ? 'normal' : 'italic' }}
          />

          {/* Character counter with helpful hint */}
          <div
            className="text-muted"
            style={{ fontSize: '0.9rem', textAlign: 'right' }}
            aria-live="polite"
          >
            {value.length === 0
              ? uiStrings.pressEnterToSubmit
              : `${value.length} / ${TEXT_LIMITS.ENTRY_MAX_LENGTH}`}
          </div>
        </div>

        {/* Error message if submission fails */}
        {error && (
          <p style={{ color: '#dc2626', fontSize: '0.95rem', marginBottom: '16px' }}>
            {error}
          </p>
        )}

        {/* Submit button */}
        <button
          className="btn btn--primary fade-in fade-in--d3"
          onClick={handleSubmit}
          disabled={!canSubmit}
          style={{ width: '100%', marginTop: '16px' }}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <span className="spinner" aria-hidden="true" />
              {uiStrings.finding}
            </span>
          ) : (
            'Continue'
          )}
        </button>

        {/* Footer with privacy assurance */}
        <p className="text-muted fade-in fade-in--d3" style={{ marginTop: '48px', textAlign: 'center', fontSize: '1.05rem' }}>
          {uiStrings.anonymous} · {uiStrings.wordsHelpNext}
        </p>
      </div>
    </div>
  )
}
