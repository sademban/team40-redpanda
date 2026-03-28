import { timeAgo } from '../utils/formatting'

/**
 * StoryCard Component
 * Displays a story written by another user with timestamps.
 * Shows the story text in serif italic font and when it was written.
 *
 * @param {Object} story - Story object containing text and writtenAt timestamp
 */
export default function StoryCard({ story }) {
  return (
    <div className="card fade-in fade-in--d1">
      {/* Story text in serif italic for visual emphasis */}
      <p
        style={{
          fontFamily: 'var(--font-serif)',
          fontStyle: 'italic',
          fontSize: '1.1rem',
          lineHeight: 1.7,
          color: 'var(--fg)',
          marginBottom: '20px',
        }}
      >
        "{story.text}"
      </p>

      {/* Timestamp showing when story was written */}
      <p style={{ fontSize: '0.8rem', marginBottom: 0, color: 'var(--text-muted)' }}>
        Written {timeAgo(story.writtenAt)}
      </p>
    </div>
  )
}
