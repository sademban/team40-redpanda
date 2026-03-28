import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import StoryCard from '../components/StoryCard'
import BeaconMessage from '../components/BeaconMessage'
import { mockMatchStory } from '../data/stories'
import { uiStrings } from '../data/content'

/**
 * MatchPage
 * Shows the matched story result after user shares their feelings.
 * Displays either:
 * 1. A story from someone else that resonates (matched)
 * 2. A "beacon" message indicating no match found but their words matter (no-match)
 * 3. Loading state while searching for a match
 */
export default function MatchPage() {
  const { state } = useLocation()
  const navigate = useNavigate()

  // Match status: 'loading' | 'matched' | 'no-match'
  const [status, setStatus] = useState('loading')
  const [story, setStory] = useState(null)

  /**
   * On mount, simulate finding a match for the user's entry.
   * If a match is found, show the story. Otherwise, show the beacon message.
   */
  useEffect(() => {
    // Redirect if no entry was provided
    if (!state?.entry) {
      navigate('/', { replace: true })
      return
    }

    // Simulate finding a match
    mockMatchStory(state.entry).then((result) => {
      if (result) {
        setStory(result)
        setStatus('matched')
      } else {
        setStatus('no-match')
      }
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Loading state: show spinning dots while searching
  if (status === 'loading') {
    return (
      <div className="page">
        <div className="content" style={{ textAlign: 'center' }}>
          <p className="text-muted" style={{ marginBottom: '24px' }}>
            {uiStrings.findingSomeone}
          </p>
          {/* Animated loading dots */}
          <div className="page-loader">
            <div className="page-loader__dot" />
            <div className="page-loader__dot" />
            <div className="page-loader__dot" />
          </div>
        </div>
      </div>
    )
  }

  // No match state: show encouraging "beacon" message
  if (status === 'no-match') {
    return (
      <div className="page">
        <div className="content">
          <BeaconMessage entry={state.entry} />
        </div>
      </div>
    )
  }

  // Matched state: show the story and action buttons
  return (
    <div className="page">
      <div className="content">
        {/* Logo */}
        <p className="wordmark fade-in" style={{ marginBottom: '24px', fontStyle: 'italic', color: 'var(--accent)', fontSize: '2rem', fontWeight: '600' }}>
          Echo
        </p>

        {/* Indicator that this is from someone else */}
        <p
          className="text-muted fade-in"
          style={{ fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '20px', fontWeight: '500' }}
        >
          {uiStrings.someoneMight}
        </p>

        {/* The matched story */}
        <StoryCard story={story} />

        {/* Call-to-action section */}
        <div style={{ marginTop: '40px' }}>
          <h2 className="display fade-in fade-in--d2" style={{ marginBottom: '28px' }}>
            Does this <span className="display--italic">resonate?</span>
          </h2>

          {/* Action buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Primary: Reach out to this person */}
            <button
              className="btn btn--primary fade-in fade-in--d2"
              style={{ width: '100%' }}
              onClick={() => navigate('/connect', { state: { entry: state.entry, storyId: story.id } })}
            >
              Reach out to this person
            </button>

            {/* Secondary: No thanks, go back */}
            <button
              className="btn btn--ghost fade-in fade-in--d3"
              style={{ width: '100%' }}
              onClick={() => navigate('/')}
            >
              That's enough for now
            </button>
          </div>
        </div>

        {/* Privacy assurance footer */}
        <p className="text-muted fade-in fade-in--d3" style={{ marginTop: '48px', textAlign: 'center', fontSize: '1.05rem' }}>
          {uiStrings.anonymous} · {uiStrings.noMessagesStored}
        </p>
      </div>
    </div>
  )
}
