import { useNavigate } from 'react-router-dom'
import { beaconContent } from '../data/content'

/**
 * BeaconMessage Component
 * Shown when no story match is found. Validates the user's input by showing it was saved
 * and that it may help someone in the future. A "beacon" for those who come later.
 *
 * @param {string} entry - The user's original entry text to display
 */
export default function BeaconMessage({ entry }) {
  const navigate = useNavigate()

  return (
    <div style={{ textAlign: 'center' }} className="fade-in">
      {/* Logo */}
      <p className="wordmark fade-in" style={{ fontStyle: 'italic', color: 'var(--accent)', fontSize: '2rem', fontWeight: '600' }}>Echo</p>

      {/* Main headline with emphasis */}
      <h1 className="display fade-in fade-in--d1" style={{ marginBottom: '16px' }}>
        Your words are{' '}
        <span className="display--italic">{beaconContent.headlineEmphasis}</span>
      </h1>

      {/* Supportive message explaining why their words matter */}
      <p
        className="text-muted fade-in fade-in--d2"
        style={{ marginBottom: '0px', fontSize: '0.95rem', lineHeight: '1.7' }}
      >
        {beaconContent.message}
      </p>

      {/* Echo the user's original entry back to them */}
      {entry && (
        <p
          className="fade-in fade-in--d2"
          style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontSize: '1rem',
            color: 'var(--fg)',
            margin: '32px auto',
            maxWidth: '360px',
            lineHeight: 1.7,
            padding: '0 16px',
          }}
        >
          "{entry}"
        </p>
      )}

      {/* Return home button */}
      <button
        className="btn btn--primary fade-in fade-in--d3"
        onClick={() => navigate('/')}
        style={{ marginTop: '24px', width: '100%' }}
      >
        {beaconContent.buttonText}
      </button>
    </div>
  )
}
