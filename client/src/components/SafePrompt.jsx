import { useNavigate } from 'react-router-dom'
import { safePromptContent } from '../data/content'

/**
 * SafePrompt Component
 * Crisis intervention banner that appears when users need help.
 * Provides immediate access to crisis resources with a prominent call-to-action.
 */
export default function SafePrompt() {
  const navigate = useNavigate()

  return (
    <div
      className="card fade-in fade-in--d1"
      style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)',
        borderColor: 'var(--accent)',
        marginBottom: '32px',
      }}
    >
      {/* Crisis alert title */}
      <h3 style={{ color: 'var(--accent)', marginBottom: '12px' }}>
        {safePromptContent.title}
      </h3>

      {/* Supportive message */}
      <p style={{ fontSize: '0.95rem', lineHeight: '1.7', marginBottom: '16px' }}>
        {safePromptContent.message}
      </p>

      {/* Link to crisis resources page */}
      <button
        className="btn btn--secondary"
        onClick={() => navigate('/crisis')}
        style={{
          width: '100%',
          background: 'transparent',
          border: '1.5px solid var(--accent)',
          color: 'var(--accent)',
        }}
      >
        {safePromptContent.buttonText}
      </button>
    </div>
  )
}
