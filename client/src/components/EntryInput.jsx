/**
 * EntryInput Component
 * Reusable textarea input with submit button for composing messages or entries.
 * Supports keyboard shortcuts (Cmd+Enter or Ctrl+Enter) for quick submission.
 *
 * @param {string} value - Current text value
 * @param {function} onChange - Callback when text changes
 * @param {function} onSend - Callback when submit button is clicked or keyboard shortcut triggered
 * @param {boolean} loading - Whether a request is in progress (disables submission)
 */
export default function EntryInput({ value = '', onChange, onSend, loading }) {
  /**
   * Validates text and calls the onSend callback.
   * Clears the input after sending if onChange handler exists.
   */
  const handleSubmit = () => {
    if (value.trim()) {
      onSend(value)
      // Clear the input after sending
      if (onChange) onChange('')
    }
  }

  /**
   * Detect keyboard shortcut: Cmd+Enter (Mac) or Ctrl+Enter (Windows/Linux)
   */
  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit()
    }
  }

  return (
    <div className="field">
      {/* Textarea for message composition */}
      <textarea
        className="field__textarea"
        placeholder="What's on your mind?"
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={loading}
        rows="4"
        style={{
          fontSize: '0.95rem',
          paddingTop: '12px',
          paddingBottom: '12px',
          resize: 'none',
        }}
      />

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
        <button
          className="btn btn--primary"
          onClick={handleSubmit}
          disabled={!value.trim() || loading}
          style={{ flex: 1 }}
        >
          {loading ? 'Sending…' : 'Send'}
        </button>
      </div>
    </div>
  )
}
