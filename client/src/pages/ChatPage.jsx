import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import ChatBubble from '../components/ChatBubble'
import EntryInput from '../components/EntryInput'
import { DELAYS } from '../utils/constants'

/**
 * ChatPage
 * Two-way conversation interface where users can chat with another person
 * or engage in therapeutic dialogue. Messages are displayed in a chat bubble format.
 */
export default function ChatPage() {
  const { state } = useLocation()
  const navigate = useNavigate()

  // Initialize with the other person's first message
  const [messages, setMessages] = useState([
    { id: 1, text: state?.storyText || 'Hi there.', sender: 'other' },
  ])
  const [loading, setLoading] = useState(false)

  /**
   * Handle outgoing message:
   * 1. Add user message to chat
   * 2. Show loading state
   * 3. Simulate receiving a response
   * 4. Add response to chat
   */
  const handleSend = async (text) => {
    // Add user message
    const newMessage = { id: messages.length + 1, text, sender: 'user' }
    setMessages((prev) => [...prev, newMessage])
    setLoading(true)

    // Simulate response time
    await new Promise((resolve) => setTimeout(resolve, DELAYS.CHAT_RESPONSE))
    setLoading(false)

    // Add simulated response
    setMessages((prev) => [
      ...prev,
      { id: prev.length + 1, text: 'Thanks for sharing.', sender: 'other' },
    ])
  }

  return (
    <div className="page" style={{ justifyContent: 'flex-start', paddingTop: '32px', paddingBottom: '32px' }}>
      <div className="content">
        {/* Header with logo and exit button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          {/* Logo */}
          <p className="wordmark" style={{ fontStyle: 'italic', color: 'var(--accent)', fontSize: '2rem', fontWeight: '600' }}>Echo</p>

          {/* Exit to home button */}
          <button
            className="btn btn--ghost"
            onClick={() => navigate('/')}
            style={{ padding: '8px 12px', fontSize: '0.9rem' }}
          >
            Exit
          </button>
        </div>

        {/* Chat messages area */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            marginBottom: '24px',
            minHeight: '400px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {messages.map((msg) => (
            <ChatBubble key={msg.id} message={msg.text} isUser={msg.sender === 'user'} />
          ))}
        </div>

        {/* Message input area */}
        <EntryInput onSend={handleSend} disabled={loading} />
      </div>
    </div>
  )
}
