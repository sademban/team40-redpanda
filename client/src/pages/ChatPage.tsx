import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  getConversationMessages,
  sendConversationMessage,
} from '../lib/api'
import type {
  ConversationMessage,
  ConversationSummary,
} from '../types/chat'
import { GlassPanel } from '../components/GlassPanel'
import { PageShell } from '../components/PageShell'
import { useApp } from '../contexts/AppContext'

export function ChatPage() {
  const navigate = useNavigate()
  const { conversationId } = useParams()
  const { token, user } = useApp()

  const [conversation, setConversation] = useState<ConversationSummary | null>(null)
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const threadRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const currentToken = token
    const currentConversationId = conversationId

    if (!currentToken || !currentConversationId) {
      return
    }

    const safeToken = currentToken
    const safeConversationId = currentConversationId

    let cancelled = false

    async function loadConversation() {
      try {
        const payload = await getConversationMessages(safeToken, safeConversationId)
        if (!cancelled) {
          setConversation(payload.conversation)
          setMessages(payload.messages)
          setError(null)
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load conversation')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadConversation()
    const intervalId = window.setInterval(() => {
      void loadConversation()
    }, 5000)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
    }
  }, [conversationId, token])

  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight
    }
  }, [messages])

  if (!conversationId) {
    return <Navigate to="/account" replace />
  }

  if (!token || !user) {
    return <Navigate to="/account" replace />
  }

  const safeToken = token
  const safeConversationId = conversationId

  async function handleSendMessage() {
    const nextMessage = draft.trim()

    if (!nextMessage) {
      return
    }

    setIsSending(true)
    setError(null)

    try {
      const createdMessage = await sendConversationMessage(safeToken, safeConversationId, nextMessage)
      setMessages((current) => [...current, createdMessage])
      setDraft('')
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : 'Failed to send message')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <PageShell note="This conversation is now real and persisted by the backend." variant="chat">
      <section className="chat-page">
        {isLoading || !conversation ? (
          <GlassPanel className="chat-room" flat>
            <p className="panel-kicker">Loading</p>
            <h1 className="section-title">Pulling the conversation from the backend.</h1>
            <p className="section-copy">If the other person already answered, it will appear here.</p>
          </GlassPanel>
        ) : (
          <>
            <GlassPanel className="chat-sidebar" flat>
              <p className="panel-kicker">Conversation</p>
              <h1 className="section-title">{conversation.otherParticipant.handle}</h1>
              <p className="chat-sidebar__quote">"{conversation.story.excerpt}"</p>
              <p className="chat-sidebar__copy">
                {conversation.story.city}, {conversation.story.country} · {conversation.story.areaLabel}
              </p>
              <p className="entry-pill entry-pill--soft">
                Story: {conversation.story.city} · {conversation.story.areaLabel}
              </p>
              <button className="button button--secondary" onClick={() => navigate('/account')} type="button">
                Back to inbox
              </button>
            </GlassPanel>

            <GlassPanel className="chat-room" flat>
              <div className="chat-room__header">
                <p className="panel-kicker">
                  {messages.length > 0 ? `${messages.length} messages` : 'No messages yet'}
                </p>
                <h2 className="section-title">Chat</h2>
              </div>

              {error ? <p className="account-feedback account-feedback--error">{error}</p> : null}

              <div className="chat-thread" ref={threadRef}>
                {messages.length > 0 ? (
                  messages.map((message) => {
                    const sender = message.senderId === user.id ? 'you' : 'them'

                    return (
                      <div
                        className={`chat-message chat-message--${sender}`}
                        key={message.id}
                      >
                        <p>{message.text}</p>
                      </div>
                    )
                  })
                ) : (
                  <p className="section-copy">No one has written yet. Start with one true line.</p>
                )}
              </div>

              <div className="chat-composer">
                <label className="field">
                  <span className="sr-only">Write a message</span>
                  <textarea
                    className="field__textarea"
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault()
                        void handleSendMessage()
                      }
                    }}
                    placeholder="Write back softly. Press Enter to send, Shift+Enter for a new line."
                    value={draft}
                  />
                </label>

                <div className="action-row">
                  <button
                    className="button button--primary"
                    disabled={isSending}
                    onClick={() => void handleSendMessage()}
                    type="button"
                  >
                    {isSending ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </div>
            </GlassPanel>
          </>
        )}
      </section>
    </PageShell>
  )
}
