/**
 * ChatBubble Component
 * Displays a single message in a conversation.
 * Distinguishes between user messages (orange, right-aligned) and other messages (dark, left-aligned).
 *
 * @param {string} message - The text content of the message
 * @param {boolean} isUser - Whether this message was sent by the current user
 */
export default function ChatBubble({ message, isUser }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: '12px',
      }}
    >
      <div
        style={{
          maxWidth: '80%',
          padding: '12px 16px',
          borderRadius: '8px',
          // User messages are orange with dark text, others are dark with light text
          background: isUser ? 'var(--accent)' : '#1a1a1a',
          color: isUser ? '#000' : 'var(--fg)',
          lineHeight: '1.6',
          fontSize: '0.95rem',
          border: isUser ? 'none' : '1px solid var(--border)',
          wordWrap: 'break-word',
        }}
      >
        {message}
      </div>
    </div>
  )
}
