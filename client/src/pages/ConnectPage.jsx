import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { DELAYS, TEXT_LIMITS } from '../utils/constants'
import { uiStrings } from '../data/content'

/**
 * ConnectPage
 * Allows user to send a private message to the person whose story resonated with them.
 * Has two states:
 * 1. Message composition (before sending)
 * 2. Confirmation (after sending)
 */
export default function ConnectPage() {
  const { state } = useLocation()
  const navigate = useNavigate()

  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  /**
   * Handle message submission:
   * 1. Validate message text
   * 2. Show loading state
   * 3. Simulate sending (backend call)
   * 4. Show confirmation
   */
  const handleSend = async () => {
    if (!message.trim()) return

    setLoading(true)
    // Simulate message delivery
    await new Promise((resolve) => setTimeout(resolve, DELAYS.SEND_MESSAGE))
    setSent(true)
    setLoading(false)
  }

  // Confirmation state: show success message
  if (sent) {
    return (
      <div className="page">
        <div className="content" style={{ textAlign: 'center' }}>
          {/* Logo */}
          <p className="wordmark fade-in" style={{ fontStyle: 'italic', color: 'var(--accent)', fontSize: '2rem', fontWeight: '600' }}>Echo</p>

          {/* Success headline */}
          <h2 className="display fade-in fade-in--d1" style={{ marginBottom: '12px' }}>
            Message <span className="display--italic">sent.</span>
          </h2>

          {/* Supportive message */}
          <p className="text-muted fade-in fade-in--d2" style={{ marginBottom: '32px' }}>
            They'll see it when they're ready. Be kind to yourself.
          </p>

          {/* Return home button */}
          <button
            className="btn btn--primary fade-in fade-in--d3"
            onClick={() => navigate('/')}
            style={{ width: '100%' }}
          >
            Back home
          </button>
        </div>
      </div>
    )
  }

  // Composition state: show textarea for message
  return (
    <div className="page">
      <div className="content">
        {/* Logo */}
        <p className="wordmark fade-in" style={{ fontStyle: 'italic', color: 'var(--accent)', fontSize: '2rem', fontWeight: '600' }}>Echo</p>

        {/* Headline */}
        <h2 className="display fade-in fade-in--d1" style={{ marginBottom: '24px' }}>
          What would you <span className="display--italic">say?</span>
        </h2>

        {/* Subheadline emphasizing privacy */}
        <p className="text-muted fade-in fade-in--d2" style={{ marginBottom: '24px', fontSize: '1.25rem' }}>
          Your message is anonymous. Be honest.
        </p>

        {/* Message textarea */}
        <div className="field fade-in fade-in--d2">
          <label className="sr-only" htmlFor="message">
            Your message
          </label>
          <textarea
            id="message"
            className="field__textarea"
            rows={5}
            autoFocus
            maxLength={TEXT_LIMITS.MESSAGE_MAX_LENGTH}
            placeholder="Tell them what's on your mind..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={loading}
            style={{ resize: 'none' }}
          />

          {/* Character counter */}
          <div className="text-muted" style={{ fontSize: '0.8rem', textAlign: 'right' }}>
            {message.length} / {TEXT_LIMITS.MESSAGE_MAX_LENGTH}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Send button */}
          <button
            className="btn btn--primary fade-in fade-in--d3"
            onClick={handleSend}
            disabled={!message.trim() || loading}
            style={{ width: '100%' }}
          >
            {loading ? 'Sending…' : 'Send message'}
          </button>

          {/* Cancel button */}
          <button
            className="btn btn--ghost fade-in fade-in--d3"
            onClick={() => navigate('/')}
            style={{ width: '100%' }}
          >
            Never mind
          </button>
        </div>

        {/* Privacy assurance footer */}
        <p className="text-muted fade-in fade-in--d3" style={{ marginTop: '48px', textAlign: 'center', fontSize: '1.05rem' }}>
          {uiStrings.anonymous} · {uiStrings.wontKnowWhoYouAre}
        </p>
      </div>
    </div>
  )
}
